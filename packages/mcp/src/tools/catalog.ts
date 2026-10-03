import type { ServerOptions } from '../options.js';
import { coreTools } from './core.js';
import type { ToolDefinition } from './definition.js';
import { discoveryTools } from './discovery.js';
import { localTools } from './local.js';
import { operatorTools } from './operator.js';
import { projectAdministrationTools } from './project-administration.js';
import { projectConfigurationTools } from './project-configuration.js';
import { projectControlTools } from './project-controls.js';
import { projectSourceTools } from './project-source.js';
import { projectTestTools } from './project-tests.js';
import { projectWorkflowsTools } from './project-workflows.js';
import { templatesTools } from './templates.js';
import { workspaceConfigurationTools } from './workspace-configuration.js';
import { workspaceDomainsTools } from './workspace-domains.js';
import { workspaceFinanceTools } from './workspace-finance.js';
import { workspaceInboxTools } from './workspace-inbox.js';
import { workspaceMembersTools } from './workspace-members.js';
import { workspaceOperatorTools } from './workspace-operator.js';

export const catalog: ToolDefinition[] = (
	[
		...coreTools,
		...discoveryTools,
		...workspaceConfigurationTools,
		...localTools,
		...templatesTools,
		...workspaceMembersTools,
		...workspaceFinanceTools,
		...workspaceInboxTools,
		...workspaceDomainsTools,
		...projectAdministrationTools,
		...projectConfigurationTools,
		...projectSourceTools,
		...projectWorkflowsTools,
		...workspaceOperatorTools,
		...operatorTools,
		...projectControlTools,
	] satisfies ToolDefinition[]
)
	.map(tool => ({
		...tool,
		options: {
			...tool.options,
			...('project' in tool.options
				? {
						targetAgent: {
							flag: 'target-agent',
							description: 'Agent UUID under this Project. Mutually exclusive with targetTest.',
						},
						targetTest: {
							flag: 'target-test',
							description: 'Test UUID under this Project. Mutually exclusive with targetAgent.',
						},
					}
				: {}),
		},
	}))
	.concat(projectTestTools);

export const selectTools = (options: ServerOptions) =>
	catalog.filter(tool => options.toolsets.includes(tool.toolset) && (!options.readOnly || tool.readOnly));
