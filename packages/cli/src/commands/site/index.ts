import { CliError } from 'src/services/cli-client';
import { projectContext, workspaceContext } from 'src/services/command-context';
import { identifier, input, integerOption, listParams, textOption } from 'src/utils/cli-input';
import { sdkEnvelope, sdkList } from 'src/utils/sdk-output';

const siteContext = async (options: any) => {
	const context = await workspaceContext(options);
	return { ...context, site: await context.workspaceResource.sites.get(identifier(options.site, '--site')) };
};
const releaseFields = [
	'expectedSource',
	'sourceRevision',
	'componentKey',
	'expectedCurrentReleaseId',
	'expectedConfigRevision',
];
const confirmRelease = (options: any) => {
	if (!options.yes)
		throw new CliError(
			422,
			'Review the selected Site and preflight, then confirm with --yes. Deployment can incur usage charges.',
		);
};
export const listSites = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkList(await workspaceResource.sites.list(listParams(options)));
};
export const getSite = async (options: any) => sdkEnvelope((await siteContext(options)).site);
export const createSite = async (options: any) => {
	const { workspaceResource } = await workspaceContext(options);
	return sdkEnvelope(await workspaceResource.sites.create(await input(options, ['name', 'kind', 'source'])));
};
export const updateSite = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.update(await input(options, ['name'])));
export const getSource = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.sourceConnection.get());
export const connectSource = async (options: any) => {
	const data = await input(options, ['type', 'id', 'componentKey', 'expectedSource']);
	const { expectedSource, ...source } = data;
	return sdkEnvelope(await (await siteContext(options)).site.sourceConnection.connect(source, expectedSource));
};
export const disconnectSource = async (options: any) => {
	if (!options.yes)
		throw new CliError(
			422,
			'Confirm disconnecting this Site source with --yes. The live Site and retained releases remain available.',
		);
	return sdkEnvelope(
		await (
			await siteContext(options)
		).site.sourceConnection.disconnect((await input(options, ['expectedSource'])).expectedSource),
	);
};
export const preflightSite = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.preflight(await input(options, releaseFields)));
export const deploySite = async (options: any) => {
	confirmRelease(options);
	const { site } = await siteContext(options);
	const release = await site.releases.create(await input(options, [...releaseFields, 'requestId']));
	return sdkEnvelope(options.wait ? await site.releases.wait(identifier(release.uuid)) : release);
};
export const redeploySite = async (options: any) => {
	confirmRelease(options);
	const { site } = await siteContext(options);
	const release = await site.redeploy(
		await input(options, ['retainedReleaseId', 'expectedCurrentReleaseId', 'expectedConfigRevision', 'requestId']),
	);
	return sdkEnvelope(options.wait ? await site.releases.wait(identifier(release.uuid)) : release);
};
export const rollbackSite = async (options: any) => {
	confirmRelease(options);
	const { site } = await siteContext(options);
	const release = await site.rollback(await input(options, ['releaseId', 'expectedCurrentReleaseId']));
	return sdkEnvelope(options.wait ? await site.releases.wait(identifier(release.uuid)) : release);
};
export const listReleases = async (options: any) =>
	sdkList(await (await siteContext(options)).site.releases.list(listParams(options)));
export const getRelease = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.releases.get(identifier(options.release, '--release')));
export const projectSites = async (options: any) =>
	sdkList(await (await projectContext(options)).projectResource.sites.list());
export const agentSites = async (options: any) =>
	sdkList(await (await workspaceContext(options)).workspaceResource.agents.sites(identifier(options.agent, '--agent')));

export const releaseOptions = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.releaseOptions());

export const getConfig = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.config.get());
export const updateConfig = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.config.update(
			await input(options, [
				'provider',
				'region',
				'runtimeProfile',
				'runtimeUuid',
				'lifecycleUuid',
				'expectedConfigRevision',
			]),
		),
	);
