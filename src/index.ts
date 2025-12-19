import { version } from '../package.json';
import os from 'node:os';
import sade from 'sade';
import {
	accountCommand,
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
	sessionCommand,
	snippetCommand,
	snippetsCommand,
	stackCommand,
	stacksCommand,
	subscriptionCommand,
	syncCommand,
	teamsCommand,
	templateCommand,
	templatesCommand,
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
	.describe('Clone a Playbooks template, submission, or stack to your Github account.')
	.option('--account', 'Select your Github account')
	.option('--name', 'Name the cloned repository')
	.option('--private', 'Mark the cloned template as private')
	.option('--element', 'Conditional flag to clone a element', false)
	.option('--snippet', 'Conditional flag to clone a snippet', false)
	.option('--stack', 'Conditional flag to clone a stack', false)
	.option('--template', 'Conditional flag to clone a template', false)
	.option('--version', 'Specify the versionId', false)
	.example('playbooks clone actix-official-starter')
	.example('playbooks clone actix-official-starter --account mile-hi-labs --name my-new-template --private')
	.action(cloneCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks config')
	.action(configCommand);

cli
	.command('download <uuid>')
	.describe('Download a Playbooks element, snippet, stack, or template to your local machine.')
	.option('--path', 'Path to destination folder', '.')
	.option('--name', 'Name the downloaded repository')
	.option('--element', 'Conditional flag to download a element', false)
	.option('--snippet', 'Conditional flag to download a snippet', false)
	.option('--stack', 'Conditional flag to download a stack', false)
	.option('--template', 'Conditional flag to download a template', false)
	.option('--version', 'Specify tarball version', false)
	.example('playbooks download astro-official-starter')
	.example('playbooks download astro-official-starter --path ~/path/to/folder --name astro-project')
	.action(downloadCommand);

cli
	.command('downloads')
	.describe('Fetch a list of your downloads.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks downloads')
	.action(downloadsCommand);

cli
	.command('login')
	.describe('Login via email / password.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli.command('logout').describe('Logout of your account.').example('playbooks logout').action(logoutCommand);

cli.command('oauth').describe('Loging via oauth.').example('playbooks oauth').action(oauthCommand);

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
	.command('template <uuid>')
	.describe('Fetch a specific template.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks template actix-official-starter')
	.example('playbooks template actix-official-starter --include framework')
	.action(templateCommand);

cli
	.command('templates')
	.describe('Fetch a list of templates.')
	.option('--select', 'Select specific fields', '*')
	.option('--framework', 'Fetch by framework identifer')
	.option('--language', 'Fetch by language identifier')
	.option('--platform', 'Fetch by platform identifer')
	.option('--team', 'Fetch by team identifier')
	.option('--tool', 'Fetch by tool identifier')
	.option('--topic', 'Fetch by topic identifier')
	.option('--user', 'Fetch by user identifier')
	.option('--view', 'Filter by view')
	.example('playbooks templates')
	.example('playbooks templates --framework react')
	.example('playbooks templates --language typescript')
	.example('playbooks templates --team mile-hi-labs')
	.example('playbooks templates --tool stripe')
	.example('playbooks templates --topic portfolio')
	.example('playbooks templates --user ehubbell')
	.action(templatesCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks session')
	.action(sessionCommand);

cli
	.command('snippet <uuid>')
	.describe('Fetch a specific snippet.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks snippet redis-snippet')
	.example('playbooks snippet redis-snippet --include framework')
	.action(snippetCommand);

cli
	.command('snippets')
	.describe('Fetch a list of snippets.')
	.option('--select', 'Select specific fields', '*')
	.option('--team', 'Fetch by user identifier')
	.option('--user', 'Fetch by team identifer')
	.option('--view', 'Filter by view')
	.example('playbooks snippets')
	.example('playbooks snippets --team mile-hi-labs')
	.example('playbooks snippets --user ehubbell')
	.action(snippetsCommand);

cli
	.command('stack <uuid>')
	.describe('Fetch a specific stack.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks stack marketplace-stack')
	.example('playbooks stack marketplace-stack --include framework')
	.action(stackCommand);

cli
	.command('stacks')
	.describe('Fetch a list of stacks.')
	.option('--select', 'Select specific fields', '*')
	.option('--team', 'Fetch by user identifier')
	.option('--user', 'Fetch by team identifer')
	.option('--view', 'Filter by view')
	.example('playbooks stacks')
	.example('playbooks stacks --team mile-hi-labs')
	.example('playbooks stacks --user ehubbell')
	.action(stacksCommand);

cli
	.command('subscription')
	.describe('View your account subscription.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks subscription')
	.action(subscriptionCommand);

cli
	.command('sync <uuid>')
	.describe('Sync a submission or template you own from Github.')
	.option('--template', 'Conditional flag to sync a template', true)
	.option('--submission', 'Conditional flag to sync a submission', false)
	.example('playbooks sync starter-template')
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
