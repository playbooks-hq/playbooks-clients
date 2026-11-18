import { workspaceReferenceContext } from 'src/services/command-context';
import { identifier, input } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listWorkflows = async (options: unknown) => {
	const { workspaceReference } = await workspaceReferenceContext(options);
	return sdkList(await workspaceReference.workflows.list());
};

export const getWorkflow = async (options: { workflow: string }) => {
	const { workspaceReference } = await workspaceReferenceContext(options);
	return sdkEnvelope(await workspaceReference.workflows.get(identifier(options.workflow, '--workflow')));
};

const draftFields = ['name', 'description', 'definition'];

const draftEnvelope = (workflow: { id: string }) => {
	const base = import.meta.env.VITE_WEB_DOMAIN || 'https://www.playbooks.ai';
	return sdkEnvelope({ ...workflow, url: new URL(`/workflows/${identifier(workflow.id)}`, base).href });
};

export const createWorkflowDraft = async (options: unknown) => {
	const data = await input(options, draftFields);
	const { workspaceReference } = await workspaceReferenceContext(options);
	return draftEnvelope(await workspaceReference.workflows.createDraft(data));
};

export const updateWorkflowDraft = async (options: { workflow: string }) => {
	const id = identifier(options.workflow, '--workflow');
	const data = await input(options, ['expectedRevision', ...draftFields]);
	const { workspaceReference } = await workspaceReferenceContext(options);
	return draftEnvelope(await workspaceReference.workflows.updateDraft(id, data));
};
