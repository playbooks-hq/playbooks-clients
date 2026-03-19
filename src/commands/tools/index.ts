export * from 'src/commands/tools/list';
export * from 'src/commands/tools/detail';

import { ToolsDetailCommand } from 'src/commands/tools/detail';
import { ToolsListCommand } from 'src/commands/tools/list';

export const ToolsCommand = async (uuid, options: any) => {
	if (uuid) return await ToolsDetailCommand(uuid, options);
	return await ToolsListCommand(options);
};
