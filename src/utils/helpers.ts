export const sleep = ms => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

export const formatUUID = (url, index = 2) => {
	const paths = url.split('?')[0].split('#')[0].split('/');
	const name = paths[index];
	return name?.toLowerCase();
};

export const isArray = data => {
	return Array.isArray(data);
};

export const isDate = data => {
	return isObject(data) && typeof data.getMonth === 'function';
};

export const isObject = data => {
	return data !== null && data && typeof data === 'object';
};

export const isEmpty = data => {
	if (data === null || data === undefined || data === 'undefined') return true;
	if (isArray(data)) return data.length === 0;
	if (isDate(data)) return true;
	if (isObject(data)) return Object.keys(data).length === 0;
	return data.length === 0;
};

export const testAndFormatUUID = uuid => {
	const url = /(http(s?)):\/\//i.test(uuid);
	if (url) {
		const endpoint = uuid.split('//')[1];
		return formatUUID(endpoint);
	}
	return uuid;
};
