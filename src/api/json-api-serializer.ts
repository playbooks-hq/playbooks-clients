import { isArray, isObject } from 'src/utils';
import { camelToDash } from 'src/utils';

// serialize
export const jsonApiSerializeArray = (data = []) => {
	const serializedData = [];
	data.map(d => serializedData.push(jsonApiSerializeAttrs(d)));
	return { data: { attributes: serializedData } };
};

export const jsonApiSerialize = (data = {}) => {
	const serializedData = jsonApiSerializeAttrs(data);
	return { data: { attributes: serializedData } };
};

export const jsonApiSerializeAttrs = (data = {}) => {
	const serializedAttrs = {};
	Object.keys(data).map(key => {
		if (isArray(data[key]) && isObject(data[key][0])) {
			return (serializedAttrs[camelToDash(key)] = data[key].map(jsonApiSerializeAttrs));
		}
		if (isArray(data[key])) {
			return (serializedAttrs[camelToDash(key)] = data[key]);
		}
		if (isObject(data[key])) {
			return (serializedAttrs[camelToDash(key)] = jsonApiSerializeAttrs(data[key]));
		}
		return (serializedAttrs[camelToDash(key)] = data[key]);
	});
	return serializedAttrs;
};

// Docs
// https://jsonapi-resources.com/
