import { workspaceContext } from 'src/services/command-context';
import { streamRun, streamTimeout } from 'src/services/run-stream';
import { integerOption, shellArgument } from 'src/utils/cli-input';

export const streamOperatorRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	streamTimeout(options);
	const context = await workspaceContext(options);
	const path = `/workspace/operator/runs/${id}`;
	await context.client.request(path);

	const inspect = `playbooks workspace run --workspace ${context.workspaceUuid} --run ${id} --config ${shellArgument(options.config)}`;
	await streamRun(context.client, path, options, inspect);
};
