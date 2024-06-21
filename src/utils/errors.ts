import * as Logger from 'src/utils/logger';

const MODE = import.meta.env.MODE;

export const formatError = e => {
	switch (e.status || e.code) {
		case 401:
			return apiError(e);
		case 403:
			return apiError(e);
		case 422:
			return apiError(e);
		case 500:
			return apiError(e);
		default:
			return cliError(e);
	}
};

export const apiError = e => {
	const data = JSON.parse(e.response.text);
	const error = data.errors[0];
	const { status, title, message, framework } = error;
	// Logger.log(`apiError: `, { status, title, message, framework });
	return { status, title, message, framework };
};

export const cliError = e => {
	// Logger.log(`cliError: `, e);
	return { status: e.status || e.code || 500, title: e.name, message: e.message, framework: e.stack };
};
