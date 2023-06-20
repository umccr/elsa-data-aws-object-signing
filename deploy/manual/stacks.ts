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
  // this stack can only be deployed to UMCCR 'dev'
  env: {
    account: "843407916570",
    region: "ap-southeast-2",
  },
  tags: tags,
  isDevelopment: true,
  infrastructureStackName: "ElsaDataLocalDevTestInfrastructureStack",
  description: description,
  s3: {
    iamSerial: 2,
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
});

/**
 * Australian Genomics DEMO
 */
new ObjectSigningStack(
  app,
  "ElsaDataDemoAustralianGenomicsObjectSigningStack",
  {
    // this stack can only be deployed to 'ag'
    // it restricts the permissions to only buckets that are suitable for demonstrations
    env: {
      account: "602836945884",
      region: "ap-southeast-2",
    },
    tags: tags,
    isDevelopment: false,
    infrastructureStackName:
      "ElsaDataDemoAustralianGenomicsInfrastructureStack",
    description: description,
    s3: {
      iamSerial: 2,
      dataBucketPaths: {
        "elsa-test-data": ["FLAGSHIP_A/*"],
        "elsa-data-demo-agha-gdr-store": ["*"],
      },
    },
    gcs: {
      bucket: "abucket",
    },
    cloudFlare: {
      bucket: "abucket",
    },
    secretsPrefix: "ElsaDataDemo", // pragma: allowlist secret
  }
);

/**
 * Australian Genomics PRODUCTION
 */
new ObjectSigningStack(app, "ElsaDataAustralianGenomicsObjectSigningStack", {
  // this stack can only be deployed to 'ag'
  env: {
    account: "602836945884",
    region: "ap-southeast-2",
  },
  tags: tags,
  isDevelopment: false,
  infrastructureStackName: "ElsaDataAustralianGenomicsInfrastructureStack",
  description: description,
  s3: {
    iamSerial: 1,
    dataBucketPaths: {
      // until security reviewed we don't want to allow any actual signing so this path is nonsense
      "agha-gdr-store-2.0": ["NOT_ENABLED/*"],
    },
  },
  secretsPrefix: "ElsaData", // pragma: allowlist secret
});
