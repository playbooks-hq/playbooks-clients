import type { ProjectTestAction } from '@playbooks/sdk';
import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { confirm } from 'src/utils/cli-confirm';
import { identifier, input, integerOption, textOption } from 'src/utils/cli-input';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const listTests = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(
		await projectResource.tests.list({
			...(options.search === undefined ? {} : { search: textOption(options.search, 'search') }),
			...(options.before === undefined ? {} : { before: integerOption(options.before, 'before', 1) }),
		}),
	);
};
export const getTest = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(await projectResource.tests.get(identifier(options.test, '--test')));
};
export const getTestOperation = async (options: any) => {
	const { projectResource } = await projectContext(options);
	return sdkEnvelope(
		await projectResource.tests.operation(
			identifier(options.test, '--test'),
			identifier(options.operation, '--operation'),
		),
	);
};
export const createTest = async (options: any) => {
	const { projectResource } = await projectContext(options);
	const data = await input(options, ['requestKey', 'name', 'instructions', 'branchId', 'intent', 'authMethod']);
	await confirm(options, `Create an isolated Test under ${projectResource.uuid}? Preparation may incur usage.`);
	return sdkEnvelope(await projectResource.tests.create(data));
};
export const testAction = async (options: any) => {
	const name = textOption(options.action, 'action');
	if (
		![
			'test',
			'data',
			'reset',
			'delete',
			'stop',
			'sleep',
			'refresh',
			'reset-workspace',
			'preview-start',
			'preview-stop',
			'preview-restart',
		].includes(name)
	)
		throw new CliError(422, 'Choose a supported Test action.');
	const { projectResource } = await projectContext(options);
	const id = identifier(options.test, '--test');
	const data = await input(options, [
		'requestKey',
		'revision',
		'confirm',
		'operationId',
		'instructions',
		'attachments',
		'replacesOperationId',
		'intent',
		'authMethod',
	]);
	await confirm(
		options,
		`Apply ${name} to Test ${id} under ${projectResource.uuid}? Review its effects and possible usage.`,
	);
	return sdkEnvelope(await projectResource.tests.action(id, name as ProjectTestAction, data));
};
