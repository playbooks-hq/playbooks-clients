import { authenticated } from 'src/services/command-context';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const status = async (options: any) => {
	const { client, store, credentialSource } = await authenticated(options);
	const session = sdkEnvelope(await client.session.get());
	return {
		data: {
			user: { id: session.data.id, uuid: session.data.uuid, name: session.data.name },
			credentialSource,
			...(await store.read()),
		},
	};
};
