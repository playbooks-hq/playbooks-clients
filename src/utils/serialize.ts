import { isArray, isEmpty, isObject } from 'src/utils/helpers';

export const serializeArray = (data = [], attrs = []) => {
	const serializedData = [];
	data.map(record => serializedData.push(serializeAttrs(record, attrs)));
	return serializedData;
};

export const serialize = (data = {}, attrs = []) => {
	const serializedData = {};
	Object.assign(serializedData, serializeAttrs(data, attrs));
	return serializedData;
};

export const serializeAttrs = (data = {}, attrs = []) => {
	const serializedData = {};
	Object.keys(data).map(key => {
		if (attrs.length === 0) return (serializedData[key] = data[key]);
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
			return (serializedData[key] = arrayData.map(v => serializeAttrs(v, formattedAttrs)));
		}
		if (isArray(data[key])) {
			if (isEmpty(data[key])) return;
			if (!attrs.includes(key)) return;
			return (serializedData[key] = data[key]);
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
			return (serializedData[key] = serializeAttrs(objectData, formattedAttrs));
		}
		if (attrs.includes(key)) return (serializedData[key] = data[key]);
	});
	return serializedData;
};
