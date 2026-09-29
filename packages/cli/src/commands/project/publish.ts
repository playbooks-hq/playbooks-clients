import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
export const publishProject = async (options: any) => {
	const context = await projectContext(options);
	const data = await input(options, ['branchId', 'expectedRevision']);
	if (!data.expectedRevision || !options.yes)
		throw new CliError(
			422,
			'Review project preflight, then supply expectedRevision in --data and confirm with --yes. Publication can incur usage charges.',
		);
	const result = sdkEnvelope(await context.projectResource.publish(data));
	if (!options.wait) return result;
	if (['pending', 'draft'].includes(result.data.status))
		return sdkEnvelope(await context.projectResource.releases.wait(identifier(result.data.uuid)));
	if (result.data.status !== 'succeeded')
		throw new CliError(
			422,
			'Publication did not succeed. Inspect the release for failure details.',
			'release',
			String(result.data.uuid),
		);
	return result;
};
