import os from 'node:os';
import path from 'node:path';

import sade from 'sade';
import {
	auth,
	categories,
	collections,
	completion,
	creators,
	mcp,
	project,
	templates,
	types,
	workspace,
} from 'src/commands';
import { CliError } from 'src/services/cli-client';
import { run } from 'src/utils/cli-command';
import { reportError } from 'src/utils/cli-output';

import { version } from '../package.json';

const cli = sade('playbooks').version(version);
cli.describe('Manage Playbooks from your terminal.');
cli.option('--config', 'Isolated context file.', path.join(os.homedir(), '.config', 'playbooks', 'config.json'));
cli.option('--json', 'Print a JSON response envelope.', false);
cli.option('--select', 'Select comma-separated output fields.');

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
	.describe('Explore public Templates.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(templates.listTemplates));

cli
	.command('template')
	.describe('Get a public Template.')
	.option('--template', 'Template identifier.')
	.action(run(templates.getTemplate));

// Categories
cli
	.command('categories')
	.describe('Explore Categories.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(categories.listCategories));

// Collections
cli
	.command('collections')
	.describe('Explore Collections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(collections.listCollections));

// Creators
cli
	.command('creators')
	.describe('Explore public creators.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(creators.listWorkspaces));

// Types
cli
	.command('types')
	.describe('List curated Project Types.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(types.listTypes));

// Workspace
cli
	.command('workspace update')
	.describe('Update the active Workspace profile.')
	.option('--file', 'JSON input file or - for stdin. Fields: thumbnail, name, tagline, description, visibility, urls.')
	.action(run(workspace.updateWorkspace));

cli.command('workspace list').describe('List your Workspaces.').action(run(workspace.listWorkspace));

cli.command('workspace current').describe('Show the active Workspace.').action(run(workspace.currentWorkspace));

cli.command('workspace clear').describe('Exit local Workspace context.').action(run(workspace.clearWorkspace));

cli
	.command('workspace use')
	.describe('Select a Workspace; clears Project context.')
	.option('--workspace', 'Workspace identifier; prompts when omitted.')
	.action(run(workspace.useWorkspace));

cli.command('workspace open').describe('Open this resource in Playbooks.').action(run(workspace.openWorkspace));

cli
	.command('workspace folders')
	.describe('List Workspace Folders.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listFolders));

cli
	.command('workspace folder')
	.describe('Get a Folder.')
	.option('--include', 'Inline related records.')
	.option('--folder', 'Folder identifier.')
	.action(run(workspace.getFolder));

cli
	.command('workspace folder create')
	.describe('Create a Folder.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, description.')
	.action(run(workspace.createFolder));

cli
	.command('workspace folder update')
	.describe('Update a Folder.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, description.')
	.option('--folder', 'Folder identifier.')
	.action(run(workspace.updateFolder));

cli
	.command('workspace template update')
	.describe('Update an owned Template listing.')
	.option(
		'--file',
		'JSON input file or - for stdin. Fields: name, tagline, description, cover, thumbnail, licenseId, categoryIds.',
	)
	.option('--template', 'Template identifier.')
	.action(run(workspace.updateTemplate));

cli
	.command('workspace template publish')
	.describe('Publish a Template version to the marketplace.')
	.option('--file', 'JSON input file or - for stdin. Fields: .')
	.option('--yes', 'Confirm this operation.', false)
	.option('--template', 'Template identifier.')
	.action(run(workspace.publishTemplate));

cli
	.command('workspace templates')
	.describe('List owned Templates.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listTemplates));

cli
	.command('workspace template')
	.describe('Get an owned Template.')
	.option('--include', 'Inline related records.')
	.option('--template', 'Template identifier.')
	.action(run(workspace.getTemplate));

cli
	.command('workspace template versions')
	.describe('List Template versions.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.option('--template', 'Template identifier.')
	.action(run(workspace.listTemplateVersions));

cli
	.command('workspace template open')
	.describe('Open this resource in Playbooks.')
	.option('--template', 'Template identifier.')
	.action(run(workspace.openTemplate));

cli
	.command('workspace member departure-preview')
	.describe('Review removal of a member by User ID.')
	.option('--member', 'Member User identifier.')
	.action(run(workspace.previewMemberDeparture));

cli
	.command('workspace member depart')
	.describe('Remove a member using the reviewed revision and ownership recipient.')
	.option('--file', 'JSON input file or - for stdin. Fields: revision, toUserId.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--member', 'Member User identifier.')
	.action(run(workspace.removeMember));

cli
	.command('workspace members')
	.describe('List Workspace members.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listMembers));

cli
	.command('workspace member')
	.describe('Get a Workspace member.')
	.option('--member', 'Member identifier.')
	.action(run(workspace.getMember));

cli
	.command('workspace member update')
	.describe('Update a Workspace member role.')
	.option('--file', 'JSON input file or - for stdin. Fields: memberRole.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--member', 'Member identifier.')
	.action(run(workspace.updateMember));

cli
	.command('workspace invitations')
	.describe('List Workspace invitations.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listInvitations));

cli
	.command('workspace invitation create')
	.describe('Invite a Workspace member.')
	.option('--file', 'JSON input file or - for stdin. Fields: email, role.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(workspace.createInvitation));

cli
	.command('workspace invitation revoke')
	.describe('Revoke a pending invitation.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--invitation', 'Invitation identifier.')
	.action(run(workspace.revokeInvitation));

cli
	.command('workspace settings')
	.describe('Get Workspace Operator preferences and instructions.')
	.action(run(workspace.getWorkspacePreferences));

cli
	.command('workspace settings update')
	.describe('Update Workspace Operator preferences.')
	.option('--file', 'JSON input file or - for stdin. Fields: mode, deliveryMode, instructions, modelId, permissions.')
	.action(run(workspace.updateWorkspacePreferences));

cli
	.command('workspace designs')
	.describe('List available Workspace Agent Designs.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceDesigns));

cli
	.command('workspace skills')
	.describe('List available Workspace Skills.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceSkills));

cli
	.command('workspace mcps')
	.describe('List Workspace MCP connections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceMcps));

cli
	.command('workspace connectors')
	.describe('List Workspace connector connections.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceConnectors));

cli
	.command('workspace secrets')
	.describe('List safe Workspace secret metadata.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceSecrets));

cli
	.command('workspace files')
	.describe('List Workspace-owned Agent Files.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listWorkspaceFiles));

cli
	.command('workspace file download')
	.describe('Download a Workspace-owned Agent File.')
	.option('--output', 'New destination file.')
	.option('--file-id', 'File-id identifier.')
	.action(run(workspace.downloadWorkspaceFile));

cli
	.command('workspace file upload')
	.describe('Upload an Agent File; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative Agent File name.')
	.option('--revision', 'Existing file revision when replacing.')
	.action(run(workspace.uploadWorkspaceFile));

cli
	.command('workspace budget update')
	.describe('Update the Workspace credit budget.')
	.option(
		'--file',
		'JSON input file or - for stdin. Fields: creditBudget, budgetStopNewWork, budgetAlertThresholds, budgetRecipientMode, budgetRecipientIds, budgetEmail.',
	)
	.option('--yes', 'Confirm this operation.', false)
	.action(run(workspace.updateBudgetOperations));

cli
	.command('workspace activity')
	.describe('List Workspace activity.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.activityOperations));

cli.command('workspace usage').describe('Inspect Workspace usage.').action(run(workspace.usageOperations));

cli.command('workspace budget').describe('Inspect the Workspace budget.').action(run(workspace.budgetOperations));

cli
	.command('workspace credits')
	.describe('List Workspace credit records.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.creditsOperations));

cli
	.command('workspace invoices')
	.describe('List Workspace invoices.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.invoicesOperations));

cli
	.command('workspace settlements')
	.describe('List verified creator settlements.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.settlementsOperations));

cli
	.command('workspace transfers')
	.describe('List Workspace transfers.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.transfersOperations));

cli
	.command('workspace schedules')
	.describe('List Workspace schedules.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.schedulesOperations));

cli
	.command('workspace domains')
	.describe('List Workspace domains.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(workspace.listDomains));

cli
	.command('workspace domain')
	.describe('Inspect a domain.')
	.option('--include', 'Inline related records.')
	.option('--domain', 'Domain identifier.')
	.action(run(workspace.getDomain));

cli
	.command('workspace domain add')
	.describe('Add an existing external domain; does not purchase a domain.')
	.option('--file', 'JSON input file or - for stdin. Fields: name.')
	.action(run(workspace.addDomain));

cli
	.command('workspace domain records')
	.describe('Inspect DNS records.')
	.option('--domain', 'Domain identifier.')
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
	.option('--file', 'JSON input file or - for stdin. Fields: type, name, value, ttl, priority, port, weight.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.action(run(workspace.createRecord));

cli
	.command('workspace domain record update')
	.describe('Update a DNS record.')
	.option('--record', 'DNS record identifier.')
	.option('--file', 'JSON input file or - for stdin. Fields: type, name, value, ttl, priority, port, weight.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.action(run(workspace.updateRecord));

cli
	.command('workspace domain record delete')
	.describe('Delete a DNS record.')
	.option('--record', 'DNS record identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--domain', 'Domain identifier.')
	.action(run(workspace.deleteRecord));

// Project
cli
	.command('projects')
	.describe('List Projects in the active Workspace.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listProjects));

cli
	.command('project')
	.describe('Get a Project.')
	.option('--include', 'Inline related records.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getProject));

cli
	.command('project create')
	.describe('Create a blank Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, description, typeId, folderId.')
	.action(run(project.createProject));

cli
	.command('project update')
	.describe('Update Project details.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, description, thumbnail, typeId.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.updateProject));

cli
	.command('project move')
	.describe('Move a Project to a Folder.')
	.option('--file', 'JSON input file or - for stdin. Fields: folderId.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.moveProject));

cli
	.command('project publication')
	.describe('Inspect publication readiness.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getPublication));

cli
	.command('project export')
	.describe('Download Project source.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--output', 'New destination file.')
	.action(run(project.exportProject));

cli
	.command('project lifecycle')
	.describe('Inspect lifecycle state and confirmation requirements.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getProjectLifecycle));

cli
	.command('project archive')
	.describe('Archive the selected Project.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: confirmation.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.archiveProject));

cli
	.command('project restore')
	.describe('Restore the selected Project.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: confirmation.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.restoreProject));

cli
	.command('project delete')
	.describe('Permanently delete the selected Project.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: confirmation.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.deleteProject));

cli
	.command('project preflight')
	.describe('Review Production publication requirements.')
	.option('--project', 'Project identifier.')
	.option('--file', 'Optional JSON input: branchId.')
	.action(run(project.preflightProject));

cli
	.command('project publish')
	.describe('Publish Project code to Production.')
	.option('--project', 'Project identifier.')
	.option('--file', 'JSON input: expectedRevision, branchId.')
	.option('--yes', 'Confirm publication and usage charges.', false)
	.option('--wait', 'Wait up to five minutes for completion.', false)
	.action(run(project.publishProject));

cli
	.command('project use')
	.describe('Select a Project in the active Workspace.')
	.option('--project', 'Project identifier.')
	.action(run(project.useProject));

cli.command('project current').describe('Show the selected Project.').action(run(project.currentProject));

cli.command('project clear').describe('Clear local Project selection.').action(run(project.clearProject));

cli
	.command('project open')
	.describe('Open this resource in Playbooks.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.openProject));

cli
	.command('project ownership')
	.describe('Inspect the pending Project ownership request.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getOwnershipRequest));

cli
	.command('project ownership transfer')
	.describe('Request Project ownership transfer to an active member.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: toUserId.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.transferOwnership));

cli
	.command('project ownership accept')
	.describe('Accept a Project ownership request addressed to you.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.action(run(project.acceptOwnership));

cli
	.command('project ownership decline')
	.describe('Decline a Project ownership request.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.action(run(project.declineOwnership));

cli
	.command('project ownership cancel')
	.describe('Cancel a pending Project ownership request.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
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
	.describe('Grant Project access to an existing Workspace member.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: userId, role.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.addCollaborator));

cli
	.command('project collaborator update')
	.describe('Update Project collaborator access.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: role.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--collaborator', 'Collaborator identifier.')
	.action(run(project.updateCollaborator));

cli
	.command('project collaborators')
	.describe('List Project collaborators.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listCollaborators));

cli
	.command('project agents')
	.describe('List Project Agents.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listAgents));

cli
	.command('project agent')
	.describe('Get a Project Agent.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--include', 'Inline related records.')
	.option('--agent', 'Agent identifier.')
	.action(run(project.getAgent));

cli
	.command('project agent create')
	.describe('Create a Project Agent without starting a run.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, description, thumbnail, creationKey.')
	.action(run(project.createAgent));

cli
	.command('project agent update')
	.describe('Enable or disable a Project Agent.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: status, revision.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--agent', 'Agent identifier.')
	.action(run(project.updateAgent));

cli
	.command('project resources state')
	.describe('Inspect the Project resource selection revision.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getResourceState));

cli
	.command('project resources update')
	.describe('Update revision-checked Project resource selections.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: revision, designId, workspaceConnectorIds.')
	.action(run(project.updateProjectResources));

cli
	.command('project designs')
	.describe('List Project-owned Agent Designs.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listProjectDesigns));

cli
	.command('project design')
	.describe('Agent Design commands: project design create, update.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Agent Design action. See project design --help.');
		cli.help('project design');
	});

cli
	.command('project design create')
	.describe('Create a Project Agent Design from package files.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, files.')
	.action(run(project.createProjectDesign));

cli
	.command('project design update')
	.describe('Update a Project-owned Agent Design.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, files, revision.')
	.option('--design', 'Design identifier.')
	.action(run(project.updateProjectDesign));

cli
	.command('project skills')
	.describe('List Project-owned Skills.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
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
	.describe('Create a Project Skill from package files.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, files.')
	.action(run(project.createProjectSkill));

cli
	.command('project skill update')
	.describe('Update a Project-owned Skill.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, files, revision.')
	.option('--skill', 'Skill identifier.')
	.action(run(project.updateProjectSkill));

cli
	.command('project settings')
	.describe('Get Project preferences and instructions.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getProjectPreferences));

cli
	.command('project settings update')
	.describe('Update Project preferences.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option(
		'--file',
		'JSON input file or - for stdin. Fields: opinionPolicy, modelId, mode, permissions, instructions, deliveryMode, inferenceProviderMode, inferenceProjectConnectorId, revision.',
	)
	.action(run(project.updateProjectPreferences));

cli
	.command('project resources')
	.describe('Inspect Project resource assignments.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getProjectResources));

cli
	.command('project mcps')
	.describe('List Project-owned MCP connections.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listProjectMcps));

cli
	.command('project connectors')
	.describe('List Project connector assignments.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listProjectConnectors));

cli
	.command('project files')
	.describe('List Project-owned Agent Files.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listProjectFiles));

cli
	.command('project file')
	.describe('Agent File commands: project file download, upload.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Agent File action. See project file --help.');
		cli.help('project file');
	});

cli
	.command('project file download')
	.describe('Download a Project-owned Agent File.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--output', 'New destination file.')
	.option('--file-id', 'File-id identifier.')
	.action(run(project.downloadProjectFile));

cli
	.command('project file upload')
	.describe('Upload an Agent File; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative Agent File name.')
	.option('--revision', 'Existing file revision when replacing.')
	.option('--project', 'Project identifier.')
	.action(run(project.uploadProjectFile));

cli
	.command('project source connect')
	.describe('Connect a repository; source may be replaced unless preserveSource is supported and selected.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option(
		'--file',
		'JSON input file or - for stdin. Fields: provider, githubInstallationId, githubRepositoryId, workspaceConnectorId, workspace, repository, repositoryId, namespaceId, repositoryName, subdirectory, preserveSource.',
	)
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.connectSource));

cli
	.command('project source disconnect')
	.describe('Disconnect the Project repository.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.action(run(project.disconnectSource));

cli
	.command('project source sync')
	.describe('Synchronize source using the reviewed Git head.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: branchId, expectedHead.')
	.option('--yes', 'Confirm this operation.', false)
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
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, baseBranch, branchId.')
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
	.describe('Rename a Project checkpoint.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: label.')
	.option('--checkpoint', 'Checkpoint identifier.')
	.action(run(project.renameCheckpoint));

cli
	.command('project checkpoint restore')
	.describe('Restore a source checkpoint; application data is unchanged.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--checkpoint', 'Checkpoint identifier.')
	.action(run(project.restoreCheckpoint));

cli
	.command('project source')
	.describe('Inspect Project source control.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.getSourceStatus));

cli
	.command('project branches')
	.describe('List Project branches.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listBranches));

cli
	.command('project checkpoints')
	.describe('List Project checkpoints.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listCheckpoints));

cli
	.command('project source import')
	.describe('Replace selected Project source with a zip archive.')
	.option('--project', 'Project identifier.')
	.option('--upload', 'Local source zip.')
	.option('--yes', 'Confirm source replacement.', false)
	.action(run(project.importSource));

cli
	.command('project releases')
	.describe('List Project releases.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listReleases));

cli
	.command('project release')
	.describe('Inspect a release.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--include', 'Inline related records.')
	.option('--release', 'Release identifier.')
	.action(run(project.getRelease));

cli
	.command('project release rollback')
	.describe('Restore release code; application data is not rolled back.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: currentReleaseId.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--release', 'Release identifier.')
	.action(run(project.rollbackRelease));

cli
	.command('project sandbox')
	.describe('Inspect Project Sandbox configuration and resize status.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.action(run(project.sandboxOperations));

cli
	.command('project logs')
	.describe('Read Project logs.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.logsOperations));

cli
	.command('project workflows')
	.describe('List saved Project workflows.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'field:asc or field:desc.')
	.option('--include', 'Inline related records.')
	.option('--status', 'Filter by status.')
	.action(run(project.listWorkflows));

cli
	.command('project workflow')
	.describe('Inspect a saved workflow and its runs.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--include', 'Inline related records.')
	.option('--workflow', 'Workflow identifier.')
	.action(run(project.getWorkflow));

cli
	.command('project workflow create')
	.describe('Create a workflow with its schedule initially disabled.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, status, steps, schedule.')
	.action(run(project.createWorkflow));

cli
	.command('project workflow update')
	.describe('Update saved workflow steps.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: name, status, steps, revision.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.action(run(project.updateWorkflow));

cli
	.command('project workflow schedule')
	.describe('Update recurrence; enabling it authorizes real actions and usage charges.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--file', 'JSON input file or - for stdin. Fields: enabled, recurrence, time, timezone, actingUserId.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.action(run(project.scheduleWorkflow));

cli
	.command('project workflow run')
	.describe('Run saved work now; may send notifications, change external systems, and incur usage charges.')
	.option('--project', 'Project identifier; defaults to selected Project.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.action(run(project.runWorkflow));

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
			'types',
			'mcp',
			'completion',
		]),
	);

try {
	if (process.argv.length === 2) cli.help();
	else
		cli.parse(process.argv, {
			unknown: flag => {
				throw new CliError(422, `Unknown option: ${flag}`);
			},
		});
} catch (error) {
	reportError(error);
}
process.once('SIGINT', () => {
	process.exit(130);
});
