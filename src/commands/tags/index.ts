import { TagsDetailCommand } from 'src/commands/tags/detail';
import { TagsListCommand } from 'src/commands/tags/list';
import { TagsOpenCommand } from 'src/commands/tags/open';
import { TagsPlaysCommand } from 'src/commands/tags/plays';

export const TagsCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await TagsOpenCommand(uuid, options);
	if (action === 'plays') return await TagsPlaysCommand(uuid, options);
	if (uuid) return await TagsDetailCommand(uuid, options);
	return await TagsListCommand(options);
};
