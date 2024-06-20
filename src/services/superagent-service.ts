const Fs = require('fs-extra');
const Superagent = require('superagent');
import { serialize, serializeArray } from 'src/api/serializer';
import { normalize, normalizeArray } from 'src/api/normalizer';
import { queryType, mutateType } from 'src/types';
import * as Logger from 'src/utils/logger';

const MODE = import.meta.env.MODE;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const VITE_SSL_KEY_FILE = import.meta.env.VITE_SSL_KEY_FILE;
const VITE_SSL_CERT_FILE = import.meta.env.VITE_SSL_CERT_FILE;

if (MODE === 'development') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface SuperagentService {
	token?: string;
}

class SuperagentService {
	constructor(token?) {
		this.token = token || '';
	}

	/* ----- Variables ----- */
	get auth() {
		return {
			key: Fs.readFileSync(VITE_SSL_KEY_FILE),
			cert: Fs.readFileSync(VITE_SSL_CERT_FILE),
		};
	}

	get headers() {
		return {
			accept: 'application/json',
			['Content-Type']: 'application/json',
		};
	}

	/* ----- Computes ----- */
	computeURL(endpoint = '') {
		return BASE_URL + endpoint;
	}

	computeHeaders(headers = {}) {
		return { ...this.headers, ...headers };
	}

	/* ----- Serializers ----- */
	serializeArray(data) {
		const formattedData = serializeArray(data);
		// Logger.log(`serializedArray: `, formattedData);
		return formattedData;
	}

	serializeData(data) {
		const formattedData = serialize(data);
		// Logger.log(`serializedData: `, formattedData);
		return formattedData;
	}

	/* ----- Serializers ----- */
	normalizeArray(response) {
		const format = JSON.parse(response.text);
		const data = normalizeArray(format.data, format.included, format.meta);
		// Logger.log(`normalizedArray: `, data);
		return data;
	}

	normalizeData(response) {
		const format = JSON.parse(response.text);
		const data = normalize(format.data, format.included);
		// Logger.log(`normalizedData: `, data);
		return data;
	}

	normalizeError(e) {
		const data = JSON.parse(e.response.text);
		const error = data.errors[0];
		const { status, title, message, framework } = error;
		Logger.error('API Error: ', { status, title, message, framework: MODE === 'production' ? framework : '' });
	}

	/* ----- Methods ----- */
	async query({ endpoint, headers, params = {} }: queryType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			const response = await Superagent.get(computedUrl).set(computedHeaders).query(params);
			return this.normalizeArray(response);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}

	async queryRecord({ endpoint, headers, params }: queryType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			const response = await Superagent.get(computedUrl).set(computedHeaders).query(params);
			return this.normalizeData(response);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}

	async post({ endpoint, headers, params, data }: mutateType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			const computedData = this.serializeData(data);
			const response = await Superagent.post(computedUrl).set(computedHeaders).query(params).send(computedData);
			return this.normalizeData(response);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}

	async update({ endpoint, headers, params, data }: mutateType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			const computedData = this.serializeData(data);
			const response = await Superagent.put(computedUrl).set(computedHeaders).query(params).send(computedData);
			return this.normalizeData(response);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}

	async delete({ endpoint, headers, params }: queryType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			const response = await Superagent.delete(computedUrl).set(computedHeaders).query(params);
			return this.normalizeData(response);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}
}

export { SuperagentService };

// https://github.com/ladjs/superagent
