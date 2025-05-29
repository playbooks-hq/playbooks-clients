#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import { version } from '../package.json';
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
	ordersCommand,
	payoutsCommand,
	pingCommand,
	repoCommand,
	reposCommand,
	sessionCommand,
	stackCommand,
	stacksCommand,
	subscriptionCommand,
	teamsCommand,
	toggleCommand,
	transfersCommand,
} from 'src/commands';

const cli = sade('playbooks');

cli
	.version(version)
	.describe('A CLI for Playbooks (https://www.playbooks.xyz).')
	.option('--config', 'Path to your config file.', `${os.homedir()}/.playbooksrc`);

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
	.describe('Clone a Playbooks repo, submission, or stack to your Github account.')
	.option('--account', 'Select your Github account')
	.option('--name', 'Name the cloned repository')
	.option('--private', 'Mark the cloned repo as private')
	.option('--repo', 'Conditional flag to clone a repo', false)
	.option('--stack', 'Conditional flag to clone a stack', false)
	.option('--submission', 'Conditional flag to clone a submission', false)
	.option('--version', 'Specify the versionId', false)
	.example('playbooks clone actix-official-starter')
	.example('playbooks clone actix-official-starter --account mile-hi-labs --name my-new-repo --private')
	.action(cloneCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks config')
	.action(configCommand);

cli
	.command('download <uuid>')
	.describe('Download a Playbooks repo, submission, or stack to your local machine.')
	.option('--path', 'Path to destination folder', '.')
	.option('--unzip', 'Automatically unzip the binary file', false)
	.option('--remove', 'Automatically remove the binary file', false)
	.option('--repo', 'Conditional flag to download a repo', false)
	.option('--stack', 'Conditional flag to download a stack', false)
	.option('--submission', 'Conditional flag to download a submission', false)
	.option('--version', 'Specify the versionId', false)
	.example('playbooks download actix-official-starter')
	.example('playbooks download actix-official-starter --path `~/path/to/folder')
	.action(downloadCommand);

cli
	.command('downloads')
	.describe('Fetch a list of your downloads.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks downloads')
	.action(downloadsCommand);

cli
	.command('login')
	.describe('Login to your account.')
	.option('--email', 'Your email address')
	.option('--password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli.command('logout').describe('Logout of your account.').example('playbooks logout').action(logoutCommand);

cli
	.command('payouts')
	.describe('Fetch a list of your payouts.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks payouts')
	.action(payoutsCommand);

cli
	.command('orders')
	.describe('View your account orders.')
	.option('--entity', 'Filter orders by entity', 'Repo')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks order')
	.action(ordersCommand);

cli.command('ping').describe('Check your API connection.').example('playbooks ping').action(pingCommand);

cli
	.command('repo <uuid>')
	.describe('Fetch a specific repo.')
	.option('--select', 'Select specific fields', '*')
	.option('--include', 'Include associated data')
	.example('playbooks repo actix-official-starter')
	.example('playbooks repo actix-official-starter --include framework')
	.action(repoCommand);

cli
	.command('repos')
	.describe('Fetch a list of repos.')
	.option('--select', 'Select specific fields', '*')
	.option('--framework', 'Fetch by framework identifer')
	.option('--language', 'Fetch by language identifier')
	.option('--platform', 'Fetch by platform identifer')
	.option('--team', 'Fetch by team identifier')
	.option('--tool', 'Fetch by tool identifier')
	.option('--topic', 'Fetch by topic identifier')
	.option('--user', 'Fetch by user identifier')
	.option('--view', 'Filter by view')
	.example('playbooks repos')
	.example('playbooks repos --framework react')
	.example('playbooks repos --language typescript')
	.example('playbooks repos --team mile-hi-labs')
	.example('playbooks repos --tool stripe')
	.example('playbooks repos --topic portfolio')
	.example('playbooks repos --user ehubbell')
	.action(reposCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('--select', 'Select specific fields', '*')
	.example('playbooks session')
	.action(sessionCommand);

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
