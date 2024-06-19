#!/usr/bin/env node

const sade = require('sade');
import { configCommand, loginCommand, pingCommand, reposCommand } from 'src/commands';

import { version } from '../package.json';

const cli = sade('playbooks');

cli
	.version(version)
	.describe('A simple CLI for the Playbooks project.')
	.option('-c, --config', 'Path to config file. Defaults to `~/.playbooksrc`.');

cli
	.command('login')
	.describe('Log into your account in place of using a config file.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli
	.command('config get')
	.describe('Get config file variables from the command line.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.option('-t, --token', 'Your API token')
	.example('playbooks config -e acme@example.com')
	.example('playbooks config -p password')
	.example('playbooks config -t ********')
	.action(configCommand);

cli
	.command('config set')
	.describe('Set config file variables from the command line.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.option('-t, --token', 'Your API token')
	.example('playbooks config -e acme@example.com')
	.example('playbooks config -p password')
	.example('playbooks config -t ********')
	.action(configCommand);

cli
	.command('config ls')
	.describe('Show config file variables from the command line.')
	.example('playbooks config ls')
	.action(configCommand);

cli
	.command('ping')
	.describe('Ping Playbooks to make sure the connection is working.')
	.example('playbooks ping')
	.action(pingCommand);

cli
	.command('repos')
	.describe('Fetch repos from Playbooks.')
	.option('-f, --framework', 'Fetch by framework identifer')
	.option('-l, --language', 'Fetch by language identifier')
	.option('-t, --tool', 'Fetch by tool identifier')
	.example('playbooks repos')
	.example('playbooks repos --framework react')
	.example('playbooks repos --language typescript')
	.example('playbooks repos --tool docker')
	.action(reposCommand);

cli.parse(process.argv);
