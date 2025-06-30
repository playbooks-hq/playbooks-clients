export const formatUUID = url => {
	const paths = url.split('?')[0].split('#')[0].split('/');
	const name = paths[paths.length - 1];
	return name?.toLowerCase();
};

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
