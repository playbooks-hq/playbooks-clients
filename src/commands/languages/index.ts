export * from 'src/commands/languages/list';
export * from 'src/commands/languages/detail';

import { LanguagesDetailCommand } from 'src/commands/languages/detail';
import { LanguagesListCommand } from 'src/commands/languages/list';

export const LanguagesCommand = async (uuid, options: any) => {
	if (uuid) return await LanguagesDetailCommand(uuid, options);
	return await LanguagesListCommand(options);
};
