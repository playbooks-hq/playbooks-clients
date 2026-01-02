import { formatUUID } from '@playbooks/utils/helpers';
export { formatUUID, isArray, sleep } from '@playbooks/utils/helpers';

export const testAndFormatUUID = uuid => {
	const url = /(http(s?)):\/\//i.test(uuid);
	if (url) {
		const endpoint = uuid.split('//')[1];
		return formatUUID(endpoint);
	}
	return uuid;
};
