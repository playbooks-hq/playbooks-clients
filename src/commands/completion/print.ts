import { CliError } from 'src/services/cli-client';
import { reportError } from 'src/utils/cli-output';

export const printCompletion = (shell: string, groups: string[]) => {
	const words = groups.join(' ');
	if (shell === 'bash') console.log(`complete -W '${words}' playbooks`);
	else if (shell === 'zsh') console.log(`#compdef playbooks\n_arguments '1:command:(${words})'`);
	else reportError(new CliError(422, 'Choose bash or zsh.'));
};
