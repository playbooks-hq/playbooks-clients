export * from 'src/commands/teams/list';
export * from 'src/commands/teams/detail';

import { TeamsDetailCommand } from 'src/commands/teams/detail';
import { TeamsListCommand } from 'src/commands/teams/list';

export const TeamsCommand = async (uuid, options: any) => {
	if (uuid) return await TeamsDetailCommand(uuid, options);
	return await TeamsListCommand(options);
};
