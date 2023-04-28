import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ObjectSigningStack } from "../../workload-object-signing/object-signing-stack";

const app = new cdk.App();

// tags for our stacks
const tags = {
  "umccr-org:Stack": "ElsaDataObjectSigning",
  "umccr-org:Product": "ElsaData",
};

const description =
  "Object signing users/secrets/policies for Elsa Data - an application for controlled genomic data sharing";

new ObjectSigningStack(app, "ElsaDataLocalDevTestObjectSigningStack", {
  // the pipeline can only be deployed to UMCCR 'dev'
  env: {
    account: "843407916570",
    region: "ap-southeast-2",
  },
  tags: tags,
  isDevelopment: true,
  description: description,
  iamSerial: 1,
  dataBucketPaths: {
    "umccr-10c-data-dev": ["*"],
    "umccr-10f-data-dev": ["*"],
    "umccr-10g-data-dev": ["*"],
  },
  secretsPrefix: "ElsaData", // pragma: allowlist secret
});

new ObjectSigningStack(
  app,
  "ElsaDataAustralianGenomicsDemoObjectSigningStack",
  {
    // the pipeline can only be deployed to 'ag'
    // it restricts the permissions to only a bucket that is suitable for demonstrations
    env: {
      account: "602836945884",
      region: "ap-southeast-2",
    },
    tags: tags,
    isDevelopment: false,
    description: description,
    iamSerial: 1,
    dataBucketPaths: {
      "elsa-test-data": ["FLAGSHIP_A/*"],
    },
    secretsPrefix: "ElsaData", // pragma: allowlist secret
  }
);

new ObjectSigningStack(app, "ElsaDataAustralianGenomicsObjectSigningStack", {
  // the pipeline can only be deployed to 'ag'
  env: {
    account: "602836945884",
    region: "ap-southeast-2",
  },
  tags: tags,
  isDevelopment: false,
  description: description,
  iamSerial: 1,
  dataBucketPaths: {
    // until security reviewed we don't want to allow any actual signing
    "agha-gdr-store-2.0": ["NOT_ENABLED/*"],
  },
  secretsPrefix: "ElsaData", // pragma: allowlist secret
});
