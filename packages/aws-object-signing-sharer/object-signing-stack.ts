import { CfnOutput, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { ObjectSigningStackProps } from "./object-signing-stack-props";
import {
  AccessKey,
  AccessKeyStatus,
  Effect,
  PolicyStatement,
  User,
} from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { Service } from "aws-cdk-lib/aws-servicediscovery";
import { Construct } from "constructs";
import { InfrastructureClient } from "@elsa-data/aws-infrastructure-client";

/**
 * For JSII we need to export these property interfaces.
 */
export {
  ObjectSigningStackProps,
  GCSProps,
  S3Props,
  CloudFlareProps,
} from "./object-signing-stack-props";

/**
 * A stack that creates an IAM user
 * specifically for long term (multi day) object signing. It registers
 * this user into the Elsa Data namespace for discovery. If asked it was also
 * create secrets for use in signing GCS and CloudFlare (that is, to have an Elsa
 * running in AWS but able to sign GCS/CloudFlare urls)
 */
export class ObjectSigningStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps,
    objectSigningProps: ObjectSigningStackProps
  ) {
    super(scope, id, props);

    this.templateOptions.description = props.description;

    // our client unlocks the ability to fetch/create CDK objects that match our
    // installed infrastructure stack (by infrastructure stack name)
    const infraClient = new InfrastructureClient(
      objectSigningProps.infrastructureStackName
    );

    const namespace = infraClient.getNamespaceFromLookup(this);

    // each type of Elsa Data egress registers as a service
    const service = new Service(this, "Service", {
      namespace: namespace,
      name: "ObjectSigning",
      description: "Object signing service",
    });

    const outputAttributes: { [key: string]: string } = {};

    // if we want to enable S3 - then we take the responsibility for creating the signing user

    if (objectSigningProps.s3) {
      // we need a user to exist with the correct (limited) permissions
      const user = new User(this, "User", {});

      // read-only policies at the bucket level (possibly not needed at all - revisit)
      user.addToPolicy(
        new PolicyStatement({
          sid: "ReadBucketLevel",
          effect: Effect.ALLOW,
          resources: Object.keys(objectSigningProps.s3.dataBucketPaths).map(
            (k) => `arn:aws:s3:::${k}`
          ),
          actions: ["s3:GetBucketLocation"],
        })
      );

      // read only policies at the object level include all the key paths passed in
      // for every bucket
      const res: string[] = [];
      for (const [b, keys] of Object.entries(
        objectSigningProps.s3.dataBucketPaths
      )) {
        for (const k of keys) {
          res.push(`arn:aws:s3:::${b}/${k}`);
        }
      }

      user.addToPolicy(
        new PolicyStatement({
          sid: "ReadObjectLevel",
          effect: Effect.ALLOW,
          resources: res,
          actions: ["s3:GetObject", "s3:GetObjectTagging"],
        })
      );

      const accessKey = new AccessKey(this, "AccessKey", {
        user,
        serial: objectSigningProps.s3.iamSerial,
        status: AccessKeyStatus.ACTIVE,
      });

      const secret = new Secret(
        this,
        `${objectSigningProps.secretsPrefix || ""}S3ObjectSigningSecret`,
        {
          description:
            "Secret containing the access key for an AWS IAM user who does Elsa Data object signing",
          secretObjectValue: {
            accessKeyId: SecretValue.unsafePlainText(accessKey.accessKeyId),
            secretAccessKey: accessKey.secretAccessKey,
          },
        }
      );

      outputAttributes["s3AccessKeySecretName"] = secret.secretName;

      new CfnOutput(this, "S3SecretOutput", {
        exportName: "S3ObjectSigningSecret",
        value: secret.secretName,
      });
    }

    // for GCS - we cannot create the users - but we can manage the registration of the secret that will hold
    // their credentials

    if (objectSigningProps.gcs) {
      const secret = new Secret(
        this,
        `${objectSigningProps.secretsPrefix || ""}GcsObjectSigningSecret`,
        {
          description:
            "Secret containing the JSON credentials for a Google Service Account that does Elsa Data object signing",
          secretObjectValue: {
            type: SecretValue.unsafePlainText("e.g. service_account"),
            universe_domain: SecretValue.unsafePlainText("e.g googleapis.com"),
            private_key: SecretValue.unsafePlainText(
              "THIS WHOLE SECRET SHOULD BE REPLACED WITH A JSON SERVICE ACCOUNT CREDENTIAL"
            ),
          },
        }
      );

      outputAttributes["gcsServiceAccountJsonSecretName"] = secret.secretName;

      new CfnOutput(this, "GcsSecretOutput", {
        exportName: "GcsObjectSigningSecret",
        value: secret.secretName,
      });
    }

    // similarly for CloudFlare - we cannot create the API tokens - but we can manage the registration of the secret that will hold
    // them

    if (objectSigningProps.cloudFlare) {
      const secret = new Secret(
        this,
        `${objectSigningProps.secretsPrefix || ""}R2ObjectSigningSecret`,
        {
          description:
            "Secret containing an API token for CloudFlare that does Elsa Data object signing",
          secretObjectValue: {
            accessKeyId: SecretValue.unsafePlainText("TO BE REPLACED"),
            secretAccessKey: SecretValue.unsafePlainText("TO BE REPLACED"),
          },
        }
      );

      outputAttributes["r2ApiTokenSecretName"] = secret.secretName;

      new CfnOutput(this, "R2SecretOutput", {
        exportName: "R2ObjectSigningSecret",
        value: secret.secretName,
      });
    }

    service.registerNonIpInstance("IamUser", {
      customAttributes: outputAttributes,
    });
  }
}
