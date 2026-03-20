import { jsonApiNormalize, jsonApiNormalizeArray, jsonApiSerialize, jsonApiSerializeArray } from 'src/api';
import { mutateType, queryType } from 'src/types';
import { isArray } from 'src/utils';
import { logger } from 'src/utils/logger';
import Superagent from 'superagent';

import { name, version } from '../../package.json';

const MODE = import.meta.env.MODE;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const CLI_DOMAIN = import.meta.env.VITE_CLI_DOMAIN;
const VITE_SSL_KEY_FILE = import.meta.env.VITE_SSL_KEY_FILE;
const VITE_SSL_CERT_FILE = import.meta.env.VITE_SSL_CERT_FILE;

if (MODE === 'development') process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface ApiService {
	account?: string;
	accountType?: string;
	token?: string;
}

class ApiService {
	constructor(props) {
		this.account = props?.account || '';
		this.token = props?.token || '';
	}

	/* ----- Variables ----- */
	get headers() {
		return {
			accept: 'application/json',
			['Content-Type']: 'application/json',
			origin: CLI_DOMAIN,
			client: `${name}@${version}`,
		};
	}

	/* ----- Computes ----- */
	formatURL(endpoint = '') {
		return BASE_URL + endpoint;
	}

	formatHeaders(headers = {}) {
		return { ...this.headers, ...headers };
	}

	/* ----- Auth ----- */
	authHeaders(headers?) {
		const formattedHeaders = {};
		if (this.account) formattedHeaders['account'] = this.account;
		if (this.token) formattedHeaders['authorization'] = this.token;
		if (headers) Object.assign(formattedHeaders, headers);
		return formattedHeaders;
	}

	/* ----- Serializers ----- */
	serializeArray(data) {
		const formattedData = jsonApiSerializeArray(data);
		// logger.log(`serializedArray: `, formattedData);
		return formattedData;
	}

	serializeData(data) {
		const formattedData = jsonApiSerialize(data);
		// logger.log(`serializedData: `, formattedData);
		return formattedData;
	}

	serializeParams(params) {
		const formattedParams = {};
		Object.keys(params || {})
			.filter(key => params[key])
			.map(key => (formattedParams[key] = params[key]));
		// logger.log(`serializedParams: `, formattedParams);
		return formattedParams;
	}

	normalizeArray(response) {
		const format = JSON.parse(response.text);
		const formattedResponse = jsonApiNormalizeArray(format.data, format.included, format.meta);
		// logger.log(`normalizedArray: `, formattedResponse);
		return formattedResponse;
	}

	normalizeData(response) {
		const format = JSON.parse(response.text);
		const formattedResponse = jsonApiNormalize(format.data, format.included);
		// logger.log(`normalizedData: `, formattedResponse);
		return formattedResponse;
	}

	/* ----- Methods ----- */
	async query({ endpoint, headers, params = {} }: queryType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		logger.log(`query: `, { url: formattedUrl, params });
		const response = await Superagent.get(formattedUrl).set(formattedHeaders).query(params);
		return this.normalizeArray(response);
	}

	async queryRecord({ endpoint, headers, params }: queryType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		logger.log(`queryRecord: `, { url: formattedUrl, params });
		const response = await Superagent.get(formattedUrl).set(formattedHeaders).query(params);
		return this.normalizeData(response);
	}

	async post({ endpoint, headers, params, data }: mutateType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		const formatdData = isArray(data) ? this.serializeArray(data) : this.serializeData(data);
		logger.log(`post: `, { url: formattedUrl, params, data: formatdData });
		const response = await Superagent.post(formattedUrl).set(formattedHeaders).query(params).send(formatdData);
		return this.normalizeData(response);
	}

	async update({ endpoint, headers, params, data }: mutateType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		const formatdData = isArray(data) ? this.serializeArray(data) : this.serializeData(data);
		logger.log(`update: `, { url: formattedUrl, params, data: formatdData });
		const response = await Superagent.put(formattedUrl).set(formattedHeaders).query(params).send(formatdData);
		return this.normalizeData(response);
	}

	async delete({ endpoint, headers, params }: queryType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		logger.log(`delete: `, { url: formattedUrl, params });
		const response = await Superagent.delete(formattedUrl).set(formattedHeaders).query(params);
		return this.normalizeData(response);
	}

	/* ----- Methods ----- */
	async request({ endpoint, headers, params }: queryType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		logger.log(`request: `, { url: formattedUrl, params });
		const response = await Superagent.get(formattedUrl).set(formattedHeaders).query(params);
		return { status: response.status, data: JSON.parse(response.text) };
	}

	async download({ endpoint, headers, params }: queryType) {
		const formattedUrl = this.formatURL(endpoint);
		const formattedHeaders = this.formatHeaders(headers);
		logger.log(`download: `, { url: formattedUrl, params });
		return await Superagent.get(formattedUrl).set(formattedHeaders).query(params);
	}
}

export { ApiService };

// https://github.com/ladjs/superagent
