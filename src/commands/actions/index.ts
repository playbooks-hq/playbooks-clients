import { AddCommand } from 'src/commands/actions/add';
import { CloneCommand } from 'src/commands/actions/clone';
import { DownloadCommand } from 'src/commands/actions/download';

export const ActionsCommand = async (action, entity, options: any) => {
	if (action === 'clone') return await CloneCommand(entity, options);
	if (action === 'download') return await DownloadCommand(entity, options);
	return await AddCommand(entity, options);
};

export * from 'src/commands/actions/add';
export * from 'src/commands/actions/clone';
export * from 'src/commands/actions/download';
