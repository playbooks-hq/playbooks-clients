import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
	commandResultToToolResult,
	errorToolResult,
	getPlaybooksStatus,
	jsonToolResult,
	runPlaybooksCommand,
	runPlaybooksRawArgs,
} from 'src/cli.js';
import { z } from 'zod';

const configPathSchema = z.string().min(1).optional();
const uuidSchema = z.string().min(1);
const urlSchema = z.string().url();
const selectSchema = z.string().min(1).optional();
const includeSchema = z.string().min(1).optional();
const viewSchema = z.string().min(1).optional();
const querySchema = z.string().min(1).optional();
const sortPropSchema = z.string().min(1).optional();
const sortValueSchema = z.string().min(1).optional();
const statusSchema = z.string().min(1).optional();
const pageSchema = z.coerce.number().int().positive().optional();
const pageSizeSchema = z.coerce.number().int().positive().optional();
const pathSchema = z.string().min(1).optional();
const variantSchema = z.enum(['starter', 'partial', 'template', 'stack', 'app']).optional();
const visibilitySchema = z.enum(['public', 'private']).optional();

const helpCommands = [
	'account',
	'add',
	'banks',
	'bookmarks',
	'cards',
	'charges',
	'clone',
	'collections',
	'config',
	'download',
	'downloads',
	'drafts',
	'frameworks',
	'init',
	'languages',
	'ledgers',
	'login',
	'logout',
	'oauth',
	'payouts',
	'ping',
	'play',
	'plays',
	'platforms',
	'publish',
	'session',
	'subscription',
	'submit',
	'sync',
	'tags',
	'teams',
	'toggle',
	'tools',
	'transfers',
	'usage',
	'users',
] as const;

const helpCommandSchema = z.enum(helpCommands).optional();

const accountListInputSchema = {
	select: selectSchema,
	page: pageSchema,
	pageSize: pageSizeSchema,
	sortProp: sortPropSchema,
	sortValue: sortValueSchema,
	configPath: configPathSchema,
};

const accountStatusListInputSchema = {
	...accountListInputSchema,
	status: statusSchema,
};

const accountDetailInputSchema = {
	select: selectSchema,
	configPath: configPathSchema,
};

const resourceListInputSchema = {
	select: selectSchema,
	include: includeSchema,
	view: viewSchema,
	query: querySchema,
	page: pageSchema,
	pageSize: pageSizeSchema,
	sortProp: sortPropSchema,
	sortValue: sortValueSchema,
	configPath: configPathSchema,
};

const resourceDetailInputSchema = {
	uuid: uuidSchema,
	select: selectSchema,
	include: includeSchema,
	configPath: configPathSchema,
};

const resourcePlaysInputSchema = {
	uuid: uuidSchema,
	select: selectSchema,
	view: viewSchema,
	query: querySchema,
	page: pageSchema,
	pageSize: pageSizeSchema,
	sortProp: sortPropSchema,
	sortValue: sortValueSchema,
	configPath: configPathSchema,
};

const playListInputSchema = {
	select: selectSchema,
	include: includeSchema,
	view: viewSchema,
	query: querySchema,
	page: pageSchema,
	pageSize: pageSizeSchema,
	sortProp: sortPropSchema,
	sortValue: sortValueSchema,
	configPath: configPathSchema,
};

const playDetailInputSchema = {
	uuid: uuidSchema,
	select: selectSchema,
	include: includeSchema,
	configPath: configPathSchema,
};

type PlaybooksInvocation = Parameters<typeof runPlaybooksCommand>[0];
type PlaybooksOptions = NonNullable<PlaybooksInvocation['options']>;

