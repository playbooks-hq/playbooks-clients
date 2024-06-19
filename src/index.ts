#!/usr/bin/env node

const sade = require('sade');
import { configCommand, loginCommand, pingCommand } from 'src/commands';

import { version } from '../package.json';

const cli = sade('playbooks-cli');

cli
	.version(version)
	.describe('A simple CLI for the Playbooks project.')
	.option('-c, --config', 'Path to config file. Defaults to `~/.playbooksrc`.');

cli
	.command('login')
	.describe('Log into your account and create a session in place of using an API Token.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.example('playbooks login -e acme@example.com -p password')
	.action(loginCommand);

cli
	.command('config')
	.describe('Modify config file variables from the command line.')
	.option('-e, --email', 'Your email address')
	.option('-p, --password', 'Your password')
	.option('-t, --token', 'Your API token')
	.example('playbooks config -e acme@example.com')
	.example('playbooks config -p password')
	.example('playbooks config -t ********')
	.action(configCommand);

cli
	.command('ping')
	.describe('Ping Playbooks to make sure the connection is working and your session is active.')
	.example('playbooks ping')
	.action(pingCommand);

cli.parse(process.argv);
