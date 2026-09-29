import { projectContext } from 'src/services/command-context';
import { streamRun, streamTimeout } from 'src/services/run-stream';
import { integerOption, shellArgument } from 'src/utils/cli-input';

export const streamOperatorRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	streamTimeout(options);
	const context = await projectContext(options);
	const path = `${context.path}/operator/runs/${id}`;
	const inspect = `playbooks project run --workspace ${context.workspaceUuid} --project ${options.project} --run ${id} --config ${shellArgument(options.config)}`;
	await streamRun(context.client, path, options, inspect);
};
