import os from 'node:os';

import sade from 'sade';
import * as Commands from 'src/commands';

import { version } from '../package.json';

const mode = import.meta.env.MODE;
const configFile = mode === 'development' ? `${os.homedir()}/.playbooksrcd` : `${os.homedir()}/.playbooksrc`;
const demosActions = ['deploy'];

const cli = sade('playbooks');

const normalizeCommandArgs = (argv: string[]) => {
	const [nodePath, scriptPath, command, maybeTarget, maybeAction, ...rest] = argv;

	if (command === 'demos' && maybeTarget && maybeAction && demosActions.includes(maybeAction)) {
		return [nodePath, scriptPath, command, maybeAction, maybeTarget, ...rest];
	}

	return argv;
};

cli
	.version(version)
	.describe('A CLI for Playbooks (https://www.playbooks.xyz).')
	.option('--config', 'Path to your config file.', configFile);

// Commands
cli
	.command('account [action]')
	.describe('Fetch your account related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--status', 'Filter by status')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('account')
	.example('account banks')
	.example('account bookmarks')
	.example('account cards')
	.example('account charges')
	.example('account collections')
	.example('account drafts')
	.example('account downloads')
	.example('account invoices')
	.example('account ledgers')
	.example('account plays')
	.example('account subscription')
	.example('account teams')
	.example('account transfers')
	.example('account usage')
	.action(Commands.AccountCommand);

cli
	.command('add <uuid>')
	.describe('Add a play to your local project.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('add express-logging-middleware')
	.example('add express-logging-middleware --path ~/middlewares/logging-middleware.ts')
	.action(Commands.AddCommand);

cli
	.command('clone <uuid>')
	.describe('Clone a play to your Github account.')
	.option('--account', 'Select your Github account')
	.option('--name', 'Name the cloned repository')
	.option('--private', 'Mark the cloned play as private')
	.option('--version', 'Specify the versionId', false)
	.example('clone actix-official-starter')
	.example('clone actix-official-starter --account mile-hi-labs --private')
	.action(Commands.CloneCommand);

cli
	.command('collections [uuid] [action]')
	.describe('Fetch collection related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('collections')
	.example('collections --view popular')
	.example('collections starter-packs')
	.example('collections starter-packs --include team')
	.example('collections starter-packs open')
	.example('collections starter-packs plays')
	.example('collections starter-packs plays --view featured')
	.action(Commands.CollectionsCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('--select', 'Select specific fields', '*')
	.example('config')
	.action(Commands.ConfigCommand);

cli
	.command('download <uuid>')
	.describe('Download a play to your local machine.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('download astro-official-starter')
	.example('download astro-official-starter --path ~/path/to/folder')
	.action(Commands.DownloadCommand);

cli
	.command('frameworks [uuid] [action]')
	.describe('Fetch framework related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('frameworks')
	.example('frameworks --view popular')
	.example('frameworks react')
	.example('frameworks react --include team')
	.example('frameworks react open')
	.example('frameworks react plays')
	.example('frameworks react plays --view featured')
	.action(Commands.FrameworksCommand);

cli
	.command('init')
	.describe('Add a playbooks.json file to your project.')
	.option('--path', 'Path to destination folder', '.')
	.example('init')
	.action(Commands.InitCommand);

cli
	.command('languages [uuid] [action]')
	.describe('Fetch language related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('languages')
	.example('languages --view popular')
	.example('languages typescript')
	.example('languages typescript --include framework')
	.example('languages typescript open')
	.example('languages typescript plays')
	.example('languages typescript plays --view featured')
	.action(Commands.LanguagesCommand);

cli
	.command('login')
	.describe('Login to Playbooks via email / password.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('login -email acme@example.com -password password')
	.action(Commands.LoginCommand);

cli.command('logout').describe('Logout of your Playbooks account.').example('logout').action(Commands.LogoutCommand);

cli
	.command('mcp [action]')
	.describe('Configure MCP integrations for supported coding environments.')
	.example('mcp claude')
	.example('mcp codex')
	.example('mcp cursor')
	.example('mcp vscode')
	.action(Commands.McpCommand);

cli.command('oauth').describe('Login to Playbooks via Github oauth.').example('oauth').action(Commands.OauthCommand);

cli.command('ping').describe('Check your API connection.').example('ping').action(Commands.PingCommand);

cli
	.command('plays [uuid] [action]')
	.describe('Fetch play related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('plays')
	.example('plays --query next')
	.example('plays --view featured')
	.example('plays actix-official-starter')
	.example('plays actix-official-starter demo')
	.example('plays actix-official-starter deploy')
	.example('plays actix-official-starter open')
	.action(Commands.PlaysCommand);

cli
	.command('platforms [uuid] [action]')
	.describe('Fetch platform related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('platforms')
	.example('platforms --view popular')
	.example('platforms web')
	.example('platforms web --include tool')
	.example('platforms web open')
	.example('platforms web plays')
	.example('platforms web plays --view featured')
	.action(Commands.PlatformsCommand);

cli
	.command('publish <uuid>')
	.describe('Publish a play to the marketplace.')
	.example('publish astro-official-starter')
	.action(Commands.PublishCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('session')
	.action(Commands.SessionCommand);

cli
	.command('submit <url>')
	.describe('Submit a play via Github URL.')
	.option('--variant', 'Select variant')
	.option('--visibility', 'Select visibility')
	.example('submit https://github.com/ehubbell/astro-official-starter')
	.action(Commands.SubmitCommand);

cli
	.command('sync <uuid>')
	.describe('Sync a play to pull the latest files from Github.')
	.example('sync my-official-starter')
	.action(Commands.SyncCommand);

cli
	.command('tags [uuid] [action]')
	.describe('Fetch tag related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('tags')
	.example('tags --view popular')
	.example('tags portfolio')
	.example('tags portfolio --include user')
	.example('tags portfolio open')
	.example('tags portfolio plays')
	.example('tags portfolio plays --view featured')
	.action(Commands.TagsCommand);

cli
	.command('teams [uuid] [action]')
	.describe('Fetch team related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('teams')
	.example('teams --view popular')
	.example('teams mile-hi-labs')
	.example('teams mile-hi-labs --include users')
	.example('teams mile-hi-labs open')
	.example('teams mile-hi-labs plays')
	.example('teams mile-hi-labs plays --view featured')
	.action(Commands.TeamsCommand);

cli
	.command('tools [uuid] [action]')
	.describe('Fetch tool related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('tools')
	.example('tools --view popular')
	.example('tools stripe')
	.example('tools stripe --include platform')
	.example('tools stripe open')
	.example('tools stripe plays')
	.example('tools stripe plays --view featured')
	.action(Commands.ToolsCommand);

cli
	.command('users [uuid] [action]')
	.describe('Fetch user related resources.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.option('--query', 'Filter by a search query')
	.option('--page', 'Fetch a specific page')
	.option('--pageSize', 'Fetch a specific page size')
	.option('--sortProp', 'Sort by a specific property')
	.option('--sortValue', 'Sort using a specific value')
	.example('users')
	.example('users --view popular')
	.example('users ehubbell')
	.example('users ehubbell --include teams')
	.example('users ehubbell open')
	.example('users ehubbell plays')
	.example('users ehubbell plays --view featured')
	.action(Commands.UsersCommand);

cli
	.command('toggle')
	.describe('Toggle your active account.')
	.option('--uuid', 'Select specific fields', '*')
	.example('toggle')
	.example('toggle --uuid mile-hi-labs')
	.action(Commands.ToggleCommand);

cli.parse(normalizeCommandArgs(process.argv));
