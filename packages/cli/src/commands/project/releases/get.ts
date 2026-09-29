import { projectContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getRelease = async (options: any) => {
	const context = await projectContext(options);
	return sdkEnvelope(await context.projectResource.releases.get(identifier(options['release'])));
};
