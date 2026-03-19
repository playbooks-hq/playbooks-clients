import { LanguagesDetailCommand } from 'src/commands/languages/detail';
import { LanguagesListCommand } from 'src/commands/languages/list';
import { LanguagesPlaysCommand } from 'src/commands/languages/plays';

export const LanguagesCommand = async (uuid, action, options: any) => {
	if (action === 'plays') return await LanguagesPlaysCommand(uuid, options);
	if (uuid) return await LanguagesDetailCommand(uuid, options);
	return await LanguagesListCommand(options);
};
