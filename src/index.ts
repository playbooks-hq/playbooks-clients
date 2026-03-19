import os from 'node:os';

import sade from 'sade';
import {
	AccountBanksCommand,
	AccountCardsCommand,
	AccountChargesCommand,
	AccountCommand,
	AccountDownloadsCommand,
	AccountLedgerCommand,
	AccountPayoutsCommand,
	AccountPlaysCommand,
	AccountSubscriptionCommand,
	AccountTeamsCommand,
	AccountTransfersCommand,
	AccountUsageCommand,
	AddCommand,
	CloneCommand,
	ConfigCommand,
	DownloadCommand,
	LoginCommand,
	LogoutCommand,
	OauthCommand,
	PingCommand,
	PlayCommand,
	PlaysCommand,
	SessionCommand,
	SyncCommand,
	TeamCommand,
	TeamsCommand,
	ToggleCommand,
	UserCommand,
	UsersCommand,
} from 'src/commands';

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
	.action(AccountCommand);

cli
	.command('account banks')
	.describe('Fetch your account banks.')
	.option('--select', 'Select specific fields', '*')
	.example('account banks')
	.alias('banks', 'account-banks')
	.action(AccountBanksCommand);

cli
	.command('account cards')
	.describe('Fetch your account cards.')
	.option('--select', 'Select specific fields', '*')
	.example('account cards')
	.alias('cards', 'account-cards')
	.action(AccountCardsCommand);

cli
	.command('account charges')
	.describe('Fetch your account charges.')
	.option('--select', 'Select specific fields', '*')
	.example('account charges')
	.alias('charges', 'account-charges')
	.action(AccountChargesCommand);

cli
	.command('account downloads')
	.describe('Fetch your account downloads.')
	.option('--select', 'Select specific fields', '*')
	.example('account downloads')
	.alias('downloads', 'account-downloads')
	.action(AccountDownloadsCommand);

cli
	.command('account ledger')
	.describe('Fetch your account ledger.')
	.option('--select', 'Select specific fields', '*')
	.example('account ledger')
	.alias('account-ledger')
	.action(AccountLedgerCommand);

cli
	.command('account payouts')
	.describe('Fetch your account payouts.')
	.option('--select', 'Select specific fields', '*')
	.example('account payouts')
	.alias('payouts', 'account-payouts')
	.action(AccountPayoutsCommand);

cli
	.command('account plays')
	.describe('Fetch your account plays.')
	.option('--select', 'Select specific fields', '*')
	.option('--status', 'Filter by status')
	.example('account plays')
	.alias('account-plays')
	.action(AccountPlaysCommand);

cli
	.command('account subscription')
	.describe('Fetch your account subscription.')
	.option('--select', 'Select specific fields', '*')
	.example('account subscription')
	.alias('subscription', 'account-subscription')
	.action(AccountSubscriptionCommand);

cli
	.command('account teams')
	.describe('Fetch your account teams.')
	.option('--select', 'Select specific fields', '*')
	.example('account teams')
	.alias('account-teams')
	.action(AccountTeamsCommand);

cli
	.command('account transfers')
	.describe('Fetch a list of your transfers.')
	.option('--select', 'Select specific fields', '*')
	.example('account transfers')
	.alias('transfers', 'account-transfers')
	.action(AccountTransfersCommand);

cli
	.command('account usage')
	.describe('Fetch your account usage statistics.')
	.option('--select', 'Select specific fields', '*')
	.example('account usage')
	.alias('usage', 'account-usage')
	.action(AccountUsageCommand);

cli
	.command('add <uuid>')
	.describe('Add a play to your local project.')
	.option('--base', 'Path to base project', '.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('playbooks add express-logging-middleware')
	.example('playbooks add express-logging-middleware --path ~/middlewares/logging-middleware.ts')
	.action(AddCommand);

cli
	.command('clone <uuid>')
	.describe('Clone a play to your Github account.')
	.option('--account', 'Select your Github account')
	.option('--name', 'Name the cloned repository')
	.option('--private', 'Mark the cloned play as private')
	.option('--version', 'Specify the versionId', false)
	.example('playbooks clone actix-official-starter')
	.example('playbooks clone actix-official-starter --account mile-hi-labs --private')
	.action(CloneCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks config')
	.action(ConfigCommand);

cli
	.command('download <uuid>')
	.describe('Download a play to your local machine.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('playbooks download astro-official-starter')
	.example('playbooks download astro-official-starter --path ~/path/to/folder')
	.action(DownloadCommand);

cli
	.command('login')
	.describe('Login to Playbooks via email / password.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(LoginCommand);

cli.command('logout').describe('Logout of your Playbooks account.').example('playbooks logout').action(LogoutCommand);

cli.command('oauth').describe('Login to Playbooks via Github oauth.').example('playbooks oauth').action(OauthCommand);

cli.command('ping').describe('Check your API connection.').example('playbooks ping').action(PingCommand);

cli
	.command('play <uuid>')
	.describe('Fetch a specific play from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks play actix-official-starter')
	.example('playbooks play actix-official-starter --include framework')
	.action(PlayCommand);

cli
	.command('team <uuid>')
	.describe('Fetch a specific team from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('team mile-hi-labs')
	.example('team mile-hi-labs --include users')
	.action(TeamCommand);

cli
	.command('plays')
	.describe('Fetch plays from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--framework', 'Fetch by framework identifer')
	.option('--language', 'Fetch by language identifier')
	.option('--platform', 'Fetch by platform identifer')
	.option('--team', 'Fetch by team identifier')
	.option('--tool', 'Fetch by tool identifier')
	.option('--tag', 'Fetch by tag identifier')
	.option('--user', 'Fetch by user identifier')
	.option('--view', 'Filter by view')
	.example('playbooks plays')
	.example('playbooks plays --framework react')
	.example('playbooks plays --language typescript')
	.example('playbooks plays --team mile-hi-labs')
	.example('playbooks plays --tool stripe')
	.example('playbooks plays --tag portfolio')
	.example('playbooks plays --user ehubbell')
	.example('playbooks plays --view featured')
	.action(PlaysCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks session')
	.action(SessionCommand);

cli
	.command('sync <uuid>')
	.describe('Sync a play you own to receive the latest files from Github.')
	.example('playbooks sync my-official-starter')
	.action(SyncCommand);

cli
	.command('teams')
	.describe('Fetch teams from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks teams')
	.action(TeamsCommand);

cli
	.command('user <uuid>')
	.describe('Fetch a specific user from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('user ehubbell')
	.example('user ehubbell --include teams')
	.action(UserCommand);

cli
	.command('toggle')
	.describe('Toggle your active account.')
	.option('--uuid', 'Select specific fields', '*')
	.example('playbooks toggle')
	.example('playbooks toggle --uuid mile-hi-labs')
	.action(ToggleCommand);

cli
	.command('users')
	.describe('Fetch users from the marketplace.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks users')
	.action(UsersCommand);

cli.parse(process.argv);
