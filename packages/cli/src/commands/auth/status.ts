import { CliContext } from 'src/services/cli-context';
import { authenticated } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const status = async (options: any) => {
	const store = new CliContext(options.config);
	const { client } = await authenticated(options);
	const session = sdkEnvelope(await client.session.get());
	return {
		data: {
			user: { id: session.data.id, uuid: session.data.uuid, name: session.data.name },
			...(await store.read()),
		},
	};
};
