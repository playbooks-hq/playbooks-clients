import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
	commandResultToToolResult,
	errorToolResult,
	getPlaybooksStatus,
	jsonToolResult,
	runPlaybooksCommand,
	runPlaybooksRawArgs,
} from 'src/cli.js';

const configPathSchema = z.string().min(1).optional();
const selectSchema = z.string().min(1).optional();

function execute(command: Parameters<typeof runPlaybooksCommand>[0]) {
	return runPlaybooksCommand(command).then(commandResultToToolResult).catch(errorToolResult);
}

export function createServer() {
	const server = new McpServer({
		name: 'playbooks-mcp',
		version: '0.1.0',
	});

	server.registerTool(
		'playbooks_status',
		{
			title: 'Playbooks Status',
			description: 'Show which Playbooks CLI binary will be used and whether the configured auth file exists.',
			inputSchema: {
				configPath: configPathSchema,
			},
		},
		async ({ configPath }) => getPlaybooksStatus(configPath).then(jsonToolResult).catch(errorToolResult),
	);

	server.registerTool(
		'playbooks_help',
		{
			title: 'Playbooks Help',
			description: 'Return CLI help text for Playbooks globally or for a specific command.',
			inputSchema: {
				command: z
					.enum([
						'account',
						'add',
						'banks',
						'cards',
						'charges',
						'clone',
						'download',
						'downloads',
						'login',
						'logout',
						'payouts',
						'ping',
						'play',
						'plays',
						'session',
						'subscription',
						'sync',
						'teams',
						'toggle',
						'transfers',
						'usage',
					])
					.optional(),
			},
		},
		async ({ command }) =>
			command
				? execute({ command, positional: [], options: { help: true } })
				: runPlaybooksRawArgs(['--help']).then(commandResultToToolResult).catch(errorToolResult),
	);

	server.registerTool(
		'playbooks_login',
		{
			title: 'Playbooks Login',
			description: 'Login to Playbooks using email and password without interactive prompts.',
			inputSchema: {
				email: z.string().email(),
				password: z.string().min(1),
				configPath: configPathSchema,
			},
		},
		async ({ email, password, configPath }) =>
			execute({
				command: 'login',
				configPath,
				options: { email, password },
			}),
	);

	server.registerTool(
		'playbooks_logout',
		{
			title: 'Playbooks Logout',
			description: 'Clear the current Playbooks CLI session.',
			inputSchema: {
				configPath: configPathSchema,
			},
		},
		async ({ configPath }) =>
			execute({
				command: 'logout',
				configPath,
			}),
	);

	server.registerTool(
		'playbooks_ping',
		{
			title: 'Playbooks Ping',
			description: 'Check connectivity to the Playbooks API using the configured session.',
			inputSchema: {
				configPath: configPathSchema,
			},
		},
		async ({ configPath }) =>
			execute({
				command: 'ping',
				configPath,
			}),
	);

	server.registerTool(
		'playbooks_account',
		{
			title: 'Playbooks Account',
			description: 'Show the currently active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'account',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_session',
		{
			title: 'Playbooks Session',
			description: 'Show the current Playbooks session.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'session',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_teams',
		{
			title: 'Playbooks Teams',
			description: 'List teams available to the current Playbooks session.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'teams',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_subscription',
		{
			title: 'Playbooks Subscription',
			description: 'Show subscription details for the current account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'subscription',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_usage',
		{
			title: 'Playbooks Usage',
			description: 'Show current usage for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'usage',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_downloads',
		{
			title: 'Playbooks Downloads',
			description: 'List downloads for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'downloads',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_banks',
		{
			title: 'Playbooks Banks',
			description: 'List connected bank records for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'banks',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_cards',
		{
			title: 'Playbooks Cards',
			description: 'List saved cards for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'cards',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_charges',
		{
			title: 'Playbooks Charges',
			description: 'List charges for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'charges',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_payouts',
		{
			title: 'Playbooks Payouts',
			description: 'List payouts for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'payouts',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_transfers',
		{
			title: 'Playbooks Transfers',
			description: 'List transfers for the active Playbooks account.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'transfers',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_play',
		{
			title: 'Playbooks Play',
			description: 'Fetch a single play by UUID or slug.',
			inputSchema: {
				uuid: z.string().min(1),
				select: selectSchema,
				include: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, select, include, configPath }) =>
			execute({
				command: 'play',
				positional: [uuid],
				configPath,
				options: { select, include },
			}),
	);

	server.registerTool(
		'playbooks_plays',
		{
			title: 'Playbooks Plays',
			description: 'List plays with optional Playbooks CLI filters.',
			inputSchema: {
				select: selectSchema,
				framework: z.string().min(1).optional(),
				language: z.string().min(1).optional(),
				platform: z.string().min(1).optional(),
				team: z.string().min(1).optional(),
				tool: z.string().min(1).optional(),
				tag: z.string().min(1).optional(),
				user: z.string().min(1).optional(),
				view: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ select, framework, language, platform, team, tool, tag, user, view, configPath }) =>
			execute({
				command: 'plays',
				configPath,
				options: { select, framework, language, platform, team, tool, tag, user, view },
			}),
	);

	server.registerTool(
		'playbooks_download',
		{
			title: 'Playbooks Download',
			description: 'Download a play to the local filesystem.',
			inputSchema: {
				uuid: z.string().min(1),
				path: z.string().min(1).optional(),
				name: z.string().min(1).optional(),
				version: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, path, name, version, configPath }) =>
			execute({
				command: 'download',
				positional: [uuid],
				configPath,
				options: { path, name, version },
			}),
	);

	server.registerTool(
		'playbooks_add',
		{
			title: 'Playbooks Add',
			description: 'Add a play into an existing local project.',
			inputSchema: {
				uuid: z.string().min(1),
				base: z.string().min(1).optional(),
				path: z.string().min(1).optional(),
				name: z.string().min(1).optional(),
				version: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, base, path, name, version, configPath }) =>
			execute({
				command: 'add',
				positional: [uuid],
				configPath,
				options: { base, path, name, version },
			}),
	);

	server.registerTool(
		'playbooks_clone',
		{
			title: 'Playbooks Clone',
			description: 'Clone a play to a GitHub account connected to Playbooks.',
			inputSchema: {
				uuid: z.string().min(1),
				account: z.string().min(1).optional(),
				name: z.string().min(1).optional(),
				private: z.boolean().optional(),
				version: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, account, name, private: isPrivate, version, configPath }) =>
			execute({
				command: 'clone',
				positional: [uuid],
				configPath,
				options: { account, name, private: isPrivate, version },
			}),
	);

	server.registerTool(
		'playbooks_sync',
		{
			title: 'Playbooks Sync',
			description: 'Sync a play owned by the current account with upstream GitHub changes.',
			inputSchema: {
				uuid: z.string().min(1),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, configPath }) =>
			execute({
				command: 'sync',
				positional: [uuid],
				configPath,
			}),
	);

	server.registerTool(
		'playbooks_toggle',
		{
			title: 'Playbooks Toggle',
			description: 'Switch the active Playbooks account, optionally to a specific team UUID.',
			inputSchema: {
				uuid: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, configPath }) =>
			execute({
				command: 'toggle',
				configPath,
				options: { uuid },
			}),
	);

	return server;
}
