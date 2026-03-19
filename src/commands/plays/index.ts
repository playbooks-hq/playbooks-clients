import { PlaysDetailCommand } from 'src/commands/plays/detail';
import { PlaysListCommand } from 'src/commands/plays/list';

export const PlaysCommand = async (uuid, options: any) => {
	if (uuid) return await PlaysDetailCommand(uuid, options);
	return await PlaysListCommand(options);
};
