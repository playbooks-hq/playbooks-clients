export * from 'src/commands/tags/list';
export * from 'src/commands/tags/detail';

import { TagsDetailCommand } from 'src/commands/tags/detail';
import { TagsListCommand } from 'src/commands/tags/list';

export const TagsCommand = async (uuid, options: any) => {
	if (uuid) return await TagsDetailCommand(uuid, options);
	return await TagsListCommand(options);
};
