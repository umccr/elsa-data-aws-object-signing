import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ObjectSigningStackProps } from "./object-signing-stack-props";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import {
  AccessKey,
  AccessKeyStatus,
  Effect,
  PolicyStatement,
  User,
} from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";

/**
 * A basic infrastructure stack that creates an IAM user
 * specifically for long term (multi day) object signing.
 */
export class ObjectSigningStack extends Stack {
  constructor(scope: Construct, id: string, props: ObjectSigningStackProps) {
    super(scope, id, props);

    this.templateOptions.description = props.description;

    const user = new User(this, "User", {});

    // read-only policies at the bucket level (possibly not needed at all - revisit)
    user.addToPolicy(
      new PolicyStatement({
        sid: "ReadBucketLevel",
        effect: Effect.ALLOW,
        resources: Object.keys(props.dataBucketPaths).map(
          (k) => `arn:aws:s3:::${k}`
        ),
        actions: ["s3:GetBucketLocation"],
      })
    );

    // read only policies at the object level include all the key paths passed in
    // for every bucket
    const res: string[] = [];
    for (const [b, keys] of Object.entries(props.dataBucketPaths)) {
      for (const k of keys) {
        res.push(`arn:aws:s3::::${b}/${k}`);
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
      serial: props.iamSerial,
      status: AccessKeyStatus.ACTIVE,
    });
    const secret = new Secret(this, `${props.secretsPrefix || ""}Secret`, {
      secretStringValue: accessKey.secretAccessKey,
    });

    new StringParameter(this, "AccessKeyIdParameter", {
      parameterName: `/${id}/AccessKey/id`,
      stringValue: accessKey.accessKeyId,
    });

    new StringParameter(this, "AccessKeySecretNameParameter", {
      parameterName: `/${id}/AccessKey/secretName`,
      stringValue: secret.secretName,
    });
  }
}
