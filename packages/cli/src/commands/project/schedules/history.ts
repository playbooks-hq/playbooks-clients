import { projectContext } from 'src/services/command-context';
import { identifier, listParams } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

export const listScheduleRuns = async (options: any) => {
	const context = await projectContext(options);
	return sdkList(
		await context.projectResource.schedules.runs(
			identifier(options.schedule),
			listParams(options, { pageSizeMax: 100 }),
		),
	);
};
export const listScheduleOccurrences = async (options: any) => {
	const context = await projectContext(options);
	return sdkList(
		await context.projectResource.schedules.occurrences(
			identifier(options.schedule),
			listParams(options, { pageSizeMax: 100 }),
		),
	);
};
export const getScheduleRun = async (options: any) => {
	const context = await projectContext(options);
	return sdkEnvelope(
		await context.projectResource.schedules.getRun(identifier(options.schedule), identifier(options.run)),
	);
};
