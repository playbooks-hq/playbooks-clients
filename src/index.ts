#!/usr/bin/env node

const sade = require('sade');
import {
	accountCommand,
	configCommand,
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
	.option('-c, --config', 'Path to your config file.', '~/.playbooksrc');

// Basics
cli.command('config').describe('View your config file.').example('playbooks config').action(configCommand);

cli
	.command('login')
	.describe('Log into your account in place of using a config file.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli
	.command('ping')
	.describe('Check to make sure your connection is working.')
	.example('playbooks ping')
	.action(pingCommand);

// Marketplace
cli
	.command('repo <uuid>')
	.describe('Fetch repo by uuid from Playbooks.')
	.option('-s, --select', 'Select specific fields')
	.option('-i, --include', 'Include associated data')
	.example('playbooks repo react-official-starter')
	.example('playbooks repo react-official-starter --include framework')
	.action(repoCommand);

cli
	.command('repos')
	.describe('Fetch repos from Playbooks.')
	.option('-s, --select', 'Select specific fields')
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

// Account
cli
	.command('session')
	.describe('View your Playbooks session.')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks session')
	.action(sessionCommand);

cli
	.command('account')
	.describe('View which Playbooks account is currently active.')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks account')
	.action(accountCommand);

cli
	.command('subscription')
	.describe('View your Playbooks subscription.')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks subscription')
	.action(subscriptionCommand);

cli
	.command('teams')
	.describe('View your Playbooks teams.')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks teams')
	.action(teamsCommand);

cli
	.command('toggle')
	.describe('Toggle which Playbooks account is currently active.')
	.option('-u, --uuid', 'Select specific fields')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks toggle')
	.example('playbooks toggle --uuid team-uuid')
	.action(toggleCommand);

cli
	.command('orders')
	.describe('View your Playbooks orders.')
	.option('-e, --entity', 'Filter orders by entity', 'Repo')
	.option('-s, --select', 'Select specific fields')
	.example('playbooks order')
	.action(ordersCommand);

// Logout
cli.command('logout').describe('Logout of your Playbooks account.').example('playbooks logout').action(logoutCommand);

cli.parse(process.argv);
