import { CliError } from 'src/services/cli-client';
import { integerOption } from 'src/utils/cli-input';

export const messageParams = (options: any) => ({
	...(options.before !== undefined ? { beforeId: integerOption(options.before, 'before', 1) } : {}),
	...(options['page-size'] !== undefined ? { pageSize: integerOption(options['page-size'], 'page-size', 1, 100) } : {}),
});

export const validateMessage = (data: any, update = false) => {
	if ((!update || 'text' in data) && (typeof data.text !== 'string' || !data.text.trim()))
		throw new CliError(422, 'Message text must be a nonempty string.');
	if (update && !Object.keys(data).length) throw new CliError(422, 'Provide at least one message property.');
	for (const field of ['mode', 'queuedMode'])
		if (field in data && !['plan', 'execute'].includes(data[field]))
			throw new CliError(422, `${field} must be plan or execute.`);
	if ('deliveryMode' in data && !['queue', 'steer'].includes(data.deliveryMode))
		throw new CliError(422, 'deliveryMode must be queue or steer.');
	for (const field of ['modelId', 'queuedModelId', 'replyToMessageId'])
		if (field in data) data[field] = integerOption(data[field], field, 1);
	if (
		'maxCredits' in data &&
		data.maxCredits !== null &&
		(typeof data.maxCredits !== 'number' ||
			!Number.isFinite(data.maxCredits) ||
			data.maxCredits < 0 ||
			data.maxCredits >= 1e12 ||
			Number(data.maxCredits.toFixed(4)) !== data.maxCredits)
	)
		throw new CliError(
			422,
			'maxCredits must be null or a nonnegative number below one trillion with up to four decimal places.',
		);
	if ('idempotencyKey' in data && (typeof data.idempotencyKey !== 'string' || !data.idempotencyKey.trim()))
		throw new CliError(422, 'idempotencyKey must be a nonempty string.');
	return data;
};
