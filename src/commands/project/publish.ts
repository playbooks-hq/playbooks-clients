import { setTimeout as delay } from 'node:timers/promises';

import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';

export const publishProject = async (options: any) => {
	const context = await projectContext(options);
	const project = await context.client.request(context.path, 'GET', undefined, { include: 'deploy' });
	const deploy = project.data.deploy;
	if (!deploy?.uuid) throw new CliError(422, 'Configure Production for this Project in Playbooks before publishing.');
	const path = `/deploys/${identifier(deploy.uuid)}/release`;

	const data = await input(options, ['branchId', 'expectedRevision']);
	if (!data.expectedRevision || !options.yes)
		throw new CliError(
			422,
			'Review project preflight, then supply expectedRevision in --data and confirm with --yes. Publication can incur usage charges.',
		);
	let result = await context.client.request(path, 'POST', data, {}, false, false, false);
	if (!options.wait) return result;
	const releaseId = identifier(result.data.uuid);
	const deadline = Date.now() + 300000;
	while (['pending', 'draft'].includes(result.data.status)) {
		if (Date.now() >= deadline)
			throw new CliError(
				408,
				'Publication is still pending. Inspect project release --release <id> to resume observation.',
				'release',
				releaseId,
			);
		await delay(2000);
		result = await context.client.request(`${context.path}/releases/${releaseId}`);
	}
	if (result.data.status !== 'succeeded')
		throw new CliError(
			422,
			'Publication did not succeed. Inspect the release for failure details.',
			'release',
			releaseId,
		);
	return result;
};
