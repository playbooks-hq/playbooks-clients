import boxen from 'boxen';

export const DisplayError = ({ status, title, detail = null, source = null }) => {
	const formattedMessage = JSON.stringify({ status, title, detail, source }, null, 2);

	console.log(
		boxen(formattedMessage, {
			title: 'Error',
			padding: 1,
			borderColor: 'red',
			dimBorder: true,
		}),
	);
};
