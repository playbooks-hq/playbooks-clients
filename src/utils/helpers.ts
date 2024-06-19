export const timeout = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const isArray = data => {
	return Array.isArray(data);
};

export const isObject = data => {
	return data !== null && data && typeof data === 'object';
};

// Docs
// https://fakerjs.dev/guide/
// https://www.npmjs.com/package/pluralize
