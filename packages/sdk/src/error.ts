import { STATUS_CODES } from 'node:http';

export class PlaybooksError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly source?: string,
		readonly debug?: string,
		readonly title = STATUS_CODES[status] || 'Request Failed',
	) {
		super(message);
	}
}
