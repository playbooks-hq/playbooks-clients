#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import {
	accountCommand,
	cloneCommand,
	configCommand,
	downloadCommand,
	loginCommand,
	logoutCommand,
	ordersCommand,
	pingCommand,
	repoCommand,
	reposCommand,
	sessionCommand,
	subscriptionCommand,
	teamsCommand,
	toggleCommand,
} from 'src/commands';

import { version } from '../package.json';

const cli = sade('playbooks');

cli
	.version(version)
	.describe('A CLI for Playbooks (https://www.playbooks.xyz).')
	.option('-c, --config', 'Path to your config file.', `${os.homedir()}/.playbooksrc`);

// Commands
cli
	.command('account')
	.describe('View which account is currently active')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks account')
	.action(accountCommand);

cli
	.command('clone <uuid>')
	.describe('Clone a Playbooks repo to your Github account.')
	.option('-a, --account', 'Clone to an organization')
	.option('-n, --name', 'Rename the cloned repository')
	.option('-p, --private', 'Mark the cloned repo as private')
	.example('playbooks clone actix-official-starter')
	.example('playbooks clone actix-official-starter --org mile-hi-labs --name my-new-repo --private')
	.action(cloneCommand);

cli
	.command('config')
	.describe('Display your config file.')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks config')
	.action(configCommand);

cli
	.command('download <uuid>')
	.describe('Download a Playbooks repo to your local computer.')
	.option('-p, --path', 'Path to destination folder', '.')
	.option('-z, --unzip', 'Automatically unzip the binary file', false)
	.option('-r, --remove', 'Automatically remove the binary file', false)
	.example('playbooks download actix-official-starter')
	.example('playbooks download actix-official-starter --path `~/path/to/folder')
	.action(downloadCommand);

cli
	.command('login')
	.describe('Login to your account.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli.command('logout').describe('Logout of your account.').example('playbooks logout').action(logoutCommand);

cli
	.command('orders')
	.describe('View your account orders.')
	.option('-e, --entity', 'Filter orders by entity', 'Repo')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks order')
	.action(ordersCommand);

cli.command('ping').describe('Check your API connection.').example('playbooks ping').action(pingCommand);

cli
	.command('repo <uuid>')
	.describe('Fetch a specific repo.')
	.option('-s, --select', 'Select specific fields', '*')
	.option('-i, --include', 'Include associated data')
	.example('playbooks repo actix-official-starter')
	.example('playbooks repo actix-official-starter --include framework')
	.action(repoCommand);

cli
	.command('repos')
	.describe('Fetch a list of repos.')
	.option('-s, --select', 'Select specific fields', '*')
	.option('--framework', 'Fetch by framework identifer')
	.option('--language', 'Fetch by language identifier')
	.option('--platform', 'Fetch by platform identifer')
	.option('--tool', 'Fetch by tool identifier')
	.option('--topic', 'Fetch by topic identifier')
	.option('--view', 'Fetch by view')
	.example('playbooks repos')
	.example('playbooks repos --framework react')
	.example('playbooks repos --language typescript')
	.example('playbooks repos --tool docker')
	.action(reposCommand);

cli
	.command('session')
	.describe('View your current session.')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks session')
	.action(sessionCommand);

cli
	.command('subscription')
	.describe('View your account subscription.')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks subscription')
	.action(subscriptionCommand);

cli
	.command('teams')
	.describe('View a list of your session teams.')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks teams')
	.action(teamsCommand);

cli
	.command('toggle')
	.describe('Toggle your active account.')
	.option('-u, --uuid', 'Select specific fields', '*')
	.example('playbooks toggle')
	.example('playbooks toggle --uuid team-uuid')
	.action(toggleCommand);

cli.parse(process.argv);
