export * from 'src/commands/users/list';
export * from 'src/commands/users/detail';

import { UsersDetailCommand } from 'src/commands/users/detail';
import { UsersListCommand } from 'src/commands/users/list';

export const UsersCommand = async (uuid, options: any) => {
	if (uuid) return await UsersDetailCommand(uuid, options);
	return await UsersListCommand(options);
};
