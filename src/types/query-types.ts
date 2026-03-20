export type queryType = {
	endpoint: string;
	headers?: any;
	params?: any;
};

export type mutateType = {
	endpoint: string;
	headers?: any;
	params?: any;
	data: any;
};
