import { projectContext } from 'src/services/command-context';
import { streamRun, streamTimeout } from 'src/services/run-stream';
import { confirm } from 'src/utils/cli-confirm';
import { integerOption, shellArgument } from 'src/utils/cli-input';

export const streamOperatorRun = async (options: any) => {
	const id = integerOption(options.run, 'run', 1);
	streamTimeout(options);
	const context = await projectContext(options);
	const path = `${context.path}/operator/runs/${id}`;
	await context.client.request(path);
	await confirm(options, `Follow project run ${id}? Opening this stream may start execution and incur usage.`);
	const inspect = `playbooks project run --workspace ${context.workspaceUuid} --project ${options.project} --run ${id} --config ${shellArgument(options.config)}`;
	await streamRun(context.client, path, options, inspect);
};