export const getVisitorPolicy = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.visitorPolicy.get());
export const updateVisitorPolicy = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.visitorPolicy.update(await input(options, ['mode', 'expectedConfigRevision'])),
	);
export const listCredentials = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.credentials.list());
export const putCredential = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.credentials.put(identifier(options.key, '--key'), await input(options, ['value', 'expectedConfigRevision'])),
	);
export const deleteCredential = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm removing this Site credential with --yes.');
	return sdkEnvelope(
		await (
			await siteContext(options)
		).site.credentials.delete(identifier(options.key, '--key'), await input(options, ['expectedConfigRevision'])),
	);
};
export const listDomains = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.domains.list());
export const bindDomain = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.domains.bind(await input(options, ['domainId', 'hostname', 'primary'])),
	);
export const unbindDomain = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm removing this Site domain binding with --yes.');
	return sdkEnvelope(await (await siteContext(options)).site.domains.unbind(identifier(options.binding, '--binding')));
};
export const recheckDomain = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.domains.recheck(identifier(options.binding, '--binding')));
export const listCollaborators = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.collaborators.list());
export const putCollaborator = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.collaborators.put(await input(options, ['userId', 'role'])));
export const deleteCollaborator = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm removing this Site collaborator with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.collaborators.delete(identifier(options.collaborator, '--collaborator')),
	);
};
export const listInvitations = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.invitations.list());
export const createInvitation = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.invitations.create(await input(options, ['email', 'role'])));
export const resendInvitation = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.invitations.resend(identifier(options.invitation, '--invitation')),
	);
export const revokeInvitation = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm revoking this Site invitation with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.invitations.revoke(identifier(options.invitation, '--invitation')),
	);
};
export const listConnections = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.connections.list());
export const createConnection = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.connections.create(await input(options, ['connectorId', 'workspaceConnectorId', 'profile'])),
	);
export const updateConnection = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.connections.update(
			identifier(options.connection, '--connection'),
			await input(options, ['profile', 'status']),
		),
	);
export const deleteConnection = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm removing this Site connection with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.connections.delete(identifier(options.connection, '--connection')),
	);
};
export const getDatabase = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.database());
export const getStorage = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.storage());
export const listLogs = async (options: any) => {
	const params: Record<string, unknown> = {};
	if (options.release !== undefined) params.releaseId = identifier(options.release, '--release');
	if (options.query !== undefined) params.query = textOption(options.query, 'query');
	if (options.cursor !== undefined) params.cursor = textOption(options.cursor, 'cursor');
	if (options.after !== undefined) params.after = textOption(options.after, 'after');
	if (options['page-size'] !== undefined) params.pageSize = integerOption(options['page-size'], 'page-size', 1, 500);
	if (options.from !== undefined) params.from = textOption(options.from, 'from');
	if (options.to !== undefined) params.to = textOption(options.to, 'to');
	return sdkList(await (await siteContext(options)).site.logs(params));
};
export const getLog = async (options: any) => {
	const params = options.release === undefined ? {} : { releaseId: identifier(options.release, '--release') };
	return sdkEnvelope(await (await siteContext(options)).site.log(identifier(options.log, '--log'), params));
};
export const getMonitoring = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.monitoring());
export const getAnalytics = async (options: any) => {
	const params: { days?: number; path?: string } = {};
	if (options.days !== undefined) params.days = integerOption(options.days, 'days', 1, 90);
	if (options.path !== undefined) params.path = textOption(options.path, 'path');
	return sdkEnvelope(await (await siteContext(options)).site.analytics(params));
};
export const listJobs = async (options: any) =>
	sdkList(await (await siteContext(options)).site.jobs.list(listParams(options)));
