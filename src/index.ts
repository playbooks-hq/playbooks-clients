import os from 'node:os';

import sade from 'sade';
import * as Commands from 'src/commands';

import { version } from '../package.json';

const mode = import.meta.env.MODE;
const configFile = mode === 'development' ? `${os.homedir()}/.playbooksrcd` : `${os.homedir()}/.playbooksrc`;

const cli = sade('playbooks');

cli
	.version(version)
	.describe('A CLI for Playbooks (https://www.playbooks.xyz).')
	.option('--config', 'Path to your config file.', configFile);

// Commands
cli
	.command('account')
	.describe('View your account.')
	.option('--select', 'Select specific fields', '*')
	.example('account')
	.action(Commands.AccountCommand);

cli
	.command('account banks')
	.describe('Fetch your account banks.')
	.option('--select', 'Select specific fields', '*')
	.example('account banks')
	.alias('banks', 'account-banks')
	.action(Commands.AccountBanksCommand);

cli
	.command('account cards')
	.describe('Fetch your account cards.')
	.option('--select', 'Select specific fields', '*')
	.example('account cards')
	.alias('cards', 'account-cards')
	.action(Commands.AccountCardsCommand);

cli
	.command('account charges')
	.describe('Fetch your account charges.')
	.option('--select', 'Select specific fields', '*')
	.example('account charges')
	.alias('charges', 'account-charges')
	.action(Commands.AccountChargesCommand);

cli
	.command('account downloads')
	.describe('Fetch your account downloads.')
	.option('--select', 'Select specific fields', '*')
	.example('account downloads')
	.alias('downloads', 'account-downloads')
	.action(Commands.AccountDownloadsCommand);

cli
	.command('account ledger')
	.describe('Fetch your account ledger.')
	.option('--select', 'Select specific fields', '*')
	.example('account ledger')
	.alias('account-ledger')
	.action(Commands.AccountLedgerCommand);

cli
	.command('account payouts')
	.describe('Fetch your account payouts.')
	.option('--select', 'Select specific fields', '*')
	.example('account payouts')
	.alias('payouts', 'account-payouts')
	.action(Commands.AccountPayoutsCommand);

cli
	.command('account plays')
	.describe('Fetch your account plays.')
	.option('--select', 'Select specific fields', '*')
	.option('--status', 'Filter by status')
	.example('account plays')
	.alias('account-plays')
	.action(Commands.AccountPlaysCommand);

cli
	.command('account subscription')
	.describe('Fetch your account subscription.')
	.option('--select', 'Select specific fields', '*')
	.example('account subscription')
	.alias('subscription', 'account-subscription')
	.action(Commands.AccountSubscriptionCommand);

cli
	.command('account teams')
	.describe('Fetch your account teams.')
	.option('--select', 'Select specific fields', '*')
	.example('account teams')
	.alias('account-teams')
	.action(Commands.AccountTeamsCommand);

cli
	.command('account transfers')
	.describe('Fetch your account transfers.')
	.option('--select', 'Select specific fields', '*')
	.example('account transfers')
	.alias('transfers', 'account-transfers')
	.action(Commands.AccountTransfersCommand);

cli
	.command('account usage')
	.describe('Fetch your account usage.')
	.option('--select', 'Select specific fields', '*')
	.example('account usage')
	.alias('usage', 'account-usage')
	.action(Commands.AccountUsageCommand);

cli
	.command('add <uuid>')
	.describe('Add a play to your local project.')
	.option('--base', 'Path to base project', '.')
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
	.describe('Fetch frameworks from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('frameworks')
	.example('frameworks --view popular')
	.example('frameworks react')
	.example('frameworks react --include team')
	.example('frameworks react plays')
	.example('frameworks react plays --view featured')
	.action(Commands.FrameworksCommand);

cli
	.command('languages [uuid] [action]')
	.describe('Fetch languages from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('languages')
	.example('languages --view popular')
	.example('languages typescript')
	.example('languages typescript --include framework')
	.example('languages typescript plays')
	.example('languages typescript plays --view featured')
	.action(Commands.LanguagesCommand);

cli
	.command('login')
	.describe('Login to Playbooks via email / password.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('login -e acme@example.com -p password')
	.action(Commands.LoginCommand);

cli.command('logout').describe('Logout of your Playbooks account.').example('logout').action(Commands.LogoutCommand);

cli.command('oauth').describe('Login to Playbooks via Github oauth.').example('oauth').action(Commands.OauthCommand);

cli.command('ping').describe('Check your API connection.').example('ping').action(Commands.PingCommand);

cli
	.command('tags [uuid] [action]')
	.describe('Fetch tags from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('tags')
	.example('tags --view popular')
	.example('tags portfolio')
	.example('tags portfolio --include user')
	.example('tags portfolio plays')
	.example('tags portfolio plays --view featured')
	.action(Commands.TagsCommand);

cli
	.command('teams [uuid] [action]')
	.describe('Fetch teams from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('teams')
	.example('teams --view popular')
	.example('teams mile-hi-labs')
	.example('teams mile-hi-labs --include users')
	.example('teams mile-hi-labs plays')
	.example('teams mile-hi-labs plays --view featured')
	.action(Commands.TeamsCommand);

cli
	.command('plays [uuid]')
	.describe('Fetch plays from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--framework', 'Fetch by framework identifer')
	.option('--language', 'Fetch by language identifier')
	.option('--platform', 'Fetch by platform identifer')
	.option('--team', 'Fetch by team identifier')
	.option('--tool', 'Fetch by tool identifier')
	.option('--tag', 'Fetch by tag identifier')
	.option('--user', 'Fetch by user identifier')
	.option('--view', 'Filter by view')
	.example('plays')
	.example('plays --framework react')
	.example('plays --language typescript')
	.example('plays --team mile-hi-labs')
	.example('plays --tool stripe')
	.example('plays --tag portfolio')
	.example('plays --user ehubbell')
	.example('plays --view featured')
	.example('plays actix-official-starter')
	.example('plays actix-official-starter --include framework')
	.action(Commands.PlaysCommand);

cli
	.command('platforms [uuid] [action]')
	.describe('Fetch platforms from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('platforms')
	.example('platforms --view popular')
	.example('platforms web')
	.example('platforms web --include tool')
	.example('platforms web plays')
	.example('platforms web plays --view featured')
	.action(Commands.PlatformsCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('session')
	.action(Commands.SessionCommand);

cli
	.command('sync <uuid>')
	.describe('Sync a play you own to receive the latest files from Github.')
	.example('sync my-official-starter')
	.action(Commands.SyncCommand);

cli
	.command('tools [uuid] [action]')
	.describe('Fetch tools from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('tools')
	.example('tools --view popular')
	.example('tools stripe')
	.example('tools stripe --include platform')
	.example('tools stripe plays')
	.example('tools stripe plays --view featured')
	.action(Commands.ToolsCommand);

cli
	.command('users [uuid] [action]')
	.describe('Fetch users from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.option('--view', 'Filter by view')
	.example('users')
	.example('users --view popular')
	.example('users ehubbell')
	.example('users ehubbell --include teams')
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

cli.parse(process.argv);
