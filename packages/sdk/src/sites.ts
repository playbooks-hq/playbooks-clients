import { setTimeout as delay } from 'node:timers/promises';

import { PlaybooksError } from 'src/error.js';
import { action, get, identifier, listing, record, Resource } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions, ReleaseData, WaitOptions } from 'src/types.js';

export interface SiteSource {
	type: 'project' | 'chat' | 'agent';
	id: string;
	componentKey: string | null;
}

export interface SiteSourceRead extends SiteSource {
	name?: string | null;
	href?: string | null;
	path?: string | null;
}

const expectedSourceTuple = (source: SiteSource | null | undefined) =>
	source === null || source === undefined
		? source
		: { type: source.type, id: source.id, componentKey: source.componentKey };

export interface SiteData {
	id: string;
	uuid: string;
	workspaceUuid: string;
	name: string | null;
	kind: 'runtime' | 'static';
	status: string;
	url: string | null;
	primaryHostname: string | null;
	defaultHostname: string;
	defaultUrl: string;
	createdAt: string | null;
	updatedAt: string | null;
	source: SiteSourceRead | null;
	currentRelease: ReleaseData | null;
	latestRelease: SiteReleaseData | null;
	health: { observedState: string | null; error: string | null };
	access: { role: string | null };
	capabilities: { canView: boolean; canManage: boolean; canRelease: boolean };
	config: Record<string, unknown>;
	lifecycleActions?: { archive: SiteLifecycleAction; restore: SiteLifecycleAction };
}

export interface SiteLifecycleAction {
	allowed: boolean;
	reason: string | null;
}

export interface SitePreviewData {
	status: 'ready' | 'pending' | 'unavailable';
	reason: string | null;
	releaseId: string | null;
	pageUrl: string | null;
	fetchedAt: string | null;
	title: string | null;
	description: string | null;
	imageUrl: string | null;
	faviconUrl: string | null;
}

export interface SiteCreate {
	name: string;
	kind: 'runtime' | 'static';
	source?: SiteSource;
}

export interface SiteReleaseInput {
	expectedSource: SiteSource | null;
	sourceRevision: string;
	componentKey: string;
	expectedCurrentReleaseId: string | null;
	expectedConfigRevision: string;
}

export interface SiteReleaseCreateInput extends SiteReleaseInput {
	requestId?: string;
}

export interface SiteReleaseData extends ReleaseData {
	releaseNumber: number | null;
	sourceRevision: string | null;
	progress: {
		percent: number | null;
		failedPhase: string | null;
		reason: string | null;
		cleanupPending: boolean;
		interrupted: boolean;
	} | null;
	provenance: {
		sourceType: string | null;
		sourceId: string | null;
		componentKey: string | null;
		sourceBranch: string | null;
		sourceRevision: string | null;
		checkpointId: number | null;
		retainedReleaseId: string | null;
	};
	startedAt: string | null;
	activatedAt: string | null;
	finishedAt: string | null;
	capabilities: { canRedeploy: boolean; canRollback: boolean };
}

export interface SiteAnalyticsData {
	hours: 1 | 24 | 168 | 720;
	service: string | null;
	route: string | null;
	services: string[];
	requests: number;
	failures: number;
	errorRate: number | null;
	meanMs: number | null;
	p95: number | null;
	p95Method: 'histogram-upper-bound';
	statusGroups: { group: string; requests: number }[] | null;
	history: ({ time: string } & SiteRoutingMeasures)[];
	routes: ({ service: string | null; route: string } & SiteRoutingMeasures)[];
	nextOffset: number | null;
}

export interface SiteAnalyticsConfigData {
	enabled: boolean;
	available: boolean;
	active: boolean;
	writeKey: string | null;
}

type SiteRoutingMeasures = Pick<
	SiteAnalyticsData,
	'requests' | 'failures' | 'errorRate' | 'meanMs' | 'p95' | 'p95Method' | 'statusGroups'
>;

