import { TeamsDetailCommand } from 'src/commands/teams/detail';
import { TeamsListCommand } from 'src/commands/teams/list';
import { TeamsOpenCommand } from 'src/commands/teams/open';
import { TeamsPlaysCommand } from 'src/commands/teams/plays';

export const TeamsCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await TeamsOpenCommand(uuid, options);
	if (action === 'plays') return await TeamsPlaysCommand(uuid, options);
	if (uuid) return await TeamsDetailCommand(uuid, options);
	return await TeamsListCommand(options);
};
