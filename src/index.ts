#!/usr/bin/env node

const os = require('os');
const sade = require('sade');
import {
	accountCommand,
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

// Basics
cli
	.command('login')
	.describe('Login to your account.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli.command('config').describe('View your config file.').example('playbooks config').action(configCommand);

cli.command('ping').describe('Check your API connection.').example('playbooks ping').action(pingCommand);

// Marketplace
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
	.command('repo <uuid>')
	.describe('Fetch a specific repo.')
	.option('-s, --select', 'Select specific fields', '*')
	.option('-i, --include', 'Include associated data')
	.example('playbooks repo react-official-starter')
	.example('playbooks repo react-official-starter --include framework')
	.action(repoCommand);

cli
	.command('download <uuid>')
	.describe('Download a specific repo to your computer.')
	.option('-p, --path', 'Path to destination folder', '.')
	.option('-z, --unzip', 'Automatically unzip download (Boolean)', false)
	.option('-c, --clean', 'Automatically remove zip (Boolean)', false)
	.example('playbooks download react-official-starter')
	.example('playbooks download react-official-starter --path `~/path/to/folder')
	.action(downloadCommand);

// Account
cli
	.command('session')
	.describe('View your current session.')
	.option('-s, --select', 'Select specific fields', 'id,name,uuid,tagline')
	.example('playbooks session')
	.action(sessionCommand);

cli
	.command('account')
	.describe('View your active account.')
	.option('-s, --select', 'Select specific fields', 'id,name,uuid,tagline')
	.example('playbooks account')
	.action(accountCommand);

cli
	.command('subscription')
	.describe('View your account subscription.')
	.option(
		'-s, --select',
		'Select specific fields',
		'id,name,interval,seats,summary,anchorDate,currentPeriodStart,currentPeriodEnd',
	)
	.example('playbooks subscription')
	.action(subscriptionCommand);

cli
	.command('orders')
	.describe('View your account orders.')
	.option('-e, --entity', 'Filter orders by entity', 'Repo')
	.option('-s, --select', 'Select specific fields', '*')
	.example('playbooks order')
	.action(ordersCommand);

cli
	.command('teams')
	.describe('View your teams.')
	.option('-s, --select', 'Select specific fields', 'id,name,uuid,tagline')
	.example('playbooks teams')
	.action(teamsCommand);

cli
	.command('toggle')
	.describe('Toggle your active account.')
	.option('-u, --uuid', 'Select specific fields', '*')
	.option('-s, --select', 'Select specific fields', 'id,name,uuid,tagline,createdAt')
	.example('playbooks toggle')
	.example('playbooks toggle --uuid team-uuid')
	.action(toggleCommand);

// Logout
cli.command('logout').describe('Logout of your account.').example('playbooks logout').action(logoutCommand);

cli.parse(process.argv);
