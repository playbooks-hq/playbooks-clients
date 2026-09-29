import type { ServerOptions } from '../options.js';
import { coreTools } from './core.js';
import { discoveryTools } from './discovery.js';
import { localTools } from './local.js';
import { operatorTools } from './operator.js';
import { projectAdministrationTools } from './project-administration.js';
import { projectConfigurationTools } from './project-configuration.js';
import { projectSourceTools } from './project-source.js';
import { projectWorkflowsTools } from './project-workflows.js';
import { templatesTools } from './templates.js';
import { workspaceConfigurationTools } from './workspace-configuration.js';
import { workspaceDomainsTools } from './workspace-domains.js';
import { workspaceFinanceTools } from './workspace-finance.js';
import { workspaceInboxTools } from './workspace-inbox.js';
import { workspaceMembersTools } from './workspace-members.js';
import { workspaceOperatorTools } from './workspace-operator.js';

export const catalog = [
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
];

export const selectTools = (options: ServerOptions) =>
	catalog.filter(tool => options.toolsets.includes(tool.toolset) && (!options.readOnly || tool.readOnly));
