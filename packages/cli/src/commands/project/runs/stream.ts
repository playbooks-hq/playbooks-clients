import { projectContext } from 'src/services/command-context';
import { streamRun, streamTimeout } from 'src/services/run-stream';
import { integerOption, shellArgument } from 'src/utils/cli-input';

export const streamOperatorRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	streamTimeout(options);
	const context = await projectContext(options);
	const inspect = `playbooks project run --workspace ${context.workspaceUuid} --project ${context.projectResource.uuid} --run ${id} --config ${shellArgument(options.config)}`;
	await streamRun(context.projectResource.runs, id, options, inspect);
};
