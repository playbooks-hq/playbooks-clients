import { version } from '../package.json';
import os from 'node:os';
import sade from 'sade';
import {
	accountCommand,
	addCommand,
	banksCommand,
	cardsCommand,
	chargesCommand,
	cloneCommand,
	configCommand,
	downloadCommand,
	downloadsCommand,
	loginCommand,
	logoutCommand,
	oauthCommand,
	ordersCommand,
	payoutsCommand,
	pingCommand,
	playCommand,
	playsCommand,
	sessionCommand,
	subscriptionCommand,
	syncCommand,
	teamsCommand,
	toggleCommand,
	transfersCommand,
} from 'src/commands';

const mode = import.meta.env.MODE;
const configFile = mode === 'development' ? `${os.homedir()}/.playbooksrcl` : `${os.homedir()}/.playbooksrc`;

const cli = sade('playbooks');

cli
	.version(version)
	.describe('A CLI for Playbooks (https://www.playbooks.xyz).')
	.option('--config', 'Path to your config file.', configFile);

// Commands
cli
	.command('account')
	.describe('View which account is currently active')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks account')
	.action(accountCommand);

cli
	.command('add <uuid>')
	.describe('Add a play to your local project.')
	.option('--base', 'Path to base project', '.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('playbooks add express-logging-middleware')
	.example('playbooks add express-logging-middleware --path ~/middlewares/logging-middleware.ts')
	.action(addCommand);

cli
	.command('banks')
	.describe('Fetch a list of your banks.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks banks')
	.action(banksCommand);

cli
	.command('cards')
	.describe('Fetch a list of your cards.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks cards')
	.action(cardsCommand);

cli
	.command('charges')
	.describe('Fetch a list of your charges.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks charges')
	.action(chargesCommand);

cli
	.command('clone <uuid>')
	.describe('Clone a play to your Github account.')
	.option('--account', 'Select your Github account')
	.option('--name', 'Name the cloned repository')
	.option('--private', 'Mark the cloned play as private')
	.option('--version', 'Specify the versionId', false)
	.example('playbooks clone actix-official-starter')
	.example('playbooks clone actix-official-starter --account mile-hi-labs --private')
	.action(cloneCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks config')
	.action(configCommand);

cli
	.command('download <uuid>')
	.describe('Download a play to your local machine.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--version', 'Specify tarball version', false)
	.example('playbooks download astro-official-starter')
	.example('playbooks download astro-official-starter --path ~/path/to/folder')
	.action(downloadCommand);

cli
	.command('downloads')
	.describe('Fetch a list of your downloads.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks downloads')
	.action(downloadsCommand);

cli
	.command('login')
	.describe('Login to Playbooks via email / password.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli.command('logout').describe('Logout of your Playbooks account.').example('playbooks logout').action(logoutCommand);

cli.command('oauth').describe('Login to Playbooks via Github oauth.').example('playbooks oauth').action(oauthCommand);

cli
	.command('orders')
	.describe('View your account orders.')
	.option('--entity', 'Filter orders by entity', 'Repo')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks order')
	.action(ordersCommand);

cli
	.command('payouts')
	.describe('Fetch a list of your payouts.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks payouts')
	.action(payoutsCommand);

cli.command('ping').describe('Check your API connection.').example('playbooks ping').action(pingCommand);

cli
	.command('play <uuid>')
	.describe('Fetch a specific play.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks play actix-official-starter')
	.example('playbooks play actix-official-starter --include framework')
	.action(playCommand);

cli
	.command('plays')
	.describe('Fetch a list of plays.')
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
	.action(playsCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks session')
	.action(sessionCommand);

cli
	.command('subscription')
	.describe('View your account subscription.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks subscription')
	.action(subscriptionCommand);

cli
	.command('sync <uuid>')
	.describe('Sync a play you own to receive the latest files from Github.')
	.example('playbooks sync my-official-starter')
	.action(syncCommand);

cli
	.command('teams')
	.describe('View a list of your session teams.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks teams')
	.action(teamsCommand);

cli
	.command('toggle')
	.describe('Toggle your active account.')
	.option('--uuid', 'Select specific fields', '*')
	.example('playbooks toggle')
	.example('playbooks toggle --uuid team-uuid')
	.action(toggleCommand);

cli
	.command('transfers')
	.describe('Fetch a list of your transfers.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks transfers')
	.action(transfersCommand);

cli.parse(process.argv);
