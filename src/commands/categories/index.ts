import { CategoriesDetailCommand } from 'src/commands/categories/detail';
import { CategoriesListCommand } from 'src/commands/categories/list';
import { CategoriesOpenCommand } from 'src/commands/categories/open';
import { CategoriesTemplatesCommand } from 'src/commands/categories/templates';

export const CategoriesCommand = async (uuid, action, options: any) => {
	if (action === 'open') return await CategoriesOpenCommand(uuid, options);
	if (action === 'templates') return await CategoriesTemplatesCommand(uuid, options);
	if (uuid) return await CategoriesDetailCommand(uuid, options);
	return await CategoriesListCommand(options);
};
