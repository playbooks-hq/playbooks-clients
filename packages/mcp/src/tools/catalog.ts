import type { ServerOptions } from 'src/options.js';
import { coreTools } from 'src/tools/core.js';
import type { ToolDefinition } from 'src/tools/definition.js';
import { discoveryTools } from 'src/tools/discovery.js';
import { localTools } from 'src/tools/local.js';
import { operatorTools } from 'src/tools/operator.js';
import { projectAdministrationTools } from 'src/tools/project-administration.js';
import { projectConfigurationTools } from 'src/tools/project-configuration.js';
import { projectControlTools } from 'src/tools/project-controls.js';
import { projectSourceTools } from 'src/tools/project-source.js';
import { projectTestTools } from 'src/tools/project-tests.js';
import { projectWorkflowsTools } from 'src/tools/project-workflows.js';
import { templatesTools } from 'src/tools/templates.js';
import { workspaceConfigurationTools } from 'src/tools/workspace-configuration.js';
import { workspaceDomainsTools } from 'src/tools/workspace-domains.js';
import { workspaceFinanceTools } from 'src/tools/workspace-finance.js';
import { workspaceInboxTools } from 'src/tools/workspace-inbox.js';
import { workspaceMembersTools } from 'src/tools/workspace-members.js';
import { workspaceOperatorTools } from 'src/tools/workspace-operator.js';

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
