import { CliError } from 'src/services/cli-client';
import { output, reportError } from 'src/utils/cli-output';

export const run =
	(handler: (...args: any[]) => Promise<any>) =>
	async (...args: any[]) => {
		const options = args[args.length - 1];
		try {
			if (typeof options.config !== 'string' || !options.config) throw new CliError(422, '--config requires a path.');
			if (options.select !== undefined && (typeof options.select !== 'string' || !options.select.trim()))
				throw new CliError(422, '--select requires a field list.');
			if (options._?.length) throw new CliError(422, 'Unexpected positional arguments. See --help.');
			output(await handler(...args), options);
		} catch (error) {
			reportError(error);
		}
	};
