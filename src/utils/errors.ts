import HttpError from 'http-errors';

const formatError = error => ({ error });

export const httpError = HttpError;

export const serializeError = e => {
	const status = e.status || e.statusCode || e.code || 500;
	const title = e.title || e.name || 'Error';
	const description = e.description || e.message || 'An unknown error occurred.';
	const error = { status, title, description };
	if (e.source) error['source'] = e.source;
	if (e.debug) error['debug'] = e.debug;
	return formatError(error);
};

export const normalizeError = e => {
	if (!e.response?.text) {
		if (e.status) return formatError({ status: e.status, title: e.name, description: e.message });
		console.error(e);
		return formatError({ status: 500, title: 'Canceled', description: 'The process was canceled abruptly.' });
	}
	const formattedResponse = JSON.parse(e.response?.text);
	const formattedError = formattedResponse?.error;
	if (!formattedError) {
		return formatError({
			status: e.status || 500,
			title: e.name || 'Error',
			description: e.message || 'An unknown error occurred.',
		});
	}
	const error = {
		status: formattedError.status,
		title: formattedError.title,
		description: formattedError.description,
	};
	if (formattedError.source) error['source'] = formattedError.source;
	if (formattedError.debug) error['debug'] = formattedError.debug;
	return formatError(error);
};
