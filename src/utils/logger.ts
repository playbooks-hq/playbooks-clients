const chalk = require('chalk');

const mode = import.meta.env.MODE;

class logger {
	static log = (title, ...data) => {
		if (mode !== 'development') return;
		return console.log(title, ...data);
	};

	static error = (title, ...data) => {
		return console.log(chalk.red(title, ...data));
	};

	static warn = (title, ...data) => {
		return console.log(chalk.yellow(title, ...data));
	};

	static info = (title, ...data) => {
		return console.log(chalk.blue(title, ...data));
	};

	static success = (title, ...data) => {
		return console.log(chalk.green(title, ...data));
	};

	static debug = (title, ...data) => {
		return console.log(chalk.red(title, ...data));
	};
}

export { logger };

// Docs:
// https://developer.mozilla.team/en-US/docs/Web/API/Console
