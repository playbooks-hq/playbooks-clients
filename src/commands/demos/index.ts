import { DemosDeployCommand } from 'src/commands/demos/deploy';
import { DemosDetailCommand } from 'src/commands/demos/detail';

export const DemosCommand = async (uuid, action, options: any) => {
	if (action === 'deploy') return await DemosDeployCommand(uuid, options);
	return await DemosDetailCommand(uuid, options);
};
