import { isArray, isObject } from 'src/utils';
import { camelToDash, dashToCamel } from 'src/utils';

// Helpers
const formatLookup = type => {
	switch (type) {
		case 'dash':
			return camelToDash;
		case 'camelcase':
			return dashToCamel;
	}
};

// normalize
export const normalizeArray = (data = [], included = [], meta = {}) => {
	const normalizedArray = { data: [], meta: {} };
	data.map(v => normalizedArray.data.push(normalizeAttrs(v, included)));
	normalizedArray.meta = normalizeMeta(meta);
	return normalizedArray;
};

export const normalize = (data, attrs = []) => {
	const normalizedData = { data: {} };
	Object.assign(normalizedData.data, normalizeAttrs(data, attrs));
	// log('normalizedData: ', normalizedData);
	return normalizedData;
};

export const normalizeMeta = meta => {
	const normalizedMeta = {};
	Object.keys(meta).map(key => {
		normalizedMeta[dashToCamel(key)] = parseInt(meta[key]);
	});
	return normalizedMeta;
};

export const normalizeAttrs = (data, attrs = []) => {
	const normalizedAttrs = {};
	Object.keys(data).map(key => {
		if (attrs.includes(key)) return;
		if (isArray(data[key])) {
			return (normalizedAttrs[dashToCamel(key)] = data[key].map(v => normalizeAttrs(v, attrs)));
		}
		if (isObject(data[key])) {
			return (normalizedAttrs[dashToCamel(key)] = normalizeAttrs(data[key], attrs));
		}
		return (normalizedAttrs[dashToCamel(key)] = data[key]);
	});
	return normalizedAttrs;
};

export const normalizeAttr = (data, key) => {
	return { [dashToCamel(key)]: data[key] };
};
