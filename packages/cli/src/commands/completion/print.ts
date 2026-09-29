import { CliError } from 'src/services/cli-client';
import { reportError } from 'src/utils/cli-output';

export const printCompletion = (shell: string, groups: string[]) => {
	const words = groups.join(' ');
	const cases = `
    "workspace") candidates="conversation messages message runs run";;
    "project") candidates="conversation conversations messages message runs run";;
    "project conversation") candidates="--project --workspace --conversation";;
    "workspace conversation") candidates="--workspace --conversation";;
    "project message") candidates="create update delete --message --project --conversation --branch";;
    "workspace message") candidates="create delete";;
    "workspace run"|"project run") candidates="stream --run";;
    "workspace run stream") candidates="--run --workspace --timeout --json";;
    "project run stream") candidates="--run --project --workspace --timeout --yes --json";;
    *) candidates="${words}";;
  `;
	if (shell === 'bash')
		console.log(`_playbooks_complete() {
  local candidates prefix
  prefix="${'${COMP_WORDS[*]:1:COMP_CWORD-1}'}"
  case "$prefix" in ${cases} esac
  COMPREPLY=($(compgen -W "$candidates" -- "${'${COMP_WORDS[COMP_CWORD]}'}"))
}
complete -F _playbooks_complete playbooks`);
	else if (shell === 'zsh')
		console.log(`#compdef playbooks
_playbooks_complete() {
  local candidates prefix
  prefix="${'${(j: :)words[2,CURRENT-1]}'}"
  case "$prefix" in ${cases} esac
  compadd -- ${'${=candidates}'}
}
compdef _playbooks_complete playbooks`);
	else reportError(new CliError(422, 'Choose bash or zsh.'));
};
