import { CollectionsDetailCommand } from 'src/commands/collections/detail';
import { CollectionsListCommand } from 'src/commands/collections/list';
import { CollectionsPlaysCommand } from 'src/commands/collections/plays';

export const CollectionsCommand = async (uuid, action, options: any) => {
	if (action === 'plays') return await CollectionsPlaysCommand(uuid, options);
	if (uuid) return await CollectionsDetailCommand(uuid, options);
	return await CollectionsListCommand(options);
};
