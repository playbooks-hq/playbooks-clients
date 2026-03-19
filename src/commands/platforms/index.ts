export * from 'src/commands/platforms/list';
export * from 'src/commands/platforms/detail';

import { PlatformsDetailCommand } from 'src/commands/platforms/detail';
import { PlatformsListCommand } from 'src/commands/platforms/list';

export const PlatformsCommand = async (uuid, options: any) => {
	if (uuid) return await PlatformsDetailCommand(uuid, options);
	return await PlatformsListCommand(options);
};
