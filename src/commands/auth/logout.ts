import { CliContext } from 'src/services/cli-context';

export const logout = async (options: any) => {
	const store = new CliContext(options.config);
	await store.logout();
	return { data: { signedOut: true, environmentCredentialActive: Boolean(process.env.PLAYBOOKS_TOKEN) } };
};
