/** Keep resource objects out of the terminal contract. */
export const sdkEnvelope = (data: unknown): any => ({ data: JSON.parse(JSON.stringify(data)) });
export const sdkList = (response: unknown): any => {
	const result = JSON.parse(JSON.stringify(response));
	return result;
};
