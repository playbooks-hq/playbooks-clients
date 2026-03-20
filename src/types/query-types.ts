export type queryType = {
	endpoint: string;
	headers?: any;
	params?: any;
};

export type sseEventType = {
	event: string | null;
	data: unknown;
	rawData: string;
	id?: string;
	retry?: number;
};

export type streamQueryType = queryType & {
	signal?: AbortSignal;
	onOpen?: () => void;
	onEvent: (event: sseEventType) => void;
};

export type mutateType = {
	endpoint: string;
	headers?: any;
	params?: any;
	data: any;
};
