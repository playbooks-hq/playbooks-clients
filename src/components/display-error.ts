const boxen = require('boxen');

export const DisplayError = ({ status, title, detail, framework }) => {
	const formattedMessage = JSON.stringify({ status, title, detail }, null, 2);

	console.log(
		boxen(formattedMessage, {
			title: 'Error',
			padding: 1,
			borderColor: 'red',
			dimBorder: true,
		}),
	);
};
