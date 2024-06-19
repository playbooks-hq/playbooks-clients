import { isArray, isObject } from 'src/utils/helpers';
import { camelToDash } from 'src/utils/transforms';

export const attrs = {
	type: { normalize: false, serialize: false },
	updatedAt: { serialize: false },
	createdAt: { serialize: false },
};

export const relationships = {};

// Methods
export const checkAttrs = key => {
	const keys = Object.keys(attrs);
	return keys.includes(key) ? attrs[key] : {};
};

export const checkRelationships = key => {
	const keys = Object.keys(relationships);
	return keys.includes(key) ? relationships[key] : {};
};

// serialize
export const serializeArray = (data = []) => {
	const serializedData = [];
	data.map(d => serializedData.push(serializeAttrs(d)));
	return { data: { attributes: serializedData } };
};

export const serialize = (data = {}) => {
	const serializedData = serializeAttrs(data);
	return { data: { attributes: serializedData } };
};

export const serializeAttrs = (data = {}) => {
	const serializedAttrs = {};
	Object.keys(data).map(key => {
		if (checkAttrs(key).serialize === false) return;
		if (isArray(data[key]) && isObject(data[key][0])) {
			return (serializedAttrs[camelToDash(key)] = data[key].map(serializeAttrs));
		}
		if (isArray(data[key])) {
			return (serializedAttrs[camelToDash(key)] = data[key]);
		}
		if (isObject(data[key])) {
			return (serializedAttrs[camelToDash(key)] = serializeAttrs(data[key]));
		}
		return (serializedAttrs[camelToDash(key)] = data[key]);
	});
	return serializedAttrs;
};

// Docs
// https://jsonapi-resources.com/
