import { isArray, isObject } from 'src/utils/helpers';
import { dashToCamel } from 'src/utils/transforms';

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

// normalize
export const normalizeArray = (data = [], included = [], meta = {}): any => {
	const normalizedArray = { data: [], meta: {} };
	data.map(v => normalizedArray.data.push(normalizeAttrs(v, included)));
	normalizedArray.meta = normalizeMeta(meta);
	return normalizedArray;
};

export const normalize = (data = {}, included = []): any => {
	const normalizedData = { data: {} };
	normalizedData.data = normalizeAttrs(data, included);
	return normalizedData;
};

export const normalizeAttrs = (data = {}, included = []) => {
	const normalizedAttrs = {};
	Object.keys(data).map(key => {
		if (checkAttrs(key).normalize === false) return;
		switch (key) {
			case 'attributes':
				return Object.assign(normalizedAttrs, normalizeAttrs(data[key], included));

			case 'relationships':
				return Object.assign(normalizedAttrs, normalizeRelationships(data[key], included));

			default:
				return (normalizedAttrs[dashToCamel(key)] = data[key]);
		}
	});
	return normalizedAttrs;
};

export const normalizeRelationships = (data = [], included) => {
	const normalizedAttrs = {};

	Object.keys(data).map(key => {
		const relationshipData = data[key].data;

		if (isArray(relationshipData)) {
			return (normalizedAttrs[dashToCamel(key)] = relationshipData.map(v => normalizeRelationship(v, included)));
		}
		if (isObject(relationshipData)) {
			return (normalizedAttrs[dashToCamel(key)] = normalizeRelationship(relationshipData, included));
		}
	});
	return normalizedAttrs;
};

export const normalizeRelationship = (data, included = []) => {
	const relationship = included.find(v => v.type === data.type && v.id === data.id);
	return normalizeAttrs(relationship);
};

export const normalizeMeta = (meta = {}) => {
	const normalizedMeta = {};
	Object.keys(meta).map(key => (normalizedMeta[dashToCamel(key)] = parseInt(meta[key])));
	return normalizedMeta;
};

// Docs
// https://jsonapi-resources.com/
