import { Stack } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HttpNamespace } from "aws-cdk-lib/aws-servicediscovery";

/**
 * Create a usable CloudMap namespace object by reflecting values
 * out of Parameter Store.
 *
 * @param stack
 * @param infrastructureStackId
 */
export function createNamespaceFromLookup(
  stack: Stack,
  infrastructureStackId: string
) {
  return HttpNamespace.fromHttpNamespaceAttributes(stack, "Namespace", {
    namespaceArn: StringParameter.valueFromLookup(
      stack,
      `/${infrastructureStackId}/HttpNamespace/namespaceArn`
    ),
    namespaceId: StringParameter.valueFromLookup(
      stack,
      `/${infrastructureStackId}/HttpNamespace/namespaceId`
    ),
    namespaceName: StringParameter.valueFromLookup(
      stack,
      `/${infrastructureStackId}/HttpNamespace/namespaceName`
    ),
  });
}
