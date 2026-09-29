export const serializeAttrs = (data: any = {}, attrs: string[] = []): any => {
	if (!attrs.length || attrs.includes('*')) return data;
	if (Array.isArray(data)) return data.map(item => serializeAttrs(item, attrs));
	if (data === null || typeof data !== 'object') return data;
	return Object.fromEntries(
		Object.entries(data).flatMap(([key, value]) => {
			if (attrs.includes(key)) return [[key, value]];
			const children = attrs.filter(field => field.startsWith(`${key}.`)).map(field => field.slice(key.length + 1));
			return children.length ? [[key, serializeAttrs(value, children)]] : [];
		}),
	);
};
export const serialize = serializeAttrs;
export const serializeArray = (data = [], attrs = []) => data.map(item => serializeAttrs(item, attrs));
