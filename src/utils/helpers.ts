import { formatUUID } from '@playbooks/utils/helpers';
export { formatUUID, isArray, sleep } from '@playbooks/utils/helpers';

export const testAndFormatUUID = uuid => {
	return /(http(s?)):\/\//i.test(uuid) ? formatUUID(uuid) : uuid;
};
