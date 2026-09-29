import { CliClient, CliError } from 'src/services/cli-client';
import { integerOption } from 'src/utils/cli-input';
import { runOutput } from 'src/utils/run-output';
import { readEvents } from 'src/utils/sse';

export const streamTimeout = (options: any) => {
	if (options.select !== undefined) throw new CliError(422, '--select is not supported for run streams.');
	return integerOption(options.timeout ?? 1800, 'timeout', 1, 2147483) * 1000;
};

export const streamRun = async (client: CliClient, path: string, options: any, inspect: string) => {
	const timeout = streamTimeout(options);
	const controller = new AbortController();
	const interrupt = () => {
		process.exitCode = 130;
		controller.abort();
	};
	process.prependOnceListener('SIGINT', interrupt);
	const outputError = (error: Error) => controller.abort(error);
	process.stdout.on('error', outputError);
	const abort = () => controller.abort(new CliError(504, 'Run stream timed out.'));
	const total = setTimeout(abort, timeout);
	let idle = setTimeout(abort, 30000);
	let streamError: any;
	let finish: any;
	const render = runOutput(options, controller.signal);
	try {
		const body = await client.openStream(`${path}/stream`, controller.signal);
		const activity = () => {
			clearTimeout(idle);
			idle = setTimeout(abort, 90000);
		};
		activity();
		for await (const event of readEvents(body, activity)) {
			await render(event);
			if (event.data?.type === 'finish') finish = event.data;
			if (event.data?.type === 'error' || event.data?.type === 'abort')
				streamError = new CliError(502, 'The run stream reported a failure or cancellation.');
		}
		clearTimeout(idle);
		if (!finish || !Number.isInteger(finish.runId) || String(finish.runId) !== path.split('/').pop())
			throw new CliError(503, 'Run stream ended without an authoritative final status.');
		const status = finish.status;
		if (options.json || !process.stdout.isTTY)
			await render({ event: 'run-status', data: { id: finish.runId, status } });
		else process.stdout.write('\n');
		if (streamError) throw streamError;
		if (status === 'waiting') console.error('Run is waiting for input or approval; it has not completed.');
		else if (status !== 'completed')
			throw new CliError(409, `Run has not completed successfully (status: ${status || 'unknown'}).`);
		else console.error('Run completed.');
	} catch (error) {
		if (process.exitCode === 130) {
			console.error(`Stopped following; remote execution was not canceled. Inspect with: ${inspect}`);
			return;
		}
		const failure = controller.signal.reason instanceof CliError ? controller.signal.reason : error;
		const remoteState =
			finish && ['completed', 'failed', 'canceled', 'waiting'].includes(finish.status)
				? ''
				: ' Remote execution may still be active.';
		if (failure instanceof CliError)
			throw new CliError(
				failure.status,
				`${failure.message}${remoteState} Inspect with: ${inspect}`,
				failure.source,
				failure.debug,
				failure.title,
			);
		throw new CliError(503, `Run stream disconnected. Remote execution may still be active. Inspect with: ${inspect}`);
	} finally {
		controller.abort();
		clearTimeout(total);
		clearTimeout(idle);
		process.removeListener('SIGINT', interrupt);
		process.stdout.removeListener('error', outputError);
	}
};