export const getJob = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.jobs.get(identifier(options.job, '--job')));
export const retryJob = async (options: any) => {
	if (!options.yes)
		throw new CliError(422, 'Confirm retrying this failed Site job with --yes. External effects may repeat.');
	return sdkEnvelope(await (await siteContext(options)).site.jobs.retry(identifier(options.job, '--job')));
};
export const cancelJob = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm canceling this pending Site job with --yes.');
	return sdkEnvelope(await (await siteContext(options)).site.jobs.cancel(identifier(options.job, '--job')));
};
export const listSchedules = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.jobs.schedules());
export const activateSchedule = async (options: any) => {
	const data = await input(options, ['active']);
	if (typeof data.active !== 'boolean') throw new CliError(422, 'Specify active as true or false.');
	return sdkEnvelope(
		await (await siteContext(options)).site.jobs.activate(identifier(options.schedule, '--schedule'), data.active),
	);
};
export const getAuth = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.auth.get());
export const configureAuth = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.auth.configure(await input(options, ['provider', 'methods', 'expectedConfigRevision'])),
	);
export const connectClerk = async (options: any) => {
	if (options.data !== '-')
		throw new CliError(422, 'Supply Clerk production keys on stdin with --data - to keep them out of shell arguments.');
	return sdkEnvelope(
		await (
			await siteContext(options)
		).site.auth.connectClerk(await input(options, ['publishableKey', 'secretKey', 'expectedConfigRevision'])),
	);
};
export const verifyAuth = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.auth.verify(await input(options, ['sessionToken', 'clerkToken', 'hostname', 'method'])),
	);

export const getLifecycle = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.lifecycle());
const lifecycleAction = async (options: any, action: 'start' | 'stop' | 'archive' | 'restore' | 'delete') => {
	if (['stop', 'archive', 'delete'].includes(action) && !options.yes)
		throw new CliError(422, `Review the Site lifecycle and confirm ${action} with --yes.`);
	return sdkEnvelope(await (await siteContext(options)).site[action]());
};
export const startSite = (options: any) => lifecycleAction(options, 'start');
export const stopSite = (options: any) => lifecycleAction(options, 'stop');
export const archiveSite = (options: any) => lifecycleAction(options, 'archive');
export const restoreSite = (options: any) => lifecycleAction(options, 'restore');
export const deleteSite = (options: any) => lifecycleAction(options, 'delete');
export const provisionDatabase = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.provisionDatabase(options.data !== undefined ? await input(options, ['name', 'databaseName']) : {}),
	);
export const provisionStorage = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.provisionStorage(options.data !== undefined ? await input(options, ['name']) : {}),
	);
export const listMaps = async (options: any) => sdkEnvelope(await (await siteContext(options)).site.maps.list());
export const setMap = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.maps.set(
			identifier(options.capability, '--capability'),
			await input(options, ['provider', 'projectConnectorId', 'expectedConfigRevision']),
		),
	);
export const listTables = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.databaseData.tables());
export const createTable = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.databaseData.createTable(await input(options)));
export const getTable = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.databaseData.getTable(identifier(options.table, '--table')));
export const updateTable = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.databaseData.updateTable(identifier(options.table, '--table'), await input(options)),
	);
export const deleteTable = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm deleting this Site table with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.databaseData.deleteTable(identifier(options.table, '--table')),
	);
};
export const listRows = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.databaseData.rows(
			identifier(options.table, '--table'),
			options.data !== undefined ? await input(options) : {},
		),
	);
export const createRow = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.databaseData.createRow(identifier(options.table, '--table'), await input(options)),
	);
export const updateRows = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.databaseData.updateRows(identifier(options.table, '--table'), await input(options)),
	);
export const deleteRows = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm deleting these Site rows with --yes.');
	return sdkEnvelope(
		await (
			await siteContext(options)
		).site.databaseData.deleteRows(identifier(options.table, '--table'), await input(options)),
	);
};
export const inspectQuery = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.databaseData.inspectQuery((await input(options, ['sql'])).sql));
export const executeQuery = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm this production database query with --yes.');
	return sdkEnvelope(await (await siteContext(options)).site.databaseData.query((await input(options, ['sql'])).sql));
};
export const listMigrations = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.databaseData.migrations());
export const listFiles = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.storageData.files(options.data !== undefined ? await input(options) : {}),
	);
