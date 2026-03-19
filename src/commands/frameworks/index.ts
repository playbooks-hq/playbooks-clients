export * from 'src/commands/frameworks/list';
export * from 'src/commands/frameworks/detail';

import { FrameworksDetailCommand } from 'src/commands/frameworks/detail';
import { FrameworksListCommand } from 'src/commands/frameworks/list';

export const FrameworksCommand = async (uuid, options: any) => {
	if (uuid) return await FrameworksDetailCommand(uuid, options);
	return await FrameworksListCommand(options);
};
