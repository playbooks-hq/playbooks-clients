export const camelToDash = (data = '') => {
	return data.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

export const dashToCamel = (data = '') => {
	return data.replace(/-([a-z])/g, g => g[1].toUpperCase());
};
