const Fs = require('fs-extra');
const Superagent = require('superagent');
import { jsonApiNormalize, jsonApiNormalizeArray, jsonApiSerialize, jsonApiSerializeArray } from 'src/api';
import { queryType, mutateType } from 'src/types';
import * as Logger from 'src/utils/logger';

const MODE = import.meta.env.MODE;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const VITE_SSL_KEY_FILE = import.meta.env.VITE_SSL_KEY_FILE;
const VITE_SSL_CERT_FILE = import.meta.env.VITE_SSL_CERT_FILE;

if (MODE === 'development') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface ApiService {
	account?: string;
	accountType?: string;
	token?: string;
}

class ApiService {
	constructor(props?) {
		this.account = props?.account || '';
		this.accountType = props?.accountType || '';
		this.token = props?.token || '';
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

	/* ----- Auth ----- */
	authUrl(endpoint) {
		const baseUrl = this.accountType === 'Team' ? `/session/teams/${this.account}` : `/session`;
		return baseUrl + endpoint;
	}

	authHeaders(headers?) {
		return {
			account: this.account || null,
			accountType: this.accountType || null,
			Authorization: this.token || null,
			...headers,
		};
	}

	/* ----- Serializers ----- */
	serializeArray(data) {
		const formattedData = jsonApiSerializeArray(data);
		// Logger.log(`serializedArray: `, formattedData);
		return formattedData;
	}

	serializeData(data) {
		const formattedData = jsonApiSerialize(data);
		// Logger.log(`serializedData: `, formattedData);
		return formattedData;
	}

	serializeParams(params) {
		const formattedParams = {};
		Object.keys(params || {})
			.filter(key => params[key])
			.map(key => (formattedParams[key] = params[key]));
		// Logger.log(`serializedParams: `, formattedParams);
		return formattedParams;
	}

	normalizeArray(response) {
		const format = JSON.parse(response.text);
		const formattedResponse = jsonApiNormalizeArray(format.data, format.included, format.meta);
		// Logger.log(`normalizedArray: `, formattedResponse);
		return formattedResponse;
	}

	normalizeData(response) {
		const format = JSON.parse(response.text);
		const formattedResponse = jsonApiNormalize(format.data, format.included);
		// Logger.log(`normalizedData: `, formattedResponse);
		return formattedResponse;
	}

	normalizeError(e) {
		if (e.response?.text) {
			const data = JSON.parse(e.response.text);
			const error = data.errors[0];
			const { status, title, message, framework } = error;
			Logger.error('API Error: ', { status, title, message, framework: MODE === 'production' ? framework : '' });
		} else {
			Logger.error('CLI Error: ', e);
		}
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

	async download({ endpoint, headers }: queryType) {
		try {
			const computedUrl = this.computeURL(endpoint);
			const computedHeaders = this.computeHeaders(headers);
			return await Superagent.get(computedUrl).set(computedHeaders);
		} catch (e) {
			await this.normalizeError(e);
			throw new Error('API Error!');
		}
	}
}

export { ApiService };

// https://github.com/ladjs/superagent
