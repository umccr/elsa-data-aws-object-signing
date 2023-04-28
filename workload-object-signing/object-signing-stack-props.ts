import { StackProps } from "aws-cdk-lib";

export interface ObjectSigningStackProps extends StackProps {
  /**
   * A master control switch that tells us that this infrastructure is destined
   * for an environment that contains only development data. This will
   * control whether databases and buckets 'auto-delete' (for instance). It
   * may change the visibility of some resources (RDS instances) - but should in
   * no way expose any resource insecurely (i.e. they will still need passwords
   * even if the database is in a public subnet).
   *
   * The default assumption if this is not present is that all infrastructure
   * is as locked down as possible.
   */
  isDevelopment?: boolean;

  /**
   * The description of the infrastructure as used for the CloudFormation stack.
   * This gives devops an immediate feedback on the purpose of the stack so
   * should be descriptive of the service/project.
   * "Infrastructure for Blah - an application used to discover novel variants"
   */
  description: string;

  /**
   * A manually incrementing number that will rotate IAM users.
   */
  iamSerial: number;

  /**
   * Bucket paths. For each bucket that we want this object signer to work with, we list
   * the Keys within that bucket as wildcards. This goes to setting the precise S3
   * read permissions for the IAM user.
   * e.g.
   *  {
   *    "my-bucket": [ "Cardiac2022/*", "Mito/*manifest.txt" ]
   *  }
   */
  readonly dataBucketPaths: { [bucket: string]: string[] };

  /**
   * A prefix that is used for constructing any AWS secrets (i.e. postgres password)
   * If empty - the default AWS naming is used (which are decent names
   * but possibly uninformative of which postgres for instance). Eg we might end
   * up with 5 RdsSecretXYZ, RdsSecretAbc.. this allows to make
   * MyAppRdsSecretXYZ
   * this also helps out by allowing us to make wildcard secret policies that
   * encompass all secrets with the prefix
   */
  secretsPrefix?: string;
}
