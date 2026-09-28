import enquirer from 'enquirer';
import { CliError } from 'src/services/cli-client';

export const confirm = async (options: any, message: string) => {
	if (options.yes) return;
	if (!process.stdin.isTTY || options.json)
		throw new CliError(422, 'Review the target and provide --yes to confirm this operation.');
	const answer: any = await enquirer.prompt({ type: 'confirm', name: 'proceed', message, initial: false });
	if (!answer.proceed) throw new CliError(400, 'Operation canceled.');
};
