import { streamDemoCommand } from 'src/commands/demos/stream';

export const DemosLogsCommand = async (subdomain, options: any) => {
	return await streamDemoCommand({
		endpoint: `/demos/${subdomain}/logs`,
		subdomain,
		options,
		spinnerText: `Fetching ${subdomain} logs...`,
	});
};
