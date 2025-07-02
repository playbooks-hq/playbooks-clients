export const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const isArray = data => {
	return Array.isArray(data);
};

export const isObject = data => {
	return data !== null && data && typeof data === 'object';
};

export const isEmpty = data => {
	if (data === null || data === undefined || data === 'undefined') {
		return true;
	}
	if (isArray(data)) {
		return data.length === 0 ? true : false;
	}
	if (isObject(data)) {
		return Object.keys(data).length === 0 ? true : false;
	}
	return data.length === 0 ? true : false;
};

// Docs
// https://fakerjs.dev/guide/
// https://www.npmjs.com/package/pluralize
