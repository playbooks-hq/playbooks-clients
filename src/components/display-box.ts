const boxen = require('boxen');

export const DisplayBox = (title, message) => {
	console.log(
		boxen(message, {
			title: title,
			padding: 1,
			borderColor: 'cyan',
			dimBorder: true,
		}),
	);
};
