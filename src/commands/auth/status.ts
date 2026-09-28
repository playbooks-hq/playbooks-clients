import { CliContext } from 'src/services/cli-context';
import { authenticated } from 'src/services/command-context';

export const status = async (options: any) => {
	const store = new CliContext(options.config);
	const { client } = await authenticated(options);
	const session = await client.request('/session');
	return {
		data: {
			user: { id: session.data.id, uuid: session.data.uuid, name: session.data.name },
			...(await store.read()),
		},
	};
};
