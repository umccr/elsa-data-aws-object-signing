# Elsa Data AWS Object Signing

A CDK for setting up an object signing in Elsa Data.

## Clouds

### S3

A user is created and is given a policy appropriate for being able to sign
object requests from the data buckets.

The user and its secret are registered into a CloudMap service
to allow them to be discovered by Elsa Data.

### GCS

An empty secret is created and registered into CloudMap. It will need to
be set with the content of a Google Service Account JSON.

### CloudFlare

An empty secret is created and registered into CloudMap. It will need to be
set with the key and secret of a CloudFlare API token.

## Deployment

### Manual

Change into the `deploy/manual` directory.

See `npm run` for the various deployment scripts (all basically calling CDK with different settings).

You should have the appropriate permissions for each different account before invoking.

### Pipeline

There is no pipeline deployment for this project as it is a relatively static
service that is best under explicit manual deployment control.

## Refreshing / Rotation

### Refreshing IAM User Keys

If the IAM access key need to be rotated for security compliance - edit
the `iamSerial` value in the corresponding stack in `dev.ts` - then deploy.
Each increment of this
value will cause a new IAM access key to be created.

### GCS / CloudFlare

Signing credentials for GCS and CloudFlare can be manually changed in the relevant
secret - and they should flow through to Elsa Data within an hour.
