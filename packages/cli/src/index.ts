import os from 'node:os';
import path from 'node:path';

import { version } from 'package.json';
import sade from 'sade';
import {
	agent,
	auth,
	categories,
	collections,
	completion,
	creators,
	mcp,
	project,
	site,
	templates,
	workspace,
} from 'src/commands';
import { CliError } from 'src/services/cli-client';
import { run } from 'src/utils/cli-command';
import { reportError } from 'src/utils/cli-output';
import { outputMessages } from 'src/utils/message-output';

const cli = sade('playbooks').version(version);
cli.describe('Manage Playbooks from your terminal.');
cli.option('--config', 'Isolated context file.', path.join(os.homedir(), '.config', 'playbooks', 'config.json'));
cli.option('--json', 'Print JSON; streams use newline-delimited JSON.', false);
cli.option('--select', 'Select comma-separated output fields; unavailable for streams.');

// Managed Agents
cli
	.command('agents')
	.describe('List managed Agents.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--query', 'Search by name.')
	.option('--status', 'Status filter.')
	.option('--association', 'unassociated, project, or site.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listAgents));

cli
	.command('agent')
	.describe('Inspect an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.getAgent));

cli
	.command('agent create')
	.describe('Create an Agent; integrations require contentOwnerUserId.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.createAgent));

cli
	.command('agent update')
	.describe('Update Agent configuration.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.updateAgent));

cli
	.command('agent archive')
	.describe('Archive an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.archiveAgent));

cli
	.command('agent restore')
	.describe('Restore an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.restoreAgent));

cli
	.command('agent delete')
	.describe('Delete an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(agent.deleteAgent));

cli
	.command('agent conversations')
	.describe('List Agent conversations.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listConversations));

cli
	.command('agent conversation create')
	.describe('Create an empty Agent conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.createConversation));

cli
	.command('agent conversation main')
	.describe('Designate an Agent conversation as Main.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--data', 'JSON object containing the current Agent revision.')
	.action(run(agent.setMainConversation));

cli
	.command('agent conversation')
	.describe('Inspect an Agent conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.action(run(agent.getConversation));

cli
	.command('agent conversation messages')
	.describe('Read Agent conversation history.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--cursor', 'History cursor.')
	.action(run(agent.conversationMessages));

cli
	.command('agent conversation stream')
	.describe('Follow Agent conversation snapshots and cursor events as NDJSON without starting execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--timeout', 'Total stream duration in seconds; defaults to 1800.')
	.example(
		'agent conversation stream --agent 01234567-89ab-cdef-0123-456789abcdef --conversation 01234567-89ab-cdef-0123-456789abcdef',
	)
	.action(run(agent.streamConversation));

cli
	.command('agent conversation send')
	.describe('Send a message to an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm execution.', false)
	.action(run(agent.sendMessage));

cli
	.command('agent conversation message')
	.describe('Manage one queued Agent conversation message.')
	.action(() => cli.help('agent conversation message'));

cli
	.command('agent conversation message update')
	.describe('Edit a pending queued Agent message using its current edit revision.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--message', 'Numeric message identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.editQueuedMessage));

cli
	.command('agent conversation message delete')
	.describe('Cancel a queued Agent message; retains message history.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--conversation', 'Conversation UUID.')
	.option('--message', 'Numeric message identifier.')
	.option('--yes', 'Confirm cancellation.', false)
	.action(run(agent.deleteQueuedMessage));

cli
	.command('agent executions')
	.describe('List Agent execution metadata.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listExecutions));

cli
	.command('agent execution')
	.describe('Inspect an authorized Agent execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--execution', 'Execution ID.')
	.action(run(agent.getExecution));

cli
	.command('agent execution tool')
	.describe('Inspect authorized evidence for an Agent execution tool part.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--execution', 'Execution ID.')
	.option('--part', 'Exact tool part ID.')
	.action(run(agent.getExecutionToolEvidence));

cli
	.command('agent invoke')
	.describe('Invoke an Agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(agent.invokeAgent));

cli
	.command('agent schedules')
	.describe('List Agent schedules.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listSchedules));

cli
	.command('agent schedule occurrences')
	.describe('List an Agent schedule’s retained occurrences.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--schedule', 'Schedule UUID.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listScheduleOccurrences));

cli
	.command('agent schedule create')
	.describe('Create an Agent schedule.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.createSchedule));

cli
	.command('agent schedule update')
	.describe('Update an Agent schedule.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--schedule', 'Schedule UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.updateSchedule));

cli
	.command('agent usage')
	.describe('Inspect Agent usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.getUsage));

cli
	.command('agent applications')
	.describe('List Agent application roles.')
	.option('--workspace', 'Workspace UUID.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.listApplicationGrants));
cli
	.command('agent application candidates')
	.describe('List assignable applications.')
	.option('--workspace', 'Workspace UUID.')
	.option('--agent', 'Agent UUID.')
	.option('--kind', 'project or site.')
	.option('--query', 'Search applications.')
	.action(run(agent.listApplicationGrantCandidates));
cli
	.command('agent applications update')
	.describe('Replace application roles with a revision check.')
	.option('--workspace', 'Workspace UUID.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm access changes.', false)
	.action(run(agent.updateApplicationGrants));
cli
	.command('agent application remove')
	.describe('Revoke application access.')
	.option('--workspace', 'Workspace UUID.')
	.option('--agent', 'Agent UUID.')
	.option('--kind', 'project or site.')
	.option('--resource', 'Project or Site UUID.')
	.option('--data', 'JSON with current revision.')
	.option('--yes', 'Confirm access removal.', false)
	.action(run(agent.removeApplicationGrant));

cli
	.command('agent execution cancel')
	.describe('Cancel an Agent execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--execution', 'Execution identifier.')
	.action(run(agent.cancelExecution));

cli
	.command('agent budget')
	.describe('Inspect Agent budget.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.getBudget));

cli
	.command('agent budget update')
	.describe('Update Agent budget.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.updateBudget));

cli
	.command('agent credentials')
	.describe('List Agent credential metadata.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.listCredentials));

cli
	.command('agent credential create')
	.describe('Create an Agent credential.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(agent.createCredential));

cli
	.command('agent credential revoke')
	.describe('Revoke an Agent credential.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--credential', 'Credential identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(agent.revokeCredential));

cli
	.command('agent externals')
	.describe('List authorized Agent external assignments.')
	.option('--workspace', 'Explicit Workspace identifier.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.listExternals));

cli
	.command('agent external options')
	.describe('List eligible external sources and operations.')
	.option('--workspace', 'Explicit Workspace identifier.')
	.option('--agent', 'Agent UUID.')
	.option('--kind', 'connector, mcp, or browser.')
	.option('--query', 'Search by name.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listExternalOptions));

cli
	.command('agent external create')
	.describe('Authorize explicit external operations.')
	.option('--workspace', 'Explicit Workspace identifier.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm reviewed external permissions.', false)
	.action(run(agent.createExternal));

cli
	.command('agent external update')
	.describe('Update external operation grants.')
	.option('--workspace', 'Explicit Workspace identifier.')
	.option('--agent', 'Agent UUID.')
	.option('--assignment', 'Assignment UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm reviewed external permissions.', false)
	.action(run(agent.updateExternal));

cli
	.command('agent external revoke')
	.describe('Revoke external operation grants.')
	.option('--workspace', 'Explicit Workspace identifier.')
	.option('--agent', 'Agent UUID.')
	.option('--assignment', 'Assignment UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm reviewed external permissions.', false)
	.action(run(agent.revokeExternal));

cli
	.command('agent resources')
	.describe('List assigned Agent resources.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.listResources));

cli
	.command('agent resource options')
	.describe('List resources eligible for Agent assignment.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--kind', 'Skill, design, or reference.')
	.option('--query', 'Search by name.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Page size.')
	.action(run(agent.listResourceOptions));

cli
	.command('agent resource put')
	.describe('Assign an Agent resource.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.putResource));

cli
	.command('agent resource delete')
	.describe('Remove an Agent resource.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--kind', 'Kind identifier.')
	.option('--resource', 'Resource identifier.')
	.action(run(agent.deleteResource));

cli
	.command('agent working-files')
	.describe('Read authorized Agent working files.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.getWorkingFiles));

cli
	.command('agent working-files update')
	.describe('Update authorized Agent working files.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(agent.updateWorkingFiles));

cli
	.command('agent outputs')
	.describe('List authorized Agent outputs.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.action(run(agent.listOutputs));

cli
	.command('agent output')
	.describe('Read an authorized Agent output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--agent', 'Agent UUID.')
	.option('--output', 'Output identifier.')
	.action(run(agent.getOutput));

// Independent production Sites
cli
	.command('sites')
	.describe('List authorized Sites.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(site.listSites));

cli
	.command('site')
	.describe('Inspect a Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.action(run(site.getSite));

cli
	.command('site create')
	.describe('Create an independent Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(site.createSite));

cli
	.command('site update')
	.describe('Rename a Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(site.updateSite));

cli
	.command('site source')
	.describe('Inspect the connected source.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.action(run(site.getSource));

cli
	.command('site source connect')
	.describe('Connect a Project component or Agent static output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(site.connectSource));

cli
	.command('site source disconnect')
	.describe('Disconnect source while preserving the Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object with the expected source, or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(site.disconnectSource));

cli
	.command('site release-options')
	.describe('Inspect saved source revisions and declared components.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.action(run(site.releaseOptions));

cli
	.command('site preflight')
	.describe('Review component requirements and exact source/configuration revisions.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.action(run(site.preflightSite));

cli
	.command('site deploy')
	.describe('Release the reviewed component to this Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--wait', 'Wait up to five minutes for release completion.', false)
	.action(run(site.deploySite));

cli
	.command('site redeploy')
	.describe('Redeploy retained content with current Site configuration.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--wait', 'Wait up to five minutes for release completion.', false)
	.action(run(site.redeploySite));

cli
	.command('site rollback')
	.describe('Restore an eligible retained Site release.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--wait', 'Wait up to five minutes for release completion.', false)
	.action(run(site.rollbackSite));

cli
	.command('site releases')
	.describe('List releases owned by a Site.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.action(run(site.listReleases));

cli
	.command('site release')
	.describe('Inspect a Site release.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--release', 'Release UUID.')
	.action(run(site.getRelease));

cli
	.command('project sites')
	.describe('List Sites connected to this Project.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project UUID.')
	.action(run(site.projectSites));

cli
	.command('workspace chat sites')
	.describe('List Sites connected to this Chat.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--chat', 'Chat UUID.')
	.action(run(site.chatSites));

cli
	.command('site logs')
	.describe('Read Site production logs retained for seven days, optionally for one release.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--release', 'Release UUID.')
	.option('--query', 'Search log messages and request or trace identifiers.')
	.option('--page-size', 'Entries per page (1-500).')
	.option('--cursor', 'Cursor from meta.nextCursor for older entries.')
	.option('--after', 'Ingestion cursor for incremental reads.')
	.option('--from', 'Earliest timestamp (ISO 8601).')
	.option('--to', 'Latest timestamp (ISO 8601).')
	.action(run(site.listLogs));

cli
	.command('site log')
	.describe('Inspect one Site log entry and related request output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--log', 'Log entry identifier.')
	.option('--release', 'Release UUID.')
	.action(run(site.getLog));

cli
	.command('site analytics')
	.describe('Inspect Site production request traffic, response statuses and latency.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--site', 'Site UUID.')
	.option('--hours', 'Time window: 1, 24, 168 or 720 hours (default 24).')
	.option('--service', 'Exact Site component key.')
	.option('--route', 'Exact path, beginning with /.')
	.option('--search', 'Substring filter for listed paths.')
	.option('--offset', 'Route-list offset (0-10000; default 0).')
	.action(run(site.getAnalytics));

const siteOperations = [
	['site agent-access', 'Inspect Site production access to Workspace Agents.', site.getAgentAccess],
	[
		'site agent-access update',
		'Enable or disable Site access to Workspace Agents.',
		site.updateAgentAccess,
		null,
		true,
		true,
	],
	[
		'site agent-access rotate',
		'Rotate Site Agent runtime credentials; requires a release update.',
		site.rotateAgentAccess,
		null,
		false,
		true,
	],
	['site config', 'Inspect Site production configuration.', site.getConfig],
	['site config update', 'Update Site production configuration.', site.updateConfig, null, true],
	['site visitor-policy', 'Inspect Site visitor access policy.', site.getVisitorPolicy],
	['site visitor-policy update', 'Update Site visitor access policy.', site.updateVisitorPolicy, null, true],
	['site credentials', 'List Site credential metadata.', site.listCredentials],
	['site credential put', 'Set a Site production credential.', site.putCredential, 'key', true],
	['site credential delete', 'Remove a Site production credential.', site.deleteCredential, 'key', true, true],
	['site domains', 'List Site domain bindings.', site.listDomains],
	['site domain bind', 'Assign a Workspace domain hostname.', site.bindDomain, null, true],
	['site domain unbind', 'Remove a Site domain binding.', site.unbindDomain, 'binding', false, true],
	['site domain recheck', 'Check Site domain DNS and TLS readiness.', site.recheckDomain, 'binding'],
	['site collaborators', 'List Site collaborators.', site.listCollaborators],
	['site collaborator put', 'Grant or update accepted Site access.', site.putCollaborator, null, true],
	[
		'site collaborator delete',
		'Remove Site collaborator access.',
		site.deleteCollaborator,
		'collaborator',
		false,
		true,
	],
	['site invitations', 'List pending Site invitations.', site.listInvitations],
	['site invitation create', 'Invite a person to this Site.', site.createInvitation, null, true],
	['site invitation resend', 'Resend a pending Site invitation.', site.resendInvitation, 'invitation'],
	['site invitation revoke', 'Revoke a pending Site invitation.', site.revokeInvitation, 'invitation', false, true],
	['site connections', 'List Site production connections.', site.listConnections],
	['site connection create', 'Assign a Workspace connection to this Site.', site.createConnection, null, true],
	['site connection update', 'Configure a Site production connection.', site.updateConnection, 'connection', true],
	['site connection delete', 'Remove a Site production connection.', site.deleteConnection, 'connection', false, true],
	['site database', 'Inspect Site database status.', site.getDatabase],
	['site storage', 'Inspect Site storage status.', site.getStorage],
	['site monitoring config', 'Inspect Site monitoring configuration.', site.getMonitoringConfig],
	['site monitoring config set', 'Configure Site monitoring.', site.setMonitoringConfig, null, true],
	['site monitoring synchronize', 'Synchronize Site monitoring.', site.synchronizeMonitoring],
	['site monitoring overview', 'Inspect Site request performance.', site.getMonitoringOverview, null, true],
	['site monitoring issues', 'List Site monitoring issues.', site.listMonitoringIssues, null, true],
	['site monitoring issue', 'Inspect a Site monitoring issue.', site.getMonitoringIssue, 'issue'],
	[
		'site monitoring issue resolve',
		'Resolve a Site monitoring issue.',
		site.resolveMonitoringIssue,
		'issue',
		false,
		true,
	],
	['site monitoring', 'Inspect Site production health.', site.getMonitoring],
	['site jobs', 'List Site production job runs.', site.listJobs],
	['site job', 'Inspect a Site job run.', site.getJob, 'job'],
	['site job retry', 'Retry a failed Site job.', site.retryJob, 'job', false, true],
	['site job cancel', 'Cancel a pending Site job.', site.cancelJob, 'job', false, true],
	['site schedules', 'List Site recurring jobs.', site.listSchedules],
	['site schedule activate', 'Activate or pause a Site schedule.', site.activateSchedule, 'schedule', true],
	['site auth', 'Inspect Site application authentication.', site.getAuth],
	['site auth configure', 'Save Site application sign-in draft.', site.configureAuth, null, true],
	['site auth clerk connect', 'Connect Clerk production keys from stdin.', site.connectClerk, null, true],
	['site auth verify', 'Verify a Site visitor session.', site.verifyAuth, null, true],
	['site preview', 'Read deployed page preview metadata.', site.getPreview],
	['site preview refresh', 'Refresh deployed page preview metadata.', site.refreshPreview],
	['site lifecycle', 'Inspect Site lifecycle and cleanup receipts.', site.getLifecycle],
	['site start', 'Start a released Site.', site.startSite],
	['site stop', 'Stop Site compute.', site.stopSite, null, false, true],
	['site archive', 'Archive a Site.', site.archiveSite, null, false, true],
	['site restore', 'Restore an archived Site.', site.restoreSite],
	['site delete', 'Delete a Site and purge managed resources.', site.deleteSite, null, false, true],
	['site database provision', 'Provision a managed Site database.', site.provisionDatabase, null, true],
	['site storage provision', 'Provision managed Site storage.', site.provisionStorage, null, true],
	['site maps', 'List Site map capabilities.', site.listMaps],
	['site map set', 'Configure a Site map capability.', site.setMap, 'capability', true],
	['site database tables', 'List production database tables.', site.listTables],
	['site database table create', 'Create a production database table.', site.createTable, null, true],
	['site database table', 'Inspect a production database table.', site.getTable, 'table'],
	['site database table update', 'Update a production database table.', site.updateTable, 'table', true],
	['site database table delete', 'Delete a production database table.', site.deleteTable, 'table', false, true],
	['site database rows', 'List production database rows.', site.listRows, 'table', true],
	['site database row create', 'Create a production database row.', site.createRow, 'table', true],
	['site database rows update', 'Update production database rows.', site.updateRows, 'table', true],
	['site database rows delete', 'Delete production database rows.', site.deleteRows, 'table', true, true],
	['site database inspect-query', 'Inspect a read-only production SQL query.', site.inspectQuery, null, true],
	['site database query', 'Execute a production SQL query.', site.executeQuery, null, true, true],
	['site database migrations', 'List Site database migrations.', site.listMigrations],
	['site storage files', 'List Site files.', site.listFiles, null, true],
	['site storage metadata', 'Inspect Site file metadata.', site.getFileMetadata, 'path'],
	['site storage content', 'Read Site file content as base64.', site.getFileContent, 'path'],
	['site storage download', 'Download Site file content as base64.', site.downloadFile, 'path'],
	['site storage upload', 'Upload a Site file from encoded content.', site.uploadFile, null, true],
	['site storage rename', 'Rename a Site file.', site.renameFile, null, true],
	['site storage delete', 'Delete a Site file.', site.deleteFile, null, true, true],
	['site storage folder create', 'Create a Site storage folder.', site.createFolder, null, true],
	['site storage usage', 'Inspect Site storage usage.', site.getStorageUsage],
	['site analytics config', 'Inspect Site analytics provider forwarding and availability.', site.getAnalyticsConfig],
	[
		'site analytics config set',
		'Enable or disable forwarding to eligible Site analytics providers.',
		site.setAnalyticsConfig,
		null,
		true,
	],
	[
		'site analytics source rotate',
		'Rotate the Site analytics source key.',
		site.rotateAnalyticsSource,
		null,
		false,
		true,
	],
	['site analytics providers', 'List Site analytics providers.', site.listAnalyticsProviders],
	['site analytics provider create', 'Create a Site analytics provider.', site.createAnalyticsProvider, null, true],
	['site analytics provider', 'Inspect a Site analytics provider.', site.getAnalyticsProvider, 'provider'],
	[
		'site analytics provider update',
		'Update a Site analytics provider.',
		site.updateAnalyticsProvider,
		'provider',
		true,
	],
	[
		'site analytics provider delete',
		'Delete a Site analytics provider.',
		site.deleteAnalyticsProvider,
		'provider',
		false,
		true,
	],
	['site analytics events', 'List Site analytics events.', site.listAnalyticsEvents, null, true],
	['site analytics event', 'Inspect a Site analytics event.', site.getAnalyticsEvent, 'event'],
	['site analytics deliveries', 'List Site analytics deliveries.', site.listAnalyticsDeliveries, null, true],
	['site analytics delivery', 'Inspect a Site analytics delivery.', site.getAnalyticsDelivery, 'delivery'],
] as const;
for (const [name, description, handler, extra, hasData, needsConfirmation] of siteOperations) {
	const command = cli
		.command(name)
		.describe(description)
		.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
		.option('--site', 'Site UUID.');
	if (extra) command.option(`--${extra}`, `${extra} identifier.`);
	if (hasData) command.option('--data', 'JSON object or - for stdin.');
	if (needsConfirmation) command.option('--yes', 'Confirm this operation.', false);
	command.action(run(handler));
}

// Auth
cli
	.command('login')
	.describe('Sign in using a developer API key.')
	.option('--token-stdin', 'Read and store a key from stdin.', false)
	.action(run(auth.login));

cli.command('status').describe('Show identity and selected context.').action(run(auth.status));

cli.command('logout').describe('Remove stored credentials and context.').action(run(auth.logout));

// Templates
cli
	.command('templates')
	.describe('Explore public templates.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.option('--include', 'Comma-separated relations: categories, license, stats.')
	.option('--category', 'Category identifier from categories.')
	.option('--kind', 'Template kind: project or agent.')
	.example('templates --category business --kind project')
	.action(run(templates.listTemplates));

cli
	.command('template')
	.describe('Get a public template.')
	.option('--template', 'Template identifier.')
	.option('--include', 'Comma-separated relations: categories, license, stats.')
	.action(run(templates.getTemplate));

// Categories
cli
	.command('categories')
	.describe('Explore categories.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.action(run(categories.listCategories));

// Collections
cli
	.command('collections')
	.describe('Explore collections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.action(run(collections.listCollections));

// Creators
cli
	.command('creators')
	.describe('Explore public creators.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.action(run(creators.listWorkspaces));

// Workspace
cli
	.command('workspace update')
	.describe('Update the active workspace profile.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace update --data \'{"name":"Acme"}\'')
	.action(run(workspace.updateWorkspace));

cli
	.command('workspace list')
	.describe('List your workspaces.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.action(run(workspace.listWorkspace));

cli.command('workspace current').describe('Show the active workspace.').action(run(workspace.currentWorkspace));

cli
	.command('workspace chats')
	.describe('List Workspace Chats.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100).')
	.option('--query', 'Search Chat names.')
	.option('--archived', 'List archived Chats.', false)
	.action(run(workspace.listWorkspaceChats));

cli
	.command('workspace chat')
	.describe('Read a Chat and its sole conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--chat', 'Chat UUID.')
	.action(run(workspace.getWorkspaceChat));

cli
	.command('workspace chat create')
	.describe('Create a Chat with one conversation; does not dispatch inference.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON name and stable idempotencyKey or - for stdin.')
	.action(run(workspace.createWorkspaceChat));

cli
	.command('workspace chat update')
	.describe('Rename, archive, restore or delete a Chat using its revision.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--chat', 'Chat UUID.')
	.option('--data', 'JSON action and revision or - for stdin; deletion also requires the exact name in confirmation.')
	.option('--yes', 'Confirm archival or deletion.', false)
	.action(run(workspace.updateWorkspaceChat));

cli
	.command('project channels')
	.describe('Inspect Project channel assignments and readiness.')
	.option('--workspace', 'Workspace UUID.')
	.option('--project', 'Project UUID.')
	.action(run(workspace.listChannels));

cli
	.command('workspace chat working-files')
	.describe('Chat working files: get, download, replace, preview, or save.')
	.action(() => cli.help('workspace chat working-files'));

for (const operation of ['get', 'download', 'replace', 'preview', 'save'])
	cli
		.command(`workspace chat working-files ${operation}`)
		.describe('Inspect, edit, preview or snapshot Chat working files. Background References are unchanged.')
		.option('--workspace', 'Explicit Workspace UUID.')
		.option('--chat', 'Chat UUID.')
		.option('--output', 'Destination ZIP path for download; existing files are never overwritten.')
		.option('--data', 'JSON revision and operation input or - for stdin; saves require a stable requestId.')
		.action(run(options => workspace.workingFiles(options, operation)));
for (const operation of ['get', 'create', 'revise', 'save'])
	cli
		.command(`workspace plan ${operation}`)
		.describe('Read or edit a conversation Plan; never grants execution approval.')
		.option('--workspace', 'Explicit Workspace UUID.')
		.option('--project', 'Owning Project UUID when applicable.')
		.option('--conversation', 'Conversation UUID.')
		.option('--plan', 'Plan UUID; omit to read the current Plan.')
		.option('--revision', 'Exact revision to read.')
		.option('--data', 'JSON content, revision or save requestId, or - for stdin.')
		.action(run(options => workspace.conversationPlans(options, operation)));

cli
	.command('workspace chat-schedules')
	.describe('List Chat scheduled messages.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Filter by the Chat owning this conversation UUID.')
	.action(run(workspace.listChatSchedules));

cli
	.command('workspace chat-schedule')
	.describe('Read a saved Chat message and occurrence history.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--schedule', 'Schedule UUID.')
	.action(run(workspace.getChatSchedule));

cli
	.command('workspace chat-schedule preview')
	.describe('Preview recurrence without scheduling execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON timing configuration or - for stdin.')
	.action(run(workspace.previewChatSchedule));

cli
	.command('workspace chat-schedule create')
	.describe('Save a self-contained Chat scheduled message; does not run it now.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON instruction, origin, model, destination and timing or - for stdin.')
	.option('--yes', 'Confirm enabling future scheduled execution.', false)
	.action(run(workspace.createChatSchedule));

cli
	.command('workspace chat-schedule update')
	.describe('Update, pause, resume, delete or run a saved Chat message using its expectedRevision.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--schedule', 'Schedule UUID.')
	.option('--data', 'JSON action and expectedRevision; run also requires a stable idempotencyKey.')
	.option('--yes', 'Confirm execution or deletion effects.', false)
	.action(run(workspace.updateChatSchedule));

cli.command('workspace clear').describe('Exit local workspace context.').action(run(workspace.clearWorkspace));

cli
	.command('workspace use')
	.describe('Select a workspace.')
	.option('--workspace', 'Workspace identifier; prompts when omitted.')
	.action(run(workspace.useWorkspace));

cli
	.command('workspace open')
	.describe('Open this resource in Playbooks.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.openWorkspace));

cli
	.command('workspace template update')
	.describe('Update an owned template listing.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--template', 'Template identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace template update --template abc --data \'{"description":"Customer portal starter"}\'')
	.action(run(workspace.updateTemplate));

cli
	.command('workspace template publish')
	.describe('Publish a template version to the marketplace.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--template', 'Template identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'workspace template publish --template abc --data \'{"acknowledgment":true,"expectedRevision":"2026-11-03T12:00:00.000Z","sourceRevision":"revision-from-working-tree","notes":"Updated scheduled message"}\' --yes',
	)
	.action(run(workspace.publishTemplate));

cli
	.command('workspace templates')
	.describe('List owned templates.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.option('--include', 'Comma-separated relations: categories, license, stats.')
	.option('--category', 'Category identifier from categories.')
	.option('--kind', 'Template kind: project or agent.')
	.example('workspace templates --category business --kind project')
	.action(run(workspace.listTemplates));

cli
	.command('workspace template')
	.describe('Get an owned template.')
	.option('--template', 'Template identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--include', 'Comma-separated relations: categories, license, stats.')
	.action(run(workspace.getTemplate));

cli
	.command('workspace template versions')
	.describe('List template versions.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--template', 'Template identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listTemplateVersions));

cli
	.command('workspace template open')
	.describe('Open this resource in Playbooks.')
	.option('--template', 'Template identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.openTemplate));

cli
	.command('workspace member departure-preview')
	.describe('Review removal of a member by user ID.')
	.option('--member', 'Member user identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.previewMemberDeparture));

cli
	.command('workspace member depart')
	.describe('Remove a member using the reviewed revision and ownership recipient.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--member', 'Member user identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace member depart --member abc --data \'{"revision":"CURRENT_REVISION","toUserId":123}\' --yes')
	.action(run(workspace.removeMember));

cli
	.command('workspace members')
	.describe('List workspace members.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listMembers));

cli
	.command('workspace member')
	.describe('Get a workspace member.')
	.option('--member', 'Member identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.getMember));

cli
	.command('workspace member update')
	.describe('Update a workspace member role.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--member', 'Member identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace member update --member abc --data \'{"memberRole":"collaborator"}\' --yes')
	.action(run(workspace.updateMember));

cli
	.command('workspace invitations')
	.describe('List workspace invitations.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listInvitations));

cli
	.command('workspace invitation create')
	.describe('Invite a workspace member.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace invitation create --data \'{"email":"teammate@example.com","role":"collaborator"}\' --yes')
	.action(run(workspace.createInvitation));

cli
	.command('workspace invitation revoke')
	.describe('Revoke a pending invitation.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--invitation', 'Invitation identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.revokeInvitation));

cli
	.command('workspace settings')
	.describe('Get workspace operator preferences and instructions.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.getWorkspacePreferences));

cli
	.command('workspace settings update')
	.describe('Update workspace operator preferences.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace settings update --data \'{"instructions":"Use concise responses."}\'')
	.action(run(workspace.updateWorkspacePreferences));

cli
	.command('workspace designs')
	.describe('List available workspace designs.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--query', 'Search text.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listWorkspaceDesigns));

cli
	.command('workspace skills')
	.describe('List available workspace skills.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.action(run(workspace.listWorkspaceSkills));

cli
	.command('workspace mcps')
	.describe('List workspace MCP connections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.action(run(workspace.listWorkspaceMcps));

cli
	.command('workspace connectors')
	.describe('List workspace connector connections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.listWorkspaceConnectors));

cli
	.command('workspace secrets')
	.describe('List safe workspace secret metadata.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.listWorkspaceSecrets));

cli
	.command('workspace references')
	.describe('List Workspace References.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(workspace.listWorkspaceReferences));

cli
	.command('workspace reference download')
	.describe('Download a Workspace-owned Reference.')
	.option('--output', 'New destination file.')
	.option('--reference', 'Reference identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.downloadWorkspaceReference));

cli
	.command('workspace reference upload')
	.describe('Upload a Reference; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative Reference filename.')
	.option('--revision', 'Existing file revision when replacing.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.uploadWorkspaceReference));

cli
	.command('workspace budget update')
	.describe('Update the workspace credit budget.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace budget update --data \'{"creditBudget":100}\' --yes')
	.action(run(workspace.updateBudgetOperations));

cli
	.command('workspace inbox')
	.describe('List Inbox conversations and requests (defaults to needs attention).')
	.option('--view', 'attention, mentions, or all.')
	.option('--scope', 'all, workspace, or project:<uuid>.')
	.option('--type', 'all, approval, question, review, failure, mention, reply, or report.')
	.option('--search', 'Search Inbox text.')
	.option('--conversation', 'Filter by conversation UUID; bypasses view and source filters.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listInbox));

cli
	.command('workspace inbox count')
	.describe('Get Workspace Inbox counts for all, attention, mentions, and unread.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.countInbox));

cli
	.command('workspace inbox read')
	.describe('Mark a conversation read through a loaded message; Project conversations require branchId.')
	.option('--conversation', 'Conversation UUID.')
	.option('--data', 'JSON with throughMessageId and optional branchId, or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.markInboxRead));

cli
	.command('workspace inbox read-all')
	.describe('Mark all accessible Inbox conversations read for your account in this Workspace.')
	.option('--yes', 'Confirm marking all Inbox conversations read.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.markAllInboxRead));

cli
	.command('workspace activity')
	.describe('List workspace activity.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.activityOperations));

cli
	.command('workspace usage')
	.describe('Inspect workspace usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.usageOperations));

cli
	.command('workspace budget')
	.describe('Inspect the workspace budget.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.budgetOperations));

cli
	.command('workspace credits')
	.describe('List workspace credit records.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.creditsOperations));

cli
	.command('workspace invoices')
	.describe('List workspace invoices.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.invoicesOperations));

cli
	.command('workspace settlements')
	.describe('List verified creator settlements.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.settlementsOperations));

cli
	.command('workspace settlement <settlementId>')
	.describe('Inspect a creator settlement or settlement adjustment.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.settlementOperations));

cli
	.command('workspace transfers')
	.describe('List workspace transfers.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.transfersOperations));

cli
	.command('workspace domains')
	.describe('List workspace domains.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listDomains));

cli
	.command('workspace domain')
	.describe('Inspect a domain.')
	.option('--domain', 'Domain identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.getDomain));

cli
	.command('workspace domain add')
	.describe('Add an existing external domain; does not purchase a domain.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace domain add --data \'{"name":"app.example.com"}\'')
	.action(run(workspace.addDomain));

cli
	.command('workspace domain records')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.describe('Inspect DNS records.')
	.option('--domain', 'Domain identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listRecords));

cli
	.command('workspace domain record')
	.describe('DNS record commands: workspace domain record create, update, delete.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown DNS record action. See workspace domain record --help.');
		cli.help('workspace domain record');
	});

cli
	.command('workspace domain record create')
	.describe('Create a DNS record.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'workspace domain record create --domain abc --data \'{"type":"TXT","name":"_verification","value":"verification-value","ttl":300}\' --yes',
	)
	.action(run(workspace.createRecord));

cli
	.command('workspace domain record update')
	.describe('Update a DNS record.')
	.option('--record', 'DNS record identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'workspace domain record update --domain abc --record abc --data \'{"type":"TXT","name":"_verification","value":"updated-value","ttl":300}\' --yes',
	)
	.action(run(workspace.updateRecord));

cli
	.command('workspace domain record delete')
	.describe('Delete a DNS record.')
	.option('--record', 'DNS record identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.deleteRecord));

// Project
cli
	.command('projects')
	.describe('List projects in the active workspace.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt.')
	.option('--include', 'Comma-separated relations: type, projectOwner, branches, deploy.')
	.option('--owner', 'Numeric user ID of the project owner.')
	.example('projects --sort name:asc')
	.action(run(project.listProjects));

cli
	.command('project')
	.describe('Get a project.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--include', 'Comma-separated relations: type, projectOwner, branches, deploy.')
	.example('project --project abc --include type')
	.action(run(project.getProject));

cli
	.command('project create')
	.describe('Create a blank project.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project create --data \'{"name":"Customer portal"}\'')
	.action(run(project.createProject));

cli
	.command('project update')
	.describe('Update project details.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project update --project abc --data \'{"description":"Customer support app"}\'')
	.action(run(project.updateProject));

cli
	.command('project publication')
	.describe('Inspect publication readiness.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getPublication));

cli
	.command('project export')
	.describe('Download project source.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--output', 'New destination file.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.exportProject));

cli
	.command('project lifecycle')
	.describe('Inspect lifecycle state and confirmation requirements.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectLifecycle));

cli
	.command('project archive')
	.describe('Archive the project.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project archive --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.archiveProject));

cli
	.command('project restore')
	.describe('Restore the project.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project restore --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.restoreProject));

cli
	.command('project delete')
	.describe('Permanently delete the project.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project delete --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.deleteProject));

cli
	.command('project open')
	.describe('Open this resource in Playbooks.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.openProject));

cli
	.command('project ownership')
	.describe('Inspect the pending project ownership request.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getOwnershipRequest));

cli
	.command('project ownership transfer')
	.describe('Request project ownership transfer to an active member.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project ownership transfer --project abc --data \'{"toUserId":123}\' --yes')
	.action(run(project.transferOwnership));

cli
	.command('project ownership accept')
	.describe('Accept a project ownership request addressed to you.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.acceptOwnership));

cli
	.command('project ownership decline')
	.describe('Decline a project ownership request.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.declineOwnership));

cli
	.command('project ownership cancel')
	.describe('Cancel a pending project ownership request.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.cancelOwnership));

cli
	.command('project collaborator')
	.describe('Collaborator commands: project collaborator add, update.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown collaborator action. See project collaborator --help.');
		cli.help('project collaborator');
	});

cli
	.command('project collaborator add')
	.describe('Grant project access to an existing workspace member.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project collaborator add --project abc --data \'{"userId":123,"role":"collaborator"}\' --yes')
	.action(run(project.addCollaborator));

cli
	.command('project collaborator update')
	.describe('Update project collaborator access.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--collaborator', 'Collaborator identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project collaborator update --project abc --collaborator abc --data \'{"role":"collaborator"}\' --yes')
	.action(run(project.updateCollaborator));

cli
	.command('project collaborators')
	.describe('List project collaborators.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(project.listCollaborators));

cli
	.command('project agents')
	.describe('List project agents.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listAgents));

cli
	.command('project agent')
	.describe('Get a project agent.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--agent', 'Agent identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getAgent));

cli
	.command('project agent create')
	.describe('Create a project agent without starting a run.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project agent create --project abc --data \'{"name":"Research assistant","creationKey":"unique-creation-key"}\'',
	)
	.action(run(project.createAgent));

cli
	.command('project agent update')
	.describe('Enable or disable a project agent.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--agent', 'Agent identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project agent update --project abc --agent abc --data \'{"status":"disabled","revision":1}\' --yes')
	.action(run(project.updateAgent));

cli
	.command('project resources state')
	.describe('Inspect the project resource selection revision.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getResourceState));

cli
	.command('project resources update')
	.describe('Update revision-checked project resource selections.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project resources update --project abc --data \'{"revision":"CURRENT_REVISION","designId":null}\'')
	.action(run(project.updateProjectResources));

cli
	.command('project designs')
	.describe('List project-owned designs.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(project.listProjectDesigns));

cli
	.command('project design')
	.describe('Design commands: project design create, update.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Design action. See project design --help.');
		cli.help('project design');
	});

cli
	.command('project design create')
	.describe('Create a project design from package files.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project design create --project abc --data \'{"name":"Brand design","files":[{"path":"DESIGN.md","content":"BASE64_CONTENT"}]}\'',
	)
	.action(run(project.createProjectDesign));

cli
	.command('project design update')
	.describe('Update a project-owned design.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--design', 'Design identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project design update --project abc --design abc --data \'{"name":"Brand design","revision":"CURRENT_CHECKSUM"}\'',
	)
	.action(run(project.updateProjectDesign));

cli
	.command('project skills')
	.describe('List project-owned skills.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(project.listProjectSkills));

cli
	.command('project skill')
	.describe('Skill commands: project skill create, update.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Skill action. See project skill --help.');
		cli.help('project skill');
	});

cli
	.command('project skill create')
	.describe('Create a project skill from package files.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project skill create --project abc --data \'{"name":"Review changes","files":[{"path":"SKILL.md","content":"BASE64_CONTENT"}]}\'',
	)
	.action(run(project.createProjectSkill));

cli
	.command('project skill update')
	.describe('Update a project-owned skill.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--skill', 'Skill identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project skill update --project abc --skill abc --data \'{"name":"Review changes","revision":"CURRENT_CHECKSUM"}\'',
	)
	.action(run(project.updateProjectSkill));

for (const [name, description, handler] of [
	['project agent-access', 'Inspect Project development access to Workspace Agents.', project.getAgentAccess],
	['project agent-access update', 'Enable or disable Project access to Workspace Agents.', project.updateAgentAccess],
	[
		'project agent-access rotate',
		'Rotate Project Agent runtime credentials; requires Sandbox restart.',
		project.rotateAgentAccess,
	],
] as const) {
	cli
		.command(name)
		.describe(description)
		.option('--project', 'Project UUID.')
		.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
		.option('--data', 'JSON object containing enabled, or - for stdin.')
		.option('--yes', 'Confirm changing runtime credentials.')
		.action(run(handler));
}

cli
	.command('project settings')
	.describe('Get project preferences and instructions.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectPreferences));

cli
	.command('project settings update')
	.describe('Update project preferences.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project settings update --project abc --data \'{"instructions":"Use concise responses.","revision":"CURRENT_REVISION"}\'',
	)
	.action(run(project.updateProjectPreferences));

cli
	.command('project resources')
	.describe('Inspect project resource assignments.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectResources));

cli
	.command('project mcps')
	.describe('List project-owned MCP connections.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.action(run(project.listProjectMcps));

cli
	.command('project connectors')
	.describe('List project connector assignments.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100 for operational projects).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(project.listProjectConnectors));

cli
	.command('project references')
	.describe('List Project References.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(project.listProjectReferences));

cli
	.command('project file')
	.describe('Agent file commands: project file download, upload.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Reference action. See project file --help.');
		cli.help('project file');
	});

cli
	.command('project file download')
	.describe('Download a Project-owned Reference.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--output', 'New destination file.')
	.option('--file-id', 'File-id identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.downloadProjectFile));

cli
	.command('project file upload')
	.describe('Upload a Reference; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative Reference filename.')
	.option('--revision', 'Existing file revision when replacing.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.uploadProjectFile));

cli
	.command('project source connect')
	.describe('Connect a repository; source may be replaced unless preserveSource is supported and selected.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project source connect --project abc --data \'{"provider":"github","githubInstallationId":123,"githubRepositoryId":456,"preserveSource":true}\' --yes',
	)
	.action(run(project.connectSource));

cli
	.command('project source disconnect')
	.describe('Disconnect the project repository.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.disconnectSource));

cli
	.command('project source sync')
	.describe('Synchronize source using the reviewed Git head.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project source sync --project abc --data \'{"branchId":123,"expectedHead":"CURRENT_COMMIT_SHA"}\' --yes')
	.action(run(project.syncSource));

cli
	.command('project branch')
	.describe('Branch command: project branch create.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown branch action. See project branch --help.');
		cli.help('project branch');
	});

cli
	.command('project branch create')
	.describe('Create a branch from a selected base branch.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project branch create --project abc --data \'{"name":"feature/customer-portal","baseBranch":"main"}\'')
	.action(run(project.createBranch));

cli
	.command('project checkpoint')
	.describe('Checkpoint commands: project checkpoint rename, restore.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown checkpoint action. See project checkpoint --help.');
		cli.help('project checkpoint');
	});

cli
	.command('project checkpoint rename')
	.describe('Rename a project checkpoint.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--checkpoint', 'Checkpoint identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project checkpoint rename --project abc --checkpoint abc --data \'{"label":"Before settings update"}\'')
	.action(run(project.renameCheckpoint));

cli
	.command('project checkpoint restore')
	.describe('Restore a source checkpoint; application data is unchanged.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--checkpoint', 'Checkpoint identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.restoreCheckpoint));

cli
	.command('project source')
	.describe('Inspect project source control.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getSourceStatus));

cli
	.command('project branches')
	.describe('List project branches.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt, position.')
	.action(run(project.listBranches));

cli
	.command('project checkpoints')
	.describe('List project checkpoints.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listCheckpoints));

cli
	.command('project source import')
	.describe('Replace project source with a zip archive.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--upload', 'Local source zip.')
	.option('--yes', 'Confirm source replacement.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.importSource));

cli
	.command('project sandbox')
	.describe('Inspect project sandbox configuration and resize status.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.sandboxOperations));

cli
	.command('project sandbox configure')
	.describe('Configure version-checked Sandbox services, primary service, runtime, lifecycle, or network.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON configuration object, or - to read stdin.')
	.action(run(project.configureSandbox));

cli
	.command('project logs')
	.describe('Read project logs.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--query', 'Search text.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--cursor', 'Cursor from meta.nextCursor for the next log page.')
	.example('project logs --project abc --query error --page-size 50')
	.action(run(project.logsOperations));

cli
	.command('project schedules')
	.describe('List saved project schedules.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page (default 0).')
	.option('--page-size', 'Records per page (1-100; default 20).')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listSchedules));

cli
	.command('project schedule')
	.describe('Inspect a saved schedule and its runs.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--schedule', 'Schedule identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getSchedule));

cli
	.command('project schedule create')
	.describe('Create a self-contained scheduled message.')
	.option('--yes', 'Confirm enabling scheduled execution.', false)
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project schedule create --project abc --data \'{"name":"Daily review","instructions":"Summarize the saved Project changes."}\'',
	)
	.action(run(project.createSchedule));

cli
	.command('project schedule update')
	.describe('Update a scheduled message atomically.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--schedule', 'Schedule identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project schedule update --project abc --data \'{"name":"Daily review","revision":1}\' --yes')
	.action(run(project.updateSchedule));

cli
	.command('project schedule delete')
	.describe('Delete a saved scheduled message; retain execution history.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--schedule', 'Schedule identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project schedule delete --project abc --data \'{"revision":1}\' --yes')
	.action(run(project.deleteSchedule));

cli
	.command('project schedule run')
	.option('--data', 'JSON object containing revision and a stable requestKey; reuse for retries.')
	.describe('Run saved work now; may send notifications, change external systems, and incur usage charges.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--schedule', 'Schedule identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.runSchedule));

cli
	.command('project schedule runs')
	.describe('Read scheduled-message runs.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project.')
	.option('--target-test', 'Test UUID under this Project.')
	.option('--schedule', 'Schedule UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page (1-100).')
	.action(run(project.listScheduleRuns));

cli
	.command('project schedule occurrences')
	.describe('Read scheduled-message occurrences.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project.')
	.option('--target-test', 'Test UUID under this Project.')
	.option('--schedule', 'Schedule UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page (1-100).')
	.action(run(project.listScheduleOccurrences));

cli
	.command('project schedule run-detail')
	.describe('Read scheduled-message run-detail.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project.')
	.option('--target-test', 'Test UUID under this Project.')
	.option('--schedule', 'Schedule UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--run', 'Run UUID.')
	.action(run(project.getScheduleRun));

// Operator conversations, messages, and runs
cli
	.command('workspace conversation')
	.describe('Get a conversation; the default may initialize the primary conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.action(run(workspace.getConversation));

cli
	.command('workspace messages')
	.describe('List recent operator messages.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--cursor', 'Continuation cursor from meta.nextCursor.')
	.option('--page-size', 'Input messages per window, 1-100; output messages are included.')
	.action(run(workspace.listMessages, outputMessages));

cli
	.command('workspace message')
	.describe('Get an operator message and available run references.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--message', 'Numeric message identifier.')
	.action(run(workspace.getMessage));

cli
	.command('workspace message update')
	.describe('Edit a pending queued message before execution begins.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--message', 'Numeric message identifier.')
	.option('--data', 'JSON object or - for stdin: text, queuedMode, queuedModelId.')
	.action(run(workspace.updateMessage));

cli
	.command('workspace message create')
	.describe('Submit a message; may start or steer execution and incur usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--data', 'JSON object or - for stdin; reuse idempotencyKey when retrying identical input.')
	.option('--yes', 'Confirm this operation.', false)
	.example('workspace message create --data \'{"text":"Review the current setup","mode":"plan"}\' --yes')
	.action(run(workspace.createMessage));

cli
	.command('workspace message delete')
	.describe('Cancel a queued message; retains message history.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--message', 'Numeric message identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(workspace.deleteMessage));

cli
	.command('workspace runs')
	.describe('List operator runs and attempts.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--message', 'Filter by numeric input message identifier.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page, 1-100.')
	.example('workspace runs --message 123')
	.action(run(workspace.listRuns));

cli
	.command('workspace run')
	.describe('Get an operator run with its available input and output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--run', 'Numeric run identifier.')
	.action(run(workspace.getRun));

cli
	.command('workspace run stream')
	.describe('Follow operator run output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--run', 'Numeric run identifier.')
	.option('--timeout', 'Total stream duration in seconds; defaults to 1800.')
	.example('workspace run stream --run 456')
	.action(run(workspace.streamOperatorRun));

cli
	.command('project conversation')
	.describe('Get a conversation; the default may initialize the primary conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.action(run(project.getConversation));

cli
	.command('project conversations')
	.describe('List project conversations; may initialize the primary conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.action(run(project.listConversations));

cli
	.command('project messages')
	.describe('List recent operator messages.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--cursor', 'Continuation cursor from meta.nextCursor.')
	.option('--page-size', 'Input messages per window, 1-100; output messages are included.')
	.action(run(project.listMessages, outputMessages));

cli
	.command('project message')
	.describe('Get a sandbox conversation message.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--message', 'Numeric message identifier.')
	.action(run(project.getMessage));

cli
	.command('project message create')
	.describe('Submit a message; may start or steer execution and incur usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.example('project message create --project portal --data \'{"text":"Review the current setup","mode":"plan"}\' --yes')
	.action(run(project.createMessage));

cli
	.command('project message update')
	.describe('Edit a queued sandbox message.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--message', 'Numeric message identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.example('project message update --project portal --message 123 --data \'{"text":"Review authentication first"}\'')
	.action(run(project.updateMessage));

cli
	.command('project message delete')
	.describe('Cancel a queued message; retains message history.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--message', 'Numeric message identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.deleteMessage));

cli
	.command('project runs')
	.describe('List operator runs and attempts.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Filter by conversation UUID.')
	.option('--branch', 'Filter by numeric branch identifier.')
	.option('--message', 'Filter by numeric input message identifier.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page, 1-100.')
	.example('project runs --project portal --message 123')
	.action(run(project.listRuns));

cli
	.command('project run')
	.describe('Get an operator run with its available input and output.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--run', 'Numeric run identifier.')
	.action(run(project.getRun));

cli
	.command('project run stream')
	.describe('Observe run output without starting execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--run', 'Numeric run identifier.')
	.option('--timeout', 'Total stream duration in seconds; defaults to 1800.')
	.example('project run stream --project portal --run 456')
	.action(run(project.streamOperatorRun));

// MCP
cli
	.command('mcp install <target>')
	.describe('Install for claude, codex, cursor, or vscode.')
	.action(run(mcp.installMcp));

// Completion
cli
	.command('completion print <shell>')
	.describe('Print completion for bash or zsh.')
	.action(shell =>
		completion.printCompletion(shell, [
			'login',
			'status',
			'logout',
			'workspace',
			'projects',
			'project',
			'templates',
			'template',
			'categories',
			'collections',
			'creators',
			'mcp',
			'completion',
		]),
	);

cli
	.command('project tests')
	.describe('List Tests and their operation history.')
	.option('--project', 'Parent Project UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--search', 'Search operation titles.')
	.option('--before', 'Operation cursor from the previous response.')
	.action(run(project.listTests));

cli
	.command('project test')
	.describe('Inspect a Test, admission and capabilities.')
	.option('--project', 'Parent Project UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--test', 'Test UUID.')
	.action(run(project.getTest));

cli
	.command('project test operation')
	.describe('Inspect a Test operation, findings and evidence.')
	.option('--project', 'Parent Project UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--test', 'Test UUID.')
	.option('--operation', 'Test operation UUID.')
	.action(run(project.getTestOperation));

cli
	.command('project test create')
	.describe('Create and prepare an isolated Test.')
	.option('--project', 'Parent Project UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--data', 'JSON body with a durable requestKey, or - for stdin.')
	.option('--yes', 'Confirm creation and possible usage.', false)
	.action(run(project.createTest));

cli
	.command('project test action')
	.describe('Apply a Test lifecycle action using current capabilities and revisions.')
	.option('--project', 'Parent Project UUID.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--test', 'Test UUID.')
	.option(
		'--action',
		'test, data, reset, delete, stop, sleep, refresh, reset-workspace, preview-start, preview-stop, preview-restart.',
	)
	.option(
		'--data',
		'JSON body or - for stdin; preserve requestKey on retries. Stop requires operationId; destructive resets require revision and confirm.',
	)
	.option('--yes', 'Confirm the reviewed operation.', false)
	.action(run(project.testAction));

cli
	.command('project run control')
	.describe('Inspect current run controls and unavailable reasons.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--run', 'Run identifier.')
	.action(run(project.getRunControl));

cli
	.command('project run cancel')
	.describe('Request stop for the selected run.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--run', 'Run identifier.')
	.option('--yes', 'Confirm the reviewed operation.', false)
	.action(run(project.cancelRun));

cli
	.command('project run replace')
	.describe('Replace a terminal turn, retaining history and prior side effects.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--run', 'Run identifier.')
	.option('--data', 'JSON body or - for stdin.')
	.option('--yes', 'Confirm the reviewed operation.', false)
	.action(run(project.replaceRun));

cli
	.command('project conversation create')
	.describe('Create a conversation within the selected execution environment.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--data', 'JSON body or - for stdin.')
	.action(run(project.createConversation));

cli
	.command('project conversation fork')
	.describe('Summarize saved context into a new chat in the same environment; starts no run.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation identifier.')
	.option('--data', 'JSON body or - for stdin.')
	.option('--yes', 'Confirm the reviewed operation.', false)
	.action(run(project.forkConversation));

cli
	.command('project message respond')
	.describe('Submit structured prompt responses using the current prompt data.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID under this Project; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID under this Project; mutually exclusive with --target-agent.')
	.option('--conversation', 'Conversation identifier.')
	.option('--branch', 'Branch identifier.')
	.option('--message', 'Message identifier.')
	.option('--data', 'JSON body or - for stdin.')
	.option('--yes', 'Confirm the reviewed operation.', false)
	.action(run(project.respondToMessage));

cli
	.command('project usage')
	.describe('Inspect scoped Project usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID; mutually exclusive with --target-agent.')
	.action(run(project.getProjectUsage));

cli
	.command('project budget')
	.describe('Inspect scoped Project budget.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID; mutually exclusive with --target-agent.')
	.action(run(project.getProjectBudget));

cli
	.command('project budget update')
	.describe('Update scoped Project budget.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--target-agent', 'Agent UUID; mutually exclusive with --target-test.')
	.option('--target-test', 'Test UUID; mutually exclusive with --target-agent.')
	.option('--data', 'JSON body or - for stdin.')
	.option('--yes', 'Confirm the reviewed budget update.', false)
	.action(run(project.updateProjectBudget));

try {
	const args = process.argv.slice();
	// Sade's parser drops a standalone dash; preserve the stdin marker as a flag value.
	for (let index = 2; index < args.length - 1; index++) {
		if (args[index] === '--') break;
		if (args[index] === '--data' && args[index + 1] === '-') args.splice(index, 2, '--data=-');
	}
	if (args.length === 2) cli.help();
	else
		cli.parse(args, {
			string: ['data', 'query', 'sort', 'include', 'category', 'type', 'owner', 'cursor'],
			unknown: flag => {
				throw new CliError(422, `Unknown option: ${flag}`);
			},
		});
} catch (error) {
	reportError(error);
}
process.once('SIGINT', () => {
	if (process.exitCode !== 130) process.exit(130);
});