export const getFileMetadata = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.storageData.metadata(identifier(options.path, '--path')));
export const getFileContent = async (options: any) =>
	sdkEnvelope({
		contentBase64: Buffer.from(
			await (await siteContext(options)).site.storageData.content(identifier(options.path, '--path')),
		).toString('base64'),
	});
export const downloadFile = async (options: any) =>
	sdkEnvelope({
		contentBase64: Buffer.from(
			await (await siteContext(options)).site.storageData.download(identifier(options.path, '--path')),
		).toString('base64'),
	});
export const uploadFile = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.storageData.upload(await input(options)));
export const renameFile = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.storageData.rename(await input(options)));
export const deleteFile = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm deleting this Site file with --yes.');
	return sdkEnvelope(await (await siteContext(options)).site.storageData.delete(await input(options)));
};
export const createFolder = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.storageData.folder(await input(options)));
export const getStorageUsage = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.storageData.usage());
export const getAnalyticsConfig = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.analyticsData.config());
export const setAnalyticsConfig = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.analyticsData.setConfig((await input(options, ['enabled'])).enabled),
	);
export const rotateAnalyticsSource = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm rotating this Site analytics key with --yes.');
	return sdkEnvelope(await (await siteContext(options)).site.analyticsData.rotateSource());
};
export const listAnalyticsProviders = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.analyticsData.providers());
export const createAnalyticsProvider = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.analyticsData.createProvider(await input(options)));
export const getAnalyticsProvider = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.analyticsData.provider(identifier(options.provider, '--provider')),
	);
export const updateAnalyticsProvider = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.analyticsData.updateProvider(identifier(options.provider, '--provider'), await input(options)),
	);
export const deleteAnalyticsProvider = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm removing this Site analytics provider with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.analyticsData.deleteProvider(identifier(options.provider, '--provider')),
	);
};
export const listAnalyticsEvents = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.analyticsData.events(options.data !== undefined ? await input(options) : {}),
	);
export const getAnalyticsEvent = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.analyticsData.event(identifier(options.event, '--event')));
export const listAnalyticsDeliveries = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.analyticsData.deliveries(options.data !== undefined ? await input(options) : {}),
	);
export const getAnalyticsDelivery = async (options: any) =>
	sdkEnvelope(
		await (await siteContext(options)).site.analyticsData.delivery(identifier(options.delivery, '--delivery')),
	);

export const getMonitoringConfig = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.monitoringData.config());
export const setMonitoringConfig = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.monitoringData.configure(
			await input(options, ['provider', 'framework', 'projectConnectorId', 'expectedConfigRevision']),
		),
	);
export const synchronizeMonitoring = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.monitoringData.synchronize());
export const getMonitoringOverview = async (options: any) =>
	sdkEnvelope(
		await (
			await siteContext(options)
		).site.monitoringData.overview(options.data !== undefined ? await input(options, ['hours', 'search']) : {}),
	);
export const listMonitoringIssues = async (options: any) =>
	(await siteContext(options)).site.monitoringData.issues(
		options.data !== undefined ? await input(options, ['hours', 'search', 'offset', 'status']) : {},
	);
export const getMonitoringIssue = async (options: any) =>
	sdkEnvelope(await (await siteContext(options)).site.monitoringData.issue(identifier(options.issue, '--issue')));
export const resolveMonitoringIssue = async (options: any) => {
	if (!options.yes) throw new CliError(422, 'Confirm resolving this Site issue with --yes.');
	return sdkEnvelope(
		await (await siteContext(options)).site.monitoringData.resolve(identifier(options.issue, '--issue')),
	);
};
