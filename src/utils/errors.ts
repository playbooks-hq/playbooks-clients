import { isArray } from 'src/utils/helpers';
export { httpError, serializeError } from '@playbooks/utils/errors';

const mode = import.meta.env.MODE;

export const normalizeError = e => {
	if (!e.response?.text) {
		if (e.status) return { status: e.status, title: e.name, detail: e.message };
		console.error(e);
		return { status: 500, title: 'Canceled', detail: 'The process was canceled abruptly.' };
	}
	const formattedReponse = JSON.parse(e.response?.text);
	const error = formattedReponse?.errors;
	const formattedError = isArray(error) ? error[0] : error;
	return {
		status: formattedError.status,
		title: formattedError.title,
		detail: formattedError.detail,
		source: mode === 'development' && formattedError.source ? formattedError.source.split('\n').map(v => v.trim()) : null,
	};
};
