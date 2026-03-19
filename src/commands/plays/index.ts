import { PlayDemoCommand } from 'src/commands/plays/demo';
import { PlaysDetailCommand } from 'src/commands/plays/detail';
import { PlaysListCommand } from 'src/commands/plays/list';

export const PlaysCommand = async (uuid, action, options: any) => {
	if (action === 'demo') return await PlayDemoCommand(uuid, options);
	if (uuid) return await PlaysDetailCommand(uuid, options);
	return await PlaysListCommand(options);
};
