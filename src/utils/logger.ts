const chalk = require('chalk');

const mode = import.meta.env.MODE;

export const log = (title, ...data) => {
	if (mode !== 'development') return;
	return console.log(title, ...data);
};

export const debug = (title, ...data) => {
	return console.log(chalk.red(title), ...data);
};

export const info = (title, ...data) => {
	return console.log(chalk.blue(title), ...data);
};

export const warn = (title, ...data) => {
	return console.log(chalk.yellow(title), ...data);
};

export const success = (title, ...data) => {
	return console.log(chalk.green(title), ...data);
};

export const error = (title, ...data) => {
	return console.log(chalk.red(title), ...data);
};

// Docs:
// https://developer.mozilla.team/en-US/docs/Web/API/Console
// https://betterstack.com/docs/logs/javascript/install/
