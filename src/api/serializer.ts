import { isArray, isEmpty, isObject } from 'src/utils/helpers';
import { camelToDash, dashToCamel } from 'src/utils/transforms';

// Helpers
const formatLookup = type => {
	switch (type) {
		case 'dash':
			return camelToDash;
		case 'camelcase':
			return dashToCamel;
	}
};

// serialize
export const serializeArray = (data = [], attrs = []): any[] => {
	const serializedData = [];
	data.map(v => serializedData.push(serializeAttrs({ data: v, attrs })));
	return serializedData;
};

export const serialize = (data = {}, attrs = []): any => {
	const serializedData = {};
	Object.assign(serializedData, serializeAttrs({ data, attrs }));
	return serializedData;
};

export const serializeAttrs = ({ type = 'dash', data = {}, attrs = [] }) => {
	const formatter = formatLookup(type);
	const serializedData = {};

	Object.keys(data).map(key => {
		if (attrs.length === 0) return (serializedData[formatter(key)] = data[key]);
		if (isArray(data[key]) && isObject(data[key][0])) {
			const arrayData = data[key];
			const arrayAttrs = attrs.filter(v => v.split('.')[0] === key).map(v => v.split('.')[1]);
			const formattedAttrs = !isEmpty(arrayAttrs[0]) ? arrayAttrs : [];
			if (!attrs.includes(key) && isEmpty(arrayAttrs)) return;
			return (serializedData[formatter(key)] = arrayData.map(data => serializeAttrs({ data, attrs: formattedAttrs })));
		}
		if (isArray(data[key])) {
			if (isEmpty(data[key])) return;
			return (serializedData[formatter(key)] = data[key]);
		}
		if (isObject(data[key])) {
			const objectData = data[key];
			const objectAttrs = attrs.filter(v => v.split('.')[0] === key);
			const formattedAttrs = objectAttrs.filter(v => v.includes('.')).map(v => v.split('.')[1]);
			if (isEmpty(objectAttrs)) return;
			return (serializedData[camelToDash(key)] = serializeAttrs({ data: objectData, attrs: formattedAttrs }));
		}
		if (attrs.includes(key)) return (serializedData[formatter(key)] = data[key]);
	});

	return serializedData;
};

// Docs
//
