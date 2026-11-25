import { CliError } from 'src/services/cli-client';
import { output, reportError } from 'src/utils/cli-output';
import { requestProgress } from 'src/utils/terminal-progress';

export const run =
	(handler: (...args: any[]) => Promise<any>, format = output) =>
	async (...args: any[]) => {
		const options = args[args.length - 1];
		try {
			if (typeof options.config !== 'string' || !options.config) throw new CliError(422, '--config requires a path.');
			if (options.select !== undefined && (typeof options.select !== 'string' || !options.select.trim()))
				throw new CliError(422, '--select requires a field list.');
			if (options._?.length) throw new CliError(422, 'Unexpected positional arguments. See --help.');
			const interactive = process.stdout.isTTY && !options.json && !options.select;
			const stop =
				interactive && process.stderr.isTTY && process.env.TERM !== 'dumb'
					? requestProgress(options.commandTitle?.endsWith(' stream') ? 0 : 300)
					: undefined;
			let response;
			try {
				response = await handler(...args);
			} finally {
				await stop?.();
			}
			if (response !== undefined) {
				if (interactive && options.commandTitle && (Array.isArray(response.data) || format !== output)) {
					const title = options.commandTitle;
					console.log(`\n${title[0].toUpperCase()}${title.slice(1)}\n${'─'.repeat(title.length)}`);
				}
				format(response, options);
			}
		} catch (error) {
			reportError(error, options);
		}
	};
