import { PlaysDemoCommand } from 'src/commands/plays/demo';
import { PlaysDeployCommand } from 'src/commands/plays/deploy';
import { PlaysDetailCommand } from 'src/commands/plays/detail';
import { PlaysListCommand } from 'src/commands/plays/list';

export const PlaysCommand = async (uuid, action, options: any) => {
	if (action === 'deploy') return await PlaysDeployCommand(uuid, options);
	if (action === 'demo') return await PlaysDemoCommand(uuid, options);
	if (uuid) return await PlaysDetailCommand(uuid, options);
	return await PlaysListCommand(options);
};
