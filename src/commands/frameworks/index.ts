import { FrameworksDetailCommand } from 'src/commands/frameworks/detail';
import { FrameworksListCommand } from 'src/commands/frameworks/list';
import { FrameworksOpenCommand } from 'src/commands/frameworks/open';
import { FrameworksPlaysCommand } from 'src/commands/frameworks/plays';

export const FrameworksCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await FrameworksOpenCommand(uuid, options);
	if (action === 'plays') return await FrameworksPlaysCommand(uuid, options);
	if (uuid) return await FrameworksDetailCommand(uuid, options);
	return await FrameworksListCommand(options);
};
