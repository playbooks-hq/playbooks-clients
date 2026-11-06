import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getAgentAccess = async (options: any) =>
	sdkEnvelope(await (await projectContext(options)).projectResource.agentAccess.get());
export const updateAgentAccess = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm changing Project Agent runtime access with --yes.');
	return sdkEnvelope(
		await (await projectContext(options)).projectResource.agentAccess.update(await input(options, ['enabled'])),
	);
};
export const rotateAgentAccess = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm revoking the current Project Agent runtime key with --yes.');
	return sdkEnvelope(await (await projectContext(options)).projectResource.agentAccess.rotate());
};
