export const secretMetadata = (value: any): any =>
	Array.isArray(value)
		? value.map(secretMetadata)
		: value && typeof value === 'object'
			? Object.fromEntries(
					Object.entries(value)
						.filter(([key]) => key !== 'value')
						.map(([key, item]) => [key, secretMetadata(item)]),
				)
			: value;
