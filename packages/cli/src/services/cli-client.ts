import { PlaybooksError, PlaybooksSDK } from '@playbooks/sdk';

import { name, version } from '../../package.json';

export const apiURL = () =>
	process.env.PLAYBOOKS_API_URL || import.meta.env.VITE_BASE_URL || 'https://api.playbooks.ai';

export { PlaybooksError as CliError };

export class CliClient extends PlaybooksSDK {
	constructor(token?: string) {
		super({ apiKey: token, baseUrl: apiURL() });
	}

	protected get clientHeader() {
		return `${name}@${version}`;
	}
}
