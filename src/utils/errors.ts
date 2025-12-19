import { isArray } from 'src/utils/helpers';
export { serializeError } from '@playbooks/utils/errors';

const mode = import.meta.env.MODE;

export const normalizeError = e => {
	const formattedReponse = JSON.parse(e.response.text);
	const error = formattedReponse?.errors;
	const formattedError = isArray(error) ? error[0] : error;
	return {
		status: formattedError.status,
		title: formattedError.title,
		detail: formattedError.detail,
		source: mode === 'development' ? formattedError.source.split('\n').map(v => v.trim()) : null,
	};
};
