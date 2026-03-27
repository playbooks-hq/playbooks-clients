import { CollectionsDetailCommand } from 'src/commands/collections/detail';
import { CollectionsListCommand } from 'src/commands/collections/list';
import { CollectionsOpenCommand } from 'src/commands/collections/open';
import { CollectionsPlaysCommand } from 'src/commands/collections/plays';

export const CollectionsCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await CollectionsOpenCommand(uuid, options);
	if (action === 'plays') return await CollectionsPlaysCommand(uuid, options);
	if (uuid) return await CollectionsDetailCommand(uuid, options);
	return await CollectionsListCommand(options);
};
