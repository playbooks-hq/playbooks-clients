import { workspaceContext } from 'src/services/command-context';
import { identifier } from 'src/utils/cli-input';
import { assertOperationSucceeded } from 'src/utils/cli-operation';
import { sdkEnvelope } from 'src/utils/sdk-output';

export const createProjectTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, project: options.project });
	const response = sdkEnvelope(
		await context.workspaceResource.templates.createFromProject(identifier(options.project)),
	);
	assertOperationSucceeded(response, target);
	return response;
};

export const getProjectTemplateDraft = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.templates.draftFromProject(identifier(options.project)));
};

export const createAgentTemplate = async (options: any) => {
	const context = await workspaceContext(options);
	const target = JSON.stringify({ workspace: context.workspaceUuid, agent: options.agent });
	const response = sdkEnvelope(await context.workspaceResource.templates.createFromAgent(identifier(options.agent)));
	assertOperationSucceeded(response, target);
	return response;
};

export const getAgentTemplateDraft = async (options: any) => {
	const context = await workspaceContext(options);
	return sdkEnvelope(await context.workspaceResource.templates.draftFromAgent(identifier(options.agent)));
};
