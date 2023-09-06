export interface S3Props {
  /**
   * A manually incrementing number that will rotate IAM users.
   */
  readonly iamSerial?: number;

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
}

export interface GCSProps {
  /**
   * The name of the bucket in GCS we want to share - currently ignored - this is set inside GCP
   */
  readonly bucket: string;
}

export interface CloudFlareProps {
  /**
   * The name of the bucket in CloudFlare we want to share - currently ignored - this is set by CloudFlare
   */
  readonly bucket: string;
}

export interface ObjectSigningStackProps {
  /**
   * The name of a previously installed stack providing us with network/db/storage/cert infrastructure
   * via cloud formation exports.
   */
  readonly infrastructureStackName: string;

  /**
   * If present instructs us to enable S3 object signing
   */
  readonly s3?: S3Props;

  /**
   * If present instructs us to enable GCS object signing
   */
  readonly gcs?: GCSProps;

  /**
   * If present instructs us to enable CloudFlare object signing
   */
  readonly cloudFlare?: CloudFlareProps;
}
