import { ConfigCommand } from 'src/commands/utils/config';
import { PingCommand } from 'src/commands/utils/ping';
import { SessionCommand } from 'src/commands/utils/session';
import { ToggleCommand } from 'src/commands/utils/toggle';

export const UtilsCommand = async (action, options: any) => {
	if (action === 'ping') return await PingCommand(options);
	if (action === 'session') return await SessionCommand(options);
	if (action === 'toggle') return await ToggleCommand(options);
	return await ConfigCommand(options);
};

export * from 'src/commands/utils/config';
export * from 'src/commands/utils/ping';
export * from 'src/commands/utils/session';
export * from 'src/commands/utils/toggle';
