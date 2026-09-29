import { PlaybooksClient, PlaybooksError } from '@playbooks/sdk';

import { name, version } from '../../package.json';

export const apiURL = () =>
	process.env.PLAYBOOKS_API_URL || import.meta.env.VITE_BASE_URL || 'https://api.playbooks.ai';

export { PlaybooksError as CliError };

export class CliClient extends PlaybooksClient {
	constructor(token?: string, workspace?: string) {
		super({ token, workspace, baseUrl: apiURL() });
	}

	protected get clientHeader() {
		return `${name}@${version}`;
	}
}
