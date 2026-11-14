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

export const removeSandbox = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Review Sandbox removal, then confirm with --yes.');
	const context = await projectContext(options);
	return sdkEnvelope(await context.projectResource.sandbox.remove());
};

export const configureSandbox = async (options: any) => {
	const context = await projectContext(options);
	if (context.projectResource.executionProfile === 'test')
		throw new CliError(422, 'Test Projects do not support Sandbox service configuration.');
	const data = await input(options, [
		'expectedVersionId',
		'services',
		'primaryServiceId',
		'resources',
		'network',
		'idempotencyKey',
	]);
	const { idempotencyKey, ...configuration } = data;
	if (
		idempotencyKey !== undefined &&
		(typeof idempotencyKey !== 'string' || !idempotencyKey || idempotencyKey.length > 128)
	)
		throw new CliError(422, 'idempotencyKey must be a string of 1-128 characters.');
	if ('resources' in data) {
		if (['services', 'primaryServiceId', 'network'].some(field => field in data))
			throw new CliError(422, 'Save Sandbox resources separately from service and network changes.');
		const resources = data.resources;
		const fields = ['cpu', 'memoryGiB', 'storageGiB'];
		if (
			!resources ||
			typeof resources !== 'object' ||
			Array.isArray(resources) ||
			Object.keys(resources).length !== fields.length ||
			fields.some(field => !Number.isFinite(resources[field]) || resources[field] <= 0)
		)
			throw new CliError(422, 'Sandbox resources require numeric cpu, memoryGiB, and storageGiB values.');
	}
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
	if (('services' in data || 'primaryServiceId' in data || 'resources' in data) && !('expectedVersionId' in data))
		throw new CliError(422, 'Provide expectedVersionId from the current Sandbox configuration.');
	if ('resources' in data && !idempotencyKey)
		throw new CliError(422, 'Provide a stable idempotencyKey for Sandbox resource changes.');
	return sdkEnvelope(await context.projectResource.sandbox.configure(configuration, { idempotencyKey }));
};
