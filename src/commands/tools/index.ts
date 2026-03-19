import { ToolsDetailCommand } from 'src/commands/tools/detail';
import { ToolsListCommand } from 'src/commands/tools/list';
import { ToolsPlaysCommand } from 'src/commands/tools/plays';

export const ToolsCommand = async (uuid, action, options: any) => {
	if (action === 'plays') return await ToolsPlaysCommand(uuid, options);
	if (uuid) return await ToolsDetailCommand(uuid, options);
	return await ToolsListCommand(options);
};
