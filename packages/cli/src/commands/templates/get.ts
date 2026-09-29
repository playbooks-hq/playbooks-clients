import { CliClient } from 'src/services/cli-client';
import { identifier, includeParams } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const getTemplate = async (options: any) => {
	const params = includeParams(options, ['categories', 'license', 'stats']);
	const client = new CliClient();
	return sdkEnvelope(await client.templates.get(identifier(options['template']), params));
};
