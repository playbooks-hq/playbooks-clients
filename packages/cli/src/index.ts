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
import { outputMessages } from 'src/utils/message-output';

import { version } from '../package.json';

const cli = sade('playbooks').version(version);
cli.describe('Manage Playbooks from your terminal.');
cli.option('--config', 'Isolated context file.', path.join(os.homedir(), '.config', 'playbooks', 'config.json'));
cli.option('--json', 'Print JSON; run streams use newline-delimited JSON.', false);
cli.option('--select', 'Select comma-separated output fields; unavailable for run streams.');

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
	.option('--type', 'Project type identifier from types.')
	.example('templates --category business --type website')
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

// Types
cli
	.command('types')
	.describe('List curated project types.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--sort', 'Sort field:asc|desc; fields: id, name, createdAt, updatedAt, position.')
	.action(run(types.listTypes));

// Workspace
cli
	.command('workspace update')
	.describe('Update the active workspace profile.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace update --data \'{"name":"Acme"}\'')
	.action(run(workspace.updateWorkspace));

cli.command('workspace list').describe('List your workspaces.').action(run(workspace.listWorkspace));

cli.command('workspace current').describe('Show the active workspace.').action(run(workspace.currentWorkspace));

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
	.command('workspace folders')
	.describe('List workspace folders.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.listFolders));

cli
	.command('workspace folder')
	.describe('Get a folder.')
	.option('--folder', 'Folder identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.getFolder));

cli
	.command('workspace folder create')
	.describe('Create a folder.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace folder create --data \'{"name":"Customer projects"}\'')
	.action(run(workspace.createFolder));

cli
	.command('workspace folder update')
	.describe('Update a folder.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--folder', 'Folder identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace folder update --folder abc --data \'{"name":"Customer projects"}\'')
	.action(run(workspace.updateFolder));

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
	.example("workspace template publish --template abc --data '{}' --yes")
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
	.option('--type', 'Project type identifier from types.')
	.example('workspace templates --category business --type website')
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
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
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
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
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
	.describe('List available workspace agent designs.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
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
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(workspace.listWorkspaceSecrets));

cli
	.command('workspace files')
	.describe('List workspace-owned agent files.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(workspace.listWorkspaceFiles));

cli
	.command('workspace file download')
	.describe('Download a workspace-owned agent file.')
	.option('--output', 'New destination file.')
	.option('--file-id', 'File-id identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.downloadWorkspaceFile));

cli
	.command('workspace file upload')
	.describe('Upload an agent file; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative agent file name.')
	.option('--revision', 'Existing file revision when replacing.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.uploadWorkspaceFile));

cli
	.command('workspace budget update')
	.describe('Update the workspace credit budget.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('workspace budget update --data \'{"creditBudget":100}\' --yes')
	.action(run(workspace.updateBudgetOperations));

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
	.command('workspace schedules')
	.describe('List workspace schedules.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(workspace.schedulesOperations));

cli
	.command('workspace domains')
	.describe('List workspace domains.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
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
	.option('--include', 'Comma-separated relations: folder, type, projectOwner, branches, deploy.')
	.option('--folder', 'Folder identifier from workspace folders.')
	.option('--owner', 'Numeric user ID of the project owner.')
	.example('projects --folder abc --sort name:asc')
	.action(run(project.listProjects));

cli
	.command('project')
	.describe('Get a project.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--include', 'Comma-separated relations: folder, type, projectOwner, branches, deploy.')
	.example('project --project abc --include folder,type')
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
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project update --project abc --data \'{"description":"Customer support app"}\'')
	.action(run(project.updateProject));

cli
	.command('project move')
	.describe('Move a project to a folder.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project move --project abc --data \'{"folderId":123}\'')
	.action(run(project.moveProject));

cli
	.command('project publication')
	.describe('Inspect publication readiness.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getPublication));

cli
	.command('project export')
	.describe('Download project source.')
	.option('--project', 'Project identifier.')
	.option('--output', 'New destination file.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.exportProject));

cli
	.command('project lifecycle')
	.describe('Inspect lifecycle state and confirmation requirements.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectLifecycle));

cli
	.command('project archive')
	.describe('Archive the project.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project archive --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.archiveProject));

cli
	.command('project restore')
	.describe('Restore the project.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project restore --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.restoreProject));

cli
	.command('project delete')
	.describe('Permanently delete the project.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project delete --project abc --data \'{"confirmation":"Customer portal"}\' --yes')
	.action(run(project.deleteProject));

cli
	.command('project preflight')
	.describe('Review production publication requirements.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project preflight --project abc --data \'{"branchId":123}\'')
	.action(run(project.preflightProject));

cli
	.command('project publish')
	.describe('Publish project code to production.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm publication and usage charges.', false)
	.option('--wait', 'Wait up to five minutes for completion.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project publish --project abc --data \'{"expectedRevision":"CURRENT_REVISION"}\' --yes')
	.action(run(project.publishProject));

cli
	.command('project open')
	.describe('Open this resource in Playbooks.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.openProject));

cli
	.command('project ownership')
	.describe('Inspect the pending project ownership request.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getOwnershipRequest));

cli
	.command('project ownership transfer')
	.describe('Request project ownership transfer to an active member.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project ownership transfer --project abc --data \'{"toUserId":123}\' --yes')
	.action(run(project.transferOwnership));

cli
	.command('project ownership accept')
	.describe('Accept a project ownership request addressed to you.')
	.option('--project', 'Project identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.acceptOwnership));

cli
	.command('project ownership decline')
	.describe('Decline a project ownership request.')
	.option('--project', 'Project identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--request', 'Request identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.declineOwnership));

cli
	.command('project ownership cancel')
	.describe('Cancel a pending project ownership request.')
	.option('--project', 'Project identifier.')
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
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project collaborator add --project abc --data \'{"userId":123,"role":"collaborator"}\' --yes')
	.action(run(project.addCollaborator));

cli
	.command('project collaborator update')
	.describe('Update project collaborator access.')
	.option('--project', 'Project identifier.')
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
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listAgents));

cli
	.command('project agent')
	.describe('Get a project agent.')
	.option('--project', 'Project identifier.')
	.option('--agent', 'Agent identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getAgent));

cli
	.command('project agent create')
	.describe('Create a project agent without starting a run.')
	.option('--project', 'Project identifier.')
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
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getResourceState));

cli
	.command('project resources update')
	.describe('Update revision-checked project resource selections.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project resources update --project abc --data \'{"revision":"CURRENT_REVISION","designId":null}\'')
	.action(run(project.updateProjectResources));

cli
	.command('project designs')
	.describe('List project-owned agent designs.')
	.option('--project', 'Project identifier.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort: name:asc or updatedAt:desc.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(project.listProjectDesigns));

cli
	.command('project design')
	.describe('Agent design commands: project design create, update.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Agent Design action. See project design --help.');
		cli.help('project design');
	});

cli
	.command('project design create')
	.describe('Create a project agent design from package files.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project design create --project abc --data \'{"name":"Brand design","files":[{"path":"DESIGN.md","content":"BASE64_CONTENT"}]}\'',
	)
	.action(run(project.createProjectDesign));

cli
	.command('project design update')
	.describe('Update a project-owned agent design.')
	.option('--project', 'Project identifier.')
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
	.option('--data', 'JSON object or - for stdin.')
	.option('--skill', 'Skill identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example(
		'project skill update --project abc --skill abc --data \'{"name":"Review changes","revision":"CURRENT_CHECKSUM"}\'',
	)
	.action(run(project.updateProjectSkill));

cli
	.command('project settings')
	.describe('Get project preferences and instructions.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectPreferences));

cli
	.command('project settings update')
	.describe('Update project preferences.')
	.option('--project', 'Project identifier.')
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
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getProjectResources));

cli
	.command('project mcps')
	.describe('List project-owned MCP connections.')
	.option('--project', 'Project identifier.')
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
	.option('--page', 'Zero-based page; operational projects paginate only when requested.')
	.option('--page-size', 'Records per page (1-100 for operational projects).')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--sort', 'Sort field:asc|desc; fields: id, createdAt, updatedAt.')
	.action(run(project.listProjectConnectors));

cli
	.command('project files')
	.describe('List project-owned agent files.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--available', 'Include available and inherited resources.', false)
	.action(run(project.listProjectFiles));

cli
	.command('project file')
	.describe('Agent file commands: project file download, upload.')
	.action(options => {
		if (options._?.length) throw new CliError(422, 'Unknown Agent File action. See project file --help.');
		cli.help('project file');
	});

cli
	.command('project file download')
	.describe('Download a project-owned agent file.')
	.option('--project', 'Project identifier.')
	.option('--output', 'New destination file.')
	.option('--file-id', 'File-id identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.downloadProjectFile));

cli
	.command('project file upload')
	.describe('Upload an agent file; replacement requires its current revision.')
	.option('--upload', 'Local file path.')
	.option('--name', 'Relative agent file name.')
	.option('--revision', 'Existing file revision when replacing.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.uploadProjectFile));

cli
	.command('project source connect')
	.describe('Connect a repository; source may be replaced unless preserveSource is supported and selected.')
	.option('--project', 'Project identifier.')
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
	.option('--yes', 'Confirm this operation.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.disconnectSource));

cli
	.command('project source sync')
	.describe('Synchronize source using the reviewed Git head.')
	.option('--project', 'Project identifier.')
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
	.option('--data', 'JSON object or - for stdin.')
	.option('--checkpoint', 'Checkpoint identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project checkpoint rename --project abc --checkpoint abc --data \'{"label":"Before settings update"}\'')
	.action(run(project.renameCheckpoint));

cli
	.command('project checkpoint restore')
	.describe('Restore a source checkpoint; application data is unchanged.')
	.option('--project', 'Project identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--checkpoint', 'Checkpoint identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.restoreCheckpoint));

cli
	.command('project source')
	.describe('Inspect project source control.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getSourceStatus));

cli
	.command('project branches')
	.describe('List project branches.')
	.option('--query', 'Search text.')
	.option('--project', 'Project identifier.')
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
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listCheckpoints));

cli
	.command('project source import')
	.describe('Replace project source with a zip archive.')
	.option('--project', 'Project identifier.')
	.option('--upload', 'Local source zip.')
	.option('--yes', 'Confirm source replacement.', false)
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.importSource));

cli
	.command('project releases')
	.describe('List project releases.')
	.option('--project', 'Project identifier.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page.')
	.option('--page-size', 'Records per page.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listReleases));

cli
	.command('project release')
	.describe('Inspect a release.')
	.option('--project', 'Project identifier.')
	.option('--release', 'Release identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getRelease));

cli
	.command('project release rollback')
	.describe('Restore release code; application data is not rolled back.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--release', 'Release identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project release rollback --project abc --release abc --data \'{"currentReleaseId":123}\' --yes')
	.action(run(project.rollbackRelease));

cli
	.command('project sandbox')
	.describe('Inspect project sandbox configuration and resize status.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.sandboxOperations));

cli
	.command('project logs')
	.describe('Read project logs.')
	.option('--project', 'Project identifier.')
	.option('--query', 'Search text.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--limit', 'Maximum log entries (1-500; server default 100).')
	.option('--cursor', 'Cursor from data.nextCursor for the next log page.')
	.example('project logs --project abc --query error --limit 50')
	.action(run(project.logsOperations));

cli
	.command('project workflows')
	.describe('List saved project workflows.')
	.option('--query', 'Search text.')
	.option('--page', 'Zero-based page; enables pagination when supplied.')
	.option('--page-size', 'Records per page (1-100); enables pagination when supplied.')
	.option('--project', 'Project identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.listWorkflows));

cli
	.command('project workflow')
	.describe('Inspect a saved workflow and its runs.')
	.option('--project', 'Project identifier.')
	.option('--workflow', 'Workflow identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.getWorkflow));

cli
	.command('project workflow create')
	.describe('Create a workflow with its schedule initially disabled.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project workflow create --project abc --data \'{"name":"Daily review"}\'')
	.action(run(project.createWorkflow));

cli
	.command('project workflow update')
	.describe('Update saved workflow steps.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project workflow update --project abc --data \'{"name":"Daily review","revision":1}\' --yes')
	.action(run(project.updateWorkflow));

cli
	.command('project workflow schedule')
	.describe('Update recurrence; enabling it authorizes real actions and usage charges.')
	.option('--project', 'Project identifier.')
	.option('--data', 'JSON object or - for stdin.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.example('project workflow schedule --project abc --data \'{"enabled":false}\' --yes')
	.action(run(project.scheduleWorkflow));

cli
	.command('project workflow run')
	.describe('Run saved work now; may send notifications, change external systems, and incur usage charges.')
	.option('--project', 'Project identifier.')
	.option('--yes', 'Confirm this operation.', false)
	.option('--workflow', 'Workflow identifier.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.action(run(project.runWorkflow));

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
	.option('--before', 'Fetch messages before this numeric message identifier.')
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
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.action(run(project.getConversation));

cli
	.command('project conversations')
	.describe('List project conversations; may initialize the primary conversation.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.action(run(project.listConversations));

cli
	.command('project messages')
	.describe('List recent operator messages.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--before', 'Fetch messages before this numeric message identifier.')
	.option('--page-size', 'Input messages per window, 1-100; output messages are included.')
	.action(run(project.listMessages, outputMessages));

cli
	.command('project message')
	.describe('Get a sandbox conversation message.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
	.option('--conversation', 'Conversation UUID; defaults to the primary conversation.')
	.option('--branch', 'Numeric branch identifier; defaults to the conversation current branch.')
	.option('--message', 'Numeric message identifier.')
	.action(run(project.getMessage));

cli
	.command('project message create')
	.describe('Submit a message; may start or steer execution and incur usage.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
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
	.option('--run', 'Numeric run identifier.')
	.action(run(project.getRun));

cli
	.command('project run stream')
	.describe('Observe run output without starting execution.')
	.option('--workspace', 'Workspace identifier; defaults to saved workspace.')
	.option('--project', 'Project identifier.')
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
			'types',
			'mcp',
			'completion',
		]),
	);

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
			string: ['data', 'query', 'sort', 'include', 'category', 'type', 'folder', 'owner', 'cursor'],
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