export interface SiteLogOptions {
	releaseId?: string;
	query?: string;
	cursor?: string;
	after?: string;
	pageSize?: number;
	from?: string;
	to?: string;
	source?: string;
	service?: string;
	stream?: string;
	severity?: string;
	requestId?: string;
	traceId?: string;
}

export interface SiteRedeployInput {
	retainedReleaseId: string;
	expectedCurrentReleaseId: string | null;
	expectedConfigRevision: string;
	requestId?: string;
}

export interface SiteConfigInput {
	provider?: string | null;
	region?: string | null;
	runtimeProfile?: string | null;
	runtimeUuid?: string | null;
	lifecycleUuid?: string | null;
	expectedConfigRevision: string;
}

export interface SitePreflight {
	status: 'ready' | 'blocked';
	blockers: { code: string; message: string }[];
	source: { checkpointId: number | null; revision: string };
	component: { key: string; kind: string };
	configRevision: string;
	manifestChecksum: string;
	sourceChecksum: string;
	expectedCurrentReleaseId: string | null;
	requirements: Record<string, unknown>;
}

export interface Site extends Readonly<SiteData> {
	readonly uuid: string;
}

export class Site extends Resource<SiteData> {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, data: SiteData) {
		super(data);
		this.#transport = transport;
		this.#path = `/sites/${identifier(data.uuid)}`;
	}
	get agentAccess() {
		const path = `${this.#path}/agent-access`;
		return {
			get: () => get<Record<string, unknown>>(this.#transport, path),
			update: (data: { enabled: boolean }) => action<Record<string, unknown>>(this.#transport, path, 'PUT', data),
			rotate: () => action<Record<string, unknown>>(this.#transport, `${path}/rotate`, 'POST', {}),
		};
	}

	async update(input: { name: string }) {
		const data = await action<SiteData>(this.#transport, this.#path, 'PATCH', input);
		if (data.uuid !== this.uuid) throw new PlaybooksError(502, 'The updated Site identity did not match.');
		this.replace(data);
		return this;
	}
	get sourceConnection(): {
		get: () => Promise<SiteSourceRead | null>;
		connect: (source: SiteSource, expectedSource: SiteSource | null) => Promise<Site>;
		disconnect: (expectedSource: SiteSource | null) => Promise<Site>;
	} {
		return {
			get: async (): Promise<SiteSourceRead | null> => (await this.#transport.request(`${this.#path}/source`)).data,
			connect: async (source: SiteSource, expectedSource: SiteSource | null) => {
				const data = await action<SiteData>(this.#transport, `${this.#path}/source`, 'PUT', {
					source,
					expectedSource: expectedSourceTuple(expectedSource),
				});
				this.replace(data);
				return this;
			},
			disconnect: async (expectedSource: SiteSource | null) => {
				const data = await action<SiteData>(this.#transport, `${this.#path}/source`, 'DELETE', {
					expectedSource: expectedSourceTuple(expectedSource),
				});
				this.replace(data);
				return this;
			},
		};
	}
	async preflight(input: SiteReleaseInput): Promise<SitePreflight> {
		return (
			await this.#transport.request(
				`${this.#path}/preflight`,
				'POST',
				{ ...input, expectedSource: expectedSourceTuple(input.expectedSource) },
				{},
				false,
			)
		).data;
	}
	get preview() {
		return {
			get: () => get<SitePreviewData>(this.#transport, `${this.#path}/preview`),
			refresh: () => action<SitePreviewData>(this.#transport, `${this.#path}/preview`, 'POST', {}),
		};
	}
	releaseOptions() {
		return get(this.#transport, `${this.#path}/release-options`);
	}
	get releases() {
		const path = `${this.#path}/releases`;
		return {
			list: (options?: ListOptions) => listing<SiteReleaseData>(this.#transport, path, options),
			get: (id: Identifier) => get<SiteReleaseData>(this.#transport, `${path}/${identifier(id)}`),
			create: (input: SiteReleaseCreateInput) =>
				action<SiteReleaseData>(this.#transport, path, 'POST', {
					...input,
					expectedSource: expectedSourceTuple(input.expectedSource),
				}),
			wait: async (id: Identifier, options: WaitOptions = {}) => {
				const deadline = Date.now() + (options.timeoutMs ?? 300000);
				for (;;) {
					const result = await this.#transport.request(
						`${path}/${identifier(id)}`,
						'GET',
						undefined,
						{},
						true,
						false,
						false,
						options.signal,
					);
					if (result.data.status === 'succeeded') return record<SiteReleaseData>(result.data);
					if (['failed', 'cancelled', 'canceled'].includes(result.data.status))
						throw new PlaybooksError(
							422,
							'The Site release did not succeed. Inspect the release for details.',
							'release',
							String(id),
						);
					if (Date.now() >= deadline)
						throw new PlaybooksError(
							408,
							'The Site release is still pending. Resume observation using its identifier.',
							'release',
							String(id),
						);
					await delay(2000, undefined, { signal: options.signal });
				}
			},
		};
	}
	redeploy(input: SiteRedeployInput) {
		return action<SiteReleaseData>(this.#transport, `${this.#path}/redeploy`, 'POST', input);
	}
	rollback(input: { releaseId: string; expectedCurrentReleaseId: string }) {
		return action<SiteReleaseData>(this.#transport, `${this.#path}/rollback`, 'POST', input);
	}
	lifecycle() {
		return get(this.#transport, `${this.#path}/lifecycle`);
	}
	start() {
		return action<SiteData>(this.#transport, `${this.#path}/start`, 'POST', {});
	}
	stop() {
		return action<SiteData>(this.#transport, `${this.#path}/stop`, 'POST', {});
	}
	archive() {
		return action<SiteData>(this.#transport, `${this.#path}/archive`, 'POST', {});
	}
	restore() {
		return action<SiteData>(this.#transport, `${this.#path}/restore`, 'POST', {});
	}
	delete() {
		return action(this.#transport, this.#path, 'DELETE');
	}
	get config() {
		const path = `${this.#path}/config`;
		return {
			get: () => get(this.#transport, path),
			update: (input: SiteConfigInput) => action(this.#transport, path, 'PATCH', input),
		};
	}
	get visitorPolicy() {
		const path = `${this.#path}/visitor-policy`;
		return {
			get: () => get(this.#transport, path),
			update: (input: { mode: 'public' | 'private'; expectedConfigRevision: string }) =>
				action(this.#transport, path, 'PATCH', input),
		};
	}
	get credentials() {
		const path = `${this.#path}/credentials`;
		return {
			list: async () => (await this.#transport.request(path)).data,
			put: (key: string, input: { value: string; expectedConfigRevision: string }) =>
				action(this.#transport, `${path}/${identifier(key)}`, 'PUT', input),
			delete: (key: string, input: { expectedConfigRevision: string }) =>
				action(this.#transport, `${path}/${identifier(key)}`, 'DELETE', input),
		};
	}
	get domains() {
		const path = `${this.#path}/domains`;
		return {
			list: async () => (await this.#transport.request(path)).data,
			bind: (input: { domainId: string; hostname: string; primary?: boolean }) =>
				action(this.#transport, path, 'POST', input),
			unbind: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
			recheck: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}/recheck`, 'POST', {}),
		};
	}
	get collaborators() {
		const path = `${this.#path}/collaborators`;
		return {
			list: async () => (await this.#transport.request(path)).data,
			put: (input: { userId: string; role: 'viewer' | 'editor' | 'admin' }) =>
				action(this.#transport, path, 'PUT', input),
			delete: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
		};
	}
	get invitations() {
		const path = `${this.#path}/access-invitations`;
		return {
			list: async () => (await this.#transport.request(path)).data,
			create: (input: { email: string; role: 'viewer' | 'editor' | 'admin' }) =>
				action(this.#transport, path, 'POST', input),
			resend: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}/resend`, 'POST', {}),
			revoke: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
		};
	}
	get connections() {
		const path = `${this.#path}/connections`;
		return {
			list: async () => (await this.#transport.request(path)).data,
			create: (input: {
				connectorId: string;
				workspaceConnectorId: number;
				profile?: { data?: Record<string, unknown>; clear?: string[] };
			}) => action(this.#transport, path, 'POST', input),
			update: (
				id: Identifier,
				input: { profile?: { data?: Record<string, unknown>; clear?: string[] }; status?: 'active' | 'disabled' },
			) => action(this.#transport, `${path}/${identifier(id)}`, 'PUT', input),
			delete: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
		};
	}
	get jobs() {
		const path = `${this.#path}/jobs`;
		return {
			list: (options?: ListOptions) => listing(this.#transport, path, options),
			get: (id: Identifier) => get(this.#transport, `${path}/${identifier(id)}`),
			retry: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}/retry`, 'POST', {}),
			cancel: (id: Identifier) => action(this.#transport, `${path}/${identifier(id)}`, 'DELETE'),
			schedules: async () => (await this.#transport.request(`${path}/schedules`)).data,
			activate: (id: Identifier, active: boolean) =>
				action(this.#transport, `${path}/schedules/${identifier(id)}/activation`, 'PUT', { active }),
		};
	}
	database() {
		return get(this.#transport, `${this.#path}/database`);
	}
	provisionDatabase(input: { name?: string; databaseName?: string } = {}) {
		return action(this.#transport, `${this.#path}/database`, 'POST', input);
	}
	storage() {
		return get(this.#transport, `${this.#path}/storage`);
	}
	provisionStorage(input: { name?: string } = {}) {
		return action(this.#transport, `${this.#path}/storage`, 'POST', input);
	}
	get maps() {
		const path = `${this.#path}/maps`;
		return {
			list: () => get(this.#transport, path),
			set: (
				capability: string,
				input: {
					provider: 'managed' | 'connector' | 'unconfigured';
					projectConnectorId?: number;
					expectedConfigRevision: string;
				},
			) => action(this.#transport, `${path}/${identifier(capability)}`, 'PUT', input),
		};
	}
	get databaseData() {
		const path = `${this.#path}/database`;
		const table = (name: string) => `${path}/tables/${identifier(name)}`;
		return {
			tables: () => get(this.#transport, `${path}/tables`),
			createTable: (input: Record<string, unknown>) => action(this.#transport, `${path}/tables`, 'POST', input),
			getTable: (name: string) => get(this.#transport, table(name)),
			updateTable: (name: string, input: Record<string, unknown>) =>
				action(this.#transport, table(name), 'PATCH', input),
			deleteTable: (name: string) => action(this.#transport, table(name), 'DELETE'),
			rows: (name: string, params: Record<string, unknown> = {}) =>
				this.#transport.request(`${table(name)}/rows`, 'GET', undefined, params),
			createRow: (name: string, input: Record<string, unknown>) =>
				action(this.#transport, `${table(name)}/rows`, 'POST', input),
			updateRows: (name: string, input: Record<string, unknown>) =>
				action(this.#transport, `${table(name)}/rows`, 'PUT', input),
			deleteRows: (name: string, input: Record<string, unknown>) =>
				action(this.#transport, `${table(name)}/rows`, 'DELETE', input),
			inspectQuery: (sql: string) => action(this.#transport, `${path}/inspect-query`, 'POST', { sql }),
			query: (sql: string) => action(this.#transport, `${path}/query`, 'POST', { sql }),
			migrations: () => get(this.#transport, `${path}/migrations`),
		};
	}
	get storageData() {
		const path = `${this.#path}/storage`;
		return {
			files: (params: Record<string, unknown> = {}) =>
				this.#transport.request(`${path}/files`, 'GET', undefined, params),
			metadata: (pathName: string) => get(this.#transport, `${path}/files/metadata`, { path: pathName }),
			content: (pathName: string): Promise<Uint8Array> =>
				this.#transport.request(`${path}/files/content`, 'GET', undefined, { path: pathName }, true, true),
			download: (pathName: string): Promise<Uint8Array> =>
				this.#transport.request(`${path}/files/download`, 'GET', undefined, { path: pathName }, true, true),
			upload: (input: Record<string, unknown>) => action(this.#transport, `${path}/files`, 'POST', input),
			rename: (input: Record<string, unknown>) => action(this.#transport, `${path}/files`, 'PATCH', input),
			delete: (input: Record<string, unknown>) => action(this.#transport, `${path}/files`, 'DELETE', input),
			folder: (input: Record<string, unknown>) => action(this.#transport, `${path}/folders`, 'POST', input),
			usage: () => get(this.#transport, `${path}/usage`),
		};
	}
	logs(options: SiteLogOptions = {}) {
		return this.#transport.request(`${this.#path}/logs`, 'GET', undefined, options);
	}
	log(id: Identifier, options: Pick<SiteLogOptions, 'releaseId' | 'cursor'> = {}) {
		return get(this.#transport, `${this.#path}/logs/${identifier(id)}`, options);
	}
	monitoring() {
		return get(this.#transport, `${this.#path}/monitoring`);
	}
	get monitoringData() {
		const path = `${this.#path}/monitoring`;
		return {
			config: () => get<SiteAnalyticsConfigData>(this.#transport, `${path}/config`),
			configure: (input: Record<string, unknown>) => action(this.#transport, `${path}/config`, 'PUT', input),
			synchronize: () => action(this.#transport, `${path}/synchronize`, 'POST', {}),
			overview: (params: Record<string, unknown> = {}) => get(this.#transport, `${path}/overview`, params),
			issues: (params: Record<string, unknown> = {}) =>
				this.#transport.request(`${path}/issues`, 'GET', undefined, params),
			issue: (id: Identifier, params: Record<string, unknown> = {}) =>
				get(this.#transport, `${path}/issues/${identifier(id)}`, params),
			resolve: (id: Identifier) => action(this.#transport, `${path}/issues/${identifier(id)}/resolve`, 'POST', {}),
		};
	}
	analytics(
		options: { hours?: 1 | 24 | 168 | 720; service?: string; route?: string; search?: string; offset?: number } = {},
	) {
		return get<SiteAnalyticsData>(this.#transport, `${this.#path}/analytics`, options);
	}
	get analyticsData() {
		const path = `${this.#path}/analytics`;
		return {
			config: () => get(this.#transport, `${path}/config`),
			setConfig: (enabled: boolean) => action(this.#transport, `${path}/config`, 'PUT', { enabled }),
			rotateSource: () => action(this.#transport, `${path}/source/rotate`, 'POST', {}),
			providers: () => get(this.#transport, `${path}/providers`),
			createProvider: (input: Record<string, unknown>) => action(this.#transport, `${path}/providers`, 'POST', input),
			provider: (id: Identifier) => get(this.#transport, `${path}/providers/${identifier(id)}`),
			updateProvider: (id: Identifier, input: Record<string, unknown>) =>
				action(this.#transport, `${path}/providers/${identifier(id)}`, 'PUT', input),
			deleteProvider: (id: Identifier) => action(this.#transport, `${path}/providers/${identifier(id)}`, 'DELETE'),
			events: (params: Record<string, unknown> = {}) =>
				this.#transport.request(`${path}/events`, 'GET', undefined, params),
			event: (id: Identifier) => get(this.#transport, `${path}/events/${identifier(id)}`),
			deliveries: (params: Record<string, unknown> = {}) =>
				this.#transport.request(`${path}/deliveries`, 'GET', undefined, params),
			delivery: (id: Identifier) => get(this.#transport, `${path}/deliveries/${identifier(id)}`),
		};
	}
}

export class Sites {
	#transport: Transport;
	constructor(transport: Transport) {
		this.#transport = transport;
	}
	async list(options: ListOptions = {}) {
		const response = await listing<SiteData>(this.#transport, '/sites', options);
		return { ...response, data: response.data.map(item => new Site(this.#transport, item.toJSON())) };
	}
	async get(id: Identifier) {
		const { data } = await this.#transport.request(`/sites/${identifier(id)}`);
		if (data.uuid !== String(id)) throw new PlaybooksError(502, 'The Site identity did not match.');
		return new Site(this.#transport, data);
	}
	async create(input: SiteCreate) {
		return new Site(this.#transport, await action<SiteData>(this.#transport, '/sites', 'POST', input));
	}
}
