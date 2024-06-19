import Superagent from 'superagent';

class SuperagentService {
	/* ----- Computes ----- */
	static get headers() {
		return { accept: 'application/json' };
	}

	static computeHeaders(headers = {}) {
		return { ...this.headers, ...headers };
	}

	/* ----- Methods ----- */
	static async query({ url, headers, params }) {
		const computedHeaders = this.computeHeaders(headers);
		const response = await Superagent.get(url).set(computedHeaders).query(params);
		return { status: response.status, data: JSON.parse(response.text) };
	}

	static async queryRecord({ url, headers, params }) {
		const computedHeaders = this.computeHeaders(headers);
		const response = await Superagent.get(url).set(computedHeaders).query(params);
		return { status: response.status, data: JSON.parse(response.text) };
	}

	static async post({ url, headers, params, data }) {
		const computedHeaders = this.computeHeaders(headers);
		const response = await Superagent.post(url).set(computedHeaders).query(params).send(data);
		return { status: response.status, data: JSON.parse(response.text) };
	}

	static async update({ url, headers, params, data }) {
		const computedHeaders = this.computeHeaders(headers);
		const response = await Superagent.put(url).set(computedHeaders).query(params).send(data);
		return { status: response.status, data: JSON.parse(response.text) };
	}

	static async delete({ url, headers, params }) {
		const computedHeaders = this.computeHeaders(headers);
		const response = await Superagent.delete(url).set(computedHeaders).query(params);
		return { status: response.status, data: JSON.parse(response.text) };
	}
}

export { SuperagentService };

// https://github.com/ladjs/superagent