const resourceTools = [
	{
		command: 'collections',
		singularLabel: 'Collection',
		pluralLabel: 'Collections',
		singularTool: 'playbooks_collection',
		pluralTool: 'playbooks_collections',
		playsTool: 'playbooks_collection_plays',
	},
	{
		command: 'frameworks',
		singularLabel: 'Framework',
		pluralLabel: 'Frameworks',
		singularTool: 'playbooks_framework',
		pluralTool: 'playbooks_frameworks',
		playsTool: 'playbooks_framework_plays',
	},
	{
		command: 'languages',
		singularLabel: 'Language',
		pluralLabel: 'Languages',
		singularTool: 'playbooks_language',
		pluralTool: 'playbooks_languages',
		playsTool: 'playbooks_language_plays',
	},
	{
		command: 'platforms',
		singularLabel: 'Platform',
		pluralLabel: 'Platforms',
		singularTool: 'playbooks_platform',
		pluralTool: 'playbooks_platforms',
		playsTool: 'playbooks_platform_plays',
	},
	{
		command: 'tags',
		singularLabel: 'Tag',
		pluralLabel: 'Tags',
		singularTool: 'playbooks_tag',
		pluralTool: 'playbooks_tags',
		playsTool: 'playbooks_tag_plays',
	},
	{
		command: 'teams',
		singularLabel: 'Team',
		pluralLabel: 'Teams',
		singularTool: 'playbooks_team',
		pluralTool: 'playbooks_teams',
		playsTool: 'playbooks_team_plays',
	},
	{
		command: 'tools',
		singularLabel: 'Tool',
		pluralLabel: 'Tools',
		singularTool: 'playbooks_tool',
		pluralTool: 'playbooks_tools',
		playsTool: 'playbooks_tool_plays',
	},
	{
		command: 'users',
		singularLabel: 'User',
		pluralLabel: 'Users',
		singularTool: 'playbooks_user',
		pluralTool: 'playbooks_users',
		playsTool: 'playbooks_user_plays',
	},
] as const;

function execute(command: PlaybooksInvocation) {
	return runPlaybooksCommand(command).then(commandResultToToolResult).catch(errorToolResult);
}

function executeAccountAction(action: string, configPath: string | undefined, options: PlaybooksOptions = {}) {
	return execute({
		command: 'account',
		positional: [action],
		configPath,
		options,
	});
}

