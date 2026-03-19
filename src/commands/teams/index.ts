import { TeamsDetailCommand } from 'src/commands/teams/detail';
import { TeamsListCommand } from 'src/commands/teams/list';
import { TeamsPlaysCommand } from 'src/commands/teams/plays';

export const TeamsCommand = async (uuid, action, options: any) => {
	if (action === 'plays') return await TeamsPlaysCommand(uuid, options);
	if (uuid) return await TeamsDetailCommand(uuid, options);
	return await TeamsListCommand(options);
};
