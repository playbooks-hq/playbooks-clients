import boxen from 'boxen';

export const DisplaySuccess = (title, message) => {
	console.log(
		boxen(message, {
			title: title,
			padding: 1,
			borderColor: 'cyan',
			dimBorder: true,
		}),
	);
};