function resolveHelpInvocation(command: (typeof helpCommands)[number] | undefined): PlaybooksInvocation | null {
	if (!command) {
		return null;
	}

	switch (command) {
		case 'banks':
		case 'bookmarks':
		case 'cards':
		case 'charges':
		case 'downloads':
		case 'drafts':
		case 'ledgers':
		case 'payouts':
		case 'subscription':
		case 'transfers':
		case 'usage':
			return {
				command: 'account',
				positional: [command],
				options: { help: true },
			};
		case 'play':
			return {
				command: 'plays',
				options: { help: true },
			};
		default:
			return {
				command,
				options: { help: true },
			};
	}
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
			description: 'Show which Playbooks CLI binary will be used and whether the selected configuration file exists.',
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
			description: 'Return Playbooks CLI help text globally or for a specific command.',
			inputSchema: {
				command: helpCommandSchema,
			},
		},
		async ({ command }) => {
			const invocation = resolveHelpInvocation(command);
			if (!invocation) {
				return runPlaybooksRawArgs(['--help']).then(commandResultToToolResult).catch(errorToolResult);
			}

			return execute(invocation);
		},
	);

	server.registerTool(
		'playbooks_config',
		{
			title: 'Playbooks Config',
			description: 'Display the current Playbooks configuration file contents.',
			inputSchema: {
				select: selectSchema,
				configPath: configPathSchema,
			},
		},
		async ({ select, configPath }) =>
			execute({
				command: 'config',
				configPath,
				options: { select },
			}),
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
			description: 'Logout of the current Playbooks account.',
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
		'playbooks_oauth',
		{
			title: 'Playbooks OAuth',
			description: 'Start the interactive GitHub OAuth login flow for Playbooks.',
			inputSchema: {
				configPath: configPathSchema,
			},
		},
		async ({ configPath }) =>
			execute({
				command: 'oauth',
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
			description: 'Fetch the current Playbooks account.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			execute({
				command: 'account',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_account_bookmarks',
		{
			title: 'Playbooks Account Bookmarks',
			description: 'Fetch bookmarked plays for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('bookmarks', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_account_collections',
		{
			title: 'Playbooks Account Collections',
			description: 'Fetch collection records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('collections', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_account_drafts',
		{
			title: 'Playbooks Account Drafts',
			description: 'Fetch draft plays for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('drafts', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_account_ledgers',
		{
			title: 'Playbooks Account Ledgers',
			description: 'Fetch ledger activity for the current account.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			executeAccountAction('ledgers', configPath, {
				select,
			}),
	);

	server.registerTool(
		'playbooks_account_ledger',
		{
			title: 'Playbooks Account Ledger',
			description: 'Deprecated alias for playbooks_account_ledgers.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			executeAccountAction('ledgers', configPath, {
				select,
			}),
	);

	server.registerTool(
		'playbooks_account_plays',
		{
			title: 'Playbooks Account Plays',
			description: 'Fetch plays owned by the current account.',
			inputSchema: accountStatusListInputSchema,
		},
		async ({ select, status, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('plays', configPath, {
				select,
				status,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_account_teams',
		{
			title: 'Playbooks Account Teams',
			description: 'Fetch teams available to the current session.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('teams', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_banks',
		{
			title: 'Playbooks Banks',
			description: 'Fetch bank records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('banks', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_cards',
		{
			title: 'Playbooks Cards',
			description: 'Fetch card records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('cards', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_charges',
		{
			title: 'Playbooks Charges',
			description: 'Fetch charge records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('charges', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_downloads',
		{
			title: 'Playbooks Downloads',
			description: 'Fetch download records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('downloads', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_payouts',
		{
			title: 'Playbooks Payouts',
			description: 'Fetch payout records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('payouts', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_session',
		{
			title: 'Playbooks Session',
			description: 'View the current Playbooks session.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			execute({
				command: 'session',
				configPath,
				options: { select },
			}),
	);

	server.registerTool(
		'playbooks_subscription',
		{
			title: 'Playbooks Subscription',
			description: 'Fetch subscription details for the current account.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			executeAccountAction('subscription', configPath, {
				select,
			}),
	);

	server.registerTool(
		'playbooks_transfers',
		{
			title: 'Playbooks Transfers',
			description: 'Fetch transfer records for the current account.',
			inputSchema: accountListInputSchema,
		},
		async ({ select, page, pageSize, sortProp, sortValue, configPath }) =>
			executeAccountAction('transfers', configPath, {
				select,
				page,
				pageSize,
				sortProp,
				sortValue,
			}),
	);

	server.registerTool(
		'playbooks_usage',
		{
			title: 'Playbooks Usage',
			description: 'Fetch usage details for the current account.',
			inputSchema: accountDetailInputSchema,
		},
		async ({ select, configPath }) =>
			executeAccountAction('usage', configPath, {
				select,
			}),
	);

	for (const resource of resourceTools) {
		server.registerTool(
			resource.pluralTool,
			{
				title: `Playbooks ${resource.pluralLabel}`,
				description: `List ${resource.pluralLabel.toLowerCase()} from Playbooks.`,
				inputSchema: resourceListInputSchema,
			},
			async ({ select, include, view, query, page, pageSize, sortProp, sortValue, configPath }) =>
				execute({
					command: resource.command,
					configPath,
					options: {
						select,
						include,
						view,
						query,
						page,
						pageSize,
						sortProp,
						sortValue,
					},
				}),
		);

		server.registerTool(
			resource.singularTool,
			{
				title: `Playbooks ${resource.singularLabel}`,
				description: `Fetch a single ${resource.singularLabel.toLowerCase()} by UUID or slug.`,
				inputSchema: resourceDetailInputSchema,
			},
			async ({ uuid, select, include, configPath }) =>
				execute({
					command: resource.command,
					positional: [uuid],
					configPath,
					options: { select, include },
				}),
		);

		server.registerTool(
			resource.playsTool,
			{
				title: `Playbooks ${resource.singularLabel} Plays`,
				description: `List plays associated with a ${resource.singularLabel.toLowerCase()}.`,
				inputSchema: resourcePlaysInputSchema,
			},
			async ({ uuid, select, view, query, page, pageSize, sortProp, sortValue, configPath }) =>
				execute({
					command: resource.command,
					positional: [uuid, 'plays'],
					configPath,
					options: {
						select,
						view,
						query,
						page,
						pageSize,
						sortProp,
						sortValue,
					},
				}),
		);
	}

	server.registerTool(
		'playbooks_play',
		{
			title: 'Playbooks Play',
			description: 'Fetch a single play by UUID or slug.',
			inputSchema: playDetailInputSchema,
		},
		async ({ uuid, select, include, configPath }) =>
			execute({
				command: 'plays',
				positional: [uuid],
				configPath,
				options: { select, include },
			}),
	);

	server.registerTool(
		'playbooks_play_demo',
		{
			title: 'Playbooks Play Demo',
			description: 'Fetch demo details for a specific play.',
			inputSchema: playDetailInputSchema,
		},
		async ({ uuid, select, include, configPath }) =>
			execute({
				command: 'plays',
				positional: [uuid, 'demo'],
				configPath,
				options: { select, include },
			}),
	);

	server.registerTool(
		'playbooks_play_deploy',
		{
			title: 'Playbooks Play Deploy',
			description: 'Deploy the demo attached to a play owned by the current account.',
			inputSchema: playDetailInputSchema,
		},
		async ({ uuid, select, include, configPath }) =>
			execute({
				command: 'plays',
				positional: [uuid, 'deploy'],
				configPath,
				options: { select, include },
			}),
	);

	server.registerTool(
		'playbooks_plays',
		{
			title: 'Playbooks Plays',
			description: 'List plays from Playbooks with optional filters.',
			inputSchema: playListInputSchema,
		},
		async ({ select, include, view, query, page, pageSize, sortProp, sortValue, configPath }) =>
			execute({
				command: 'plays',
				configPath,
				options: {
					select,
					include,
					view,
					query,
					page,
					pageSize,
					sortProp,
					sortValue,
				},
			}),
	);

	server.registerTool(
		'playbooks_download',
		{
			title: 'Playbooks Download',
			description: 'Download a play to the local filesystem.',
			inputSchema: {
				uuid: uuidSchema,
				path: pathSchema,
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
				uuid: uuidSchema,
				path: pathSchema,
				name: z.string().min(1).optional(),
				version: z.string().min(1).optional(),
				configPath: configPathSchema,
			},
		},
		async ({ uuid, path, name, version, configPath }) =>
			execute({
				command: 'add',
				positional: [uuid],
				configPath,
				options: { path, name, version },
			}),
	);

	server.registerTool(
		'playbooks_clone',
		{
			title: 'Playbooks Clone',
			description: 'Clone a play to a GitHub account connected to Playbooks.',
			inputSchema: {
				uuid: uuidSchema,
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
		'playbooks_init',
		{
			title: 'Playbooks Init',
			description: 'Create a playbooks.json file in a local project.',
			inputSchema: {
				path: pathSchema,
				configPath: configPathSchema,
			},
		},
		async ({ path, configPath }) =>
			execute({
				command: 'init',
				configPath,
				options: { path },
			}),
	);

	server.registerTool(
		'playbooks_publish',
		{
			title: 'Playbooks Publish',
			description: 'Publish a play owned by the current account to the marketplace.',
			inputSchema: {
				uuid: uuidSchema,
				configPath: configPathSchema,
			},
		},
		async ({ uuid, configPath }) =>
			execute({
				command: 'publish',
				positional: [uuid],
				configPath,
			}),
	);

	server.registerTool(
		'playbooks_submit',
		{
			title: 'Playbooks Submit',
			description: 'Submit a play to Playbooks from a GitHub URL.',
			inputSchema: {
				url: urlSchema,
				variant: variantSchema,
				visibility: visibilitySchema,
				configPath: configPathSchema,
			},
		},
		async ({ url, variant, visibility, configPath }) =>
			execute({
				command: 'submit',
				positional: [url],
				configPath,
				options: {
					variant: variant ?? 'starter',
					visibility: visibility ?? 'public',
				},
			}),
	);

	server.registerTool(
		'playbooks_sync',
		{
			title: 'Playbooks Sync',
			description: 'Sync a play to pull the latest files from GitHub.',
			inputSchema: {
				uuid: uuidSchema,
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
			description: 'Toggle the active Playbooks account, optionally to a specific team UUID.',
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
