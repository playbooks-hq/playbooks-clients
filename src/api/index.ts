import { isArray, isEmpty, isObject } from '@playbooks/utils/helpers';
import { camelToDash, camelToUnderscore, dashToCamel } from '@playbooks/utils/transforms';

const formatLookup = type => {
	switch (type) {
		case 'camel':
			return dashToCamel;
		case 'dash':
			return camelToDash;
		case 'underscore':
			return camelToUnderscore;
		default:
			return value => value;
	}
};

export const serializeArray = (data = [], attrs = [], type = 'dash') => {
	const serializedData = [];
	data.map(record => serializedData.push(serializeAttrs(record, attrs, type)));
	return serializedData;
};

export const serialize = (data = {}, attrs = [], type = 'dash') => {
	const serializedData = {};
	Object.assign(serializedData, serializeAttrs(data, attrs, type));
	return serializedData;
};

export const serializeAttrs = (data = {}, attrs = [], type = 'dash') => {
	const formatter = formatLookup(type);
	const serializedData = {};
	Object.keys(data).map(key => {
		if (attrs.length === 0) return (serializedData[formatter(key)] = data[key]);
		if (isArray(data[key]) && isObject(data[key][0])) {
			const arrayData = data[key];
			const arrayAttrs = attrs
				.filter(v => v.split('.')[0] === key)
				.map(v => {
					const paths = v.split('.');
					paths.shift();
					return paths.join('.');
				});
			const formattedAttrs = !isEmpty(arrayAttrs[0]) ? arrayAttrs : [];
			if (!attrs.includes(key) && isEmpty(arrayAttrs)) return;
			return (serializedData[formatter(key)] = arrayData.map(v => serializeAttrs(v, formattedAttrs, type)));
		}
		if (isArray(data[key])) {
			if (isEmpty(data[key])) return;
			if (!attrs.includes(key)) return;
			return (serializedData[formatter(key)] = data[key]);
		}
		if (isObject(data[key]) && data[key] !== null) {
			const objectData = data[key];
			const objectAttrs = attrs.filter(v => v.split('.')[0] === key);
			const formattedAttrs = objectAttrs
				.filter(v => v.includes('.'))
				.map(v => {
					const paths = v.split('.');
					paths.shift();
					return paths.join('.');
				});
			if (isEmpty(objectAttrs)) return;
			return (serializedData[formatter(key)] = serializeAttrs(objectData, formattedAttrs, type));
		}
		if (attrs.includes(key)) return (serializedData[formatter(key)] = data[key]);
	});
	return serializedData;
};
