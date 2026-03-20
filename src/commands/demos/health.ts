import { streamDemoCommand } from 'src/commands/demos/stream';

export const DemosHealthCommand = async (subdomain, options: any) => {
	return await streamDemoCommand({
		endpoint: `/demos/${subdomain}/health`,
		subdomain,
		options,
		spinnerText: `Checking ${subdomain} health...`,
	});
};
