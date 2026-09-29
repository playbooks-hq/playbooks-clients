import { projectContext } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';
import { secretMetadata } from 'src/utils/secret-metadata';

export const sandboxOperations = async (options: any) => {
	const context = await projectContext(options);
	const response = sdkEnvelope(await context.projectResource.sandbox.get());
	return secretMetadata(response);
};
