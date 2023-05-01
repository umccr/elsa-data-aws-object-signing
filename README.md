# Elsa Data AWS Object Signing

A CDK for setting up an object signing IAM user for use in Elsa Data.

The user is given a policy appropriate for being able to sign
object requests from the data buckets.

The user and its secret are registered into a CloudMap service
to allow them to be discovered by Elsa Data.

## Deployment

### Manual

Change into the `deploy/manual` directory.

See `npm run` for the various deployment scripts (all basically calling CDK with different settings).

You should have the appropriate permissions for each different account before invoking.

### Pipeline

There is no pipeline deployment for this project as it is a relatively static
service that is best under explicit manual deployment control.

### Refreshing IAM User Keys

If the IAM access key need to be rotated for security compliance - edit
the `iamSerial` value in the corresponding stack in `stacks.ts` - then deploy.
Each increment of this
value will cause a new IAM access key to be created.
