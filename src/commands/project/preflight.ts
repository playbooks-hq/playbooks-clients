import { CliError } from 'src/services/cli-client';
import { projectContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';

export const preflightProject = async (options: any) => {
	const context = await projectContext(options);
	const project = await context.client.request(context.path, 'GET', undefined, { include: 'deploy' });
	const deploy = project.data.deploy;
	if (!deploy?.uuid) throw new CliError(422, 'Configure Production for this Project in Playbooks before publishing.');
	const path = `/deploys/${identifier(deploy.uuid)}/release`;

	const data = options.data === undefined ? {} : await input(options, ['branchId', 'expectedRevision']);
	return context.client.request(`${path}/preflight`, 'POST', data, {}, false, false, true);
};
