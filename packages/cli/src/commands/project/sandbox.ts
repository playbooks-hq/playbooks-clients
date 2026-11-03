import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { input } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';
import { secretMetadata } from 'src/utils/secret-metadata';

export const sandboxOperations = async (options: any) => {
	const context = await projectContext(options);
	const response = sdkEnvelope(await context.projectResource.sandbox.get());
	return secretMetadata(response);
};

export const configureSandbox = async (options: any) => {
	const context = await projectContext(options);
	if (context.projectResource.executionProfile === 'test')
		throw new CliError(422, 'Test Projects do not support Sandbox service configuration.');
	const data = await input(options, [
		'expectedVersionId',
		'services',
		'primaryServiceId',
		'runtimeUuid',
		'lifecycleUuid',
		'network',
	]);
	if ('services' in data && !Array.isArray(data.services))
		throw new CliError(422, 'Sandbox services must be an array.');
	for (const service of data.services || []) {
		if (!service || typeof service !== 'object' || Array.isArray(service))
			throw new CliError(422, 'Sandbox services must be objects.');
		const allowed = ['uuid', 'key', 'status', 'commands', 'port', 'env', 'dependsOn', 'position'];
		if (Object.keys(service).some(key => !allowed.includes(key)))
			throw new CliError(422, `Sandbox service fields must be: ${allowed.join(', ')}.`);
		if (typeof service.key !== 'string' || !Array.isArray(service.commands))
			throw new CliError(422, 'Each Sandbox service requires a key and command array.');
	}
	if (
		data.services?.some(service => service && typeof service === 'object' && 'env' in service) &&
		options.data !== '-'
	)
		throw new CliError(422, 'Provide Sandbox service environment fields through stdin (--data -).');
	if (('services' in data || 'primaryServiceId' in data) && !('expectedVersionId' in data))
		throw new CliError(422, 'Provide expectedVersionId from the current Sandbox configuration.');
	return sdkEnvelope(await context.projectResource.sandbox.configure(data));
};
