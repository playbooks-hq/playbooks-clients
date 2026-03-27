import { PlatformsDetailCommand } from 'src/commands/platforms/detail';
import { PlatformsListCommand } from 'src/commands/platforms/list';
import { PlatformsOpenCommand } from 'src/commands/platforms/open';
import { PlatformsPlaysCommand } from 'src/commands/platforms/plays';

export const PlatformsCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await PlatformsOpenCommand(uuid, options);
	if (action === 'plays') return await PlatformsPlaysCommand(uuid, options);
	if (uuid) return await PlatformsDetailCommand(uuid, options);
	return await PlatformsListCommand(options);
};
