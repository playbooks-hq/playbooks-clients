import { CliError } from 'src/services/cli-client';
import { openUrl } from 'src/utils/open-url';

export const openResource = async (record: any) => {
	const value = record.appPath || record.webPath;
	if (!value) throw new CliError(422, 'The server did not return an application link for this resource.');
	const base = import.meta.env.VITE_WEB_DOMAIN || 'https://www.playbooks.ai';
	const url = new URL(value, base);
	if (url.origin !== new URL(base).origin)
		throw new CliError(422, 'The resource link is outside the Playbooks application.');
	await openUrl(url.href);
	return { data: { url: url.href } };
};
