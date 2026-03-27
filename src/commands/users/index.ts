import { UsersDetailCommand } from 'src/commands/users/detail';
import { UsersListCommand } from 'src/commands/users/list';
import { UsersOpenCommand } from 'src/commands/users/open';
import { UsersPlaysCommand } from 'src/commands/users/plays';

export const UsersCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await UsersOpenCommand(uuid, options);
	if (action === 'plays') return await UsersPlaysCommand(uuid, options);
	if (uuid) return await UsersDetailCommand(uuid, options);
	return await UsersListCommand(options);
};
