import "source-map-support/register";
import { ObjectSigningStack } from "aws-object-signing-sharer";
import { App, Aspects } from "aws-cdk-lib";
import { AwsSolutionsChecks } from "cdk-nag";

const app = new App();

// enable to see some pretty harsh nags
// Aspects.of(app).add(new AwsSolutionsChecks({ verbose: false }));

// tags for our stacks
const tags = {
  "umccr-org:Stack": "ElsaDataObjectSigning",
  "umccr-org:Product": "ElsaData",
};

const description =
  "Object signing users/secrets/policies for Elsa Data - an application for controlled genomic data sharing";

new ObjectSigningStack(
  app,
  "ElsaDataDevObjectSigningStack",
  {
    // this stack can only be deployed to UMCCR 'dev'
    env: {
      account: "843407916570",
      region: "ap-southeast-2",
    },
    tags: tags,
    description: description,
  },
  {
    infrastructureStackName: "ElsaDataDevInfrastructureStack",
    s3: {
      iamSerial: 1,
      dataBucketPaths: {
        "umccr-10c-data-dev": ["*"],
        "umccr-10f-data-dev": ["*"],
        "umccr-10g-data-dev": ["*"],
      },
    },
    gcs: {
      bucket: "abucket",
    },
    cloudFlare: {
      bucket: "abucket",
    },
    secretsPrefix: "ElsaData", // pragma: allowlist secret
  }
);
