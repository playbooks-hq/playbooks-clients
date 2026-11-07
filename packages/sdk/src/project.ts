import { Channels } from 'src/channels.js';
import { Collection } from 'src/collection.js';
import { PlaybooksError } from 'src/error.js';
import { Files } from 'src/files.js';
import { ProjectConversations, Runs } from 'src/operators.js';
import { ProjectTests } from 'src/project-tests.js';
import { action, get, identifier, listing, record, Resource, succeeded } from 'src/resource.js';
import type { SiteData } from 'src/sites.js';
import { Subagents } from 'src/subagents.js';
import type { Transport } from 'src/transport.js';
import type { ProjectAgentCreate } from 'src/types.js';
import type { ApiResponse, LogData, LogOptions, RecordData } from 'src/types.js';
import type { LibraryData } from 'src/types.js';
import type { ProjectAgentData, ProjectAgentUpdate, ScheduleData } from 'src/types.js';
import type {
	ActionReceipt,
	BudgetUpdate,
	Identifier,
	LibraryInput,
	ListOptions,
	ProjectCreate,
	ProjectData,
	ProjectGetOptions,
	ProjectListOptions,
	ProjectUpdate,
	ScheduleInput,
	ScheduleRunInput,
	ScheduleUpdate,
	SettingsInput,
	SourceInput,
} from 'src/types.js';

export interface Project extends Readonly<ProjectData> {
	readonly uuid: string;
}

export type SandboxServiceInput = {
	uuid?: string;
	key: string;
	status?: 'active' | 'disabled';
	commands: string[];
	port?: number | null;
	env?: Record<string, string>;
	dependsOn?: string[];
	position?: number;
};

export type SandboxConfigInput = {
	expectedVersionId?: number | null;
	services?: SandboxServiceInput[];
	primaryServiceId?: number;
	runtimeUuid?: string;
	lifecycleUuid?: string;
	network?: Record<string, unknown>;
};

export class Project extends Resource<ProjectData> {
	declare readonly id: number;
	declare readonly uuid: string;
	declare readonly name: string;
	declare readonly executionProfile?: 'application' | 'operational' | 'test';
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, data: ProjectData, path?: string) {
		super(data);
		this.#transport = transport;
		this.#path = path ?? `/projects/${identifier(data.uuid)}`;
	}
	get agentAccess() {
		const path = `${this.#path}/agent-access`;
		return {
			get: () => get<Record<string, unknown>>(this.#transport, path),
			update: (data: { enabled: boolean }) => action<Record<string, unknown>>(this.#transport, path, 'PUT', data),
			rotate: () => action<Record<string, unknown>>(this.#transport, `${path}/rotate`, 'POST', {}),
		};
	}

	async update(changes: ProjectUpdate) {
		const data = await action<ProjectData>(this.#transport, this.#path, 'PUT', changes);
		if (data.id !== this.id || data.uuid !== this.uuid)
			throw new PlaybooksError(502, 'The updated Project identity did not match.');
		this.replace(data);
		return this;
	}
	archive(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/archive`, 'POST', input);
	}
	restore(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/restore`, 'POST', input);
	}
	delete(input: { confirmation: string }) {
		return action<ActionReceipt>(this.#transport, `${this.#path}/lifecycle/delete`, 'POST', input);
	}
	get lifecycle() {
		return { get: () => get(this.#transport, `${this.#path}/lifecycle`) };
	}
	get publication() {
		return { get: () => get(this.#transport, `${this.#path}/publication`) };
	}
	get usage() {
		return { get: () => get(this.#transport, `${this.#path}/usage`) };
	}
	get budget() {
		return {
			get: () => get(this.#transport, `${this.#path}/budget`),
			update: (input: BudgetUpdate) => action(this.#transport, `${this.#path}/budget`, 'PUT', input),
		};
	}
	get settings() {
		return {
			get: async () => {
				const response = await this.#transport.request(`${this.#path}/preferences`, 'GET');
				return record({ ...response.data, ...response.meta });
			},
			update: async (input: SettingsInput) => {
				const response = await this.#transport.request(`${this.#path}/preferences`, 'PUT', input);
				return { ...succeeded(response.data), ...response.meta };
			},
		};
	}
	get resources() {
		return {
			get: () => get(this.#transport, `${this.#path}/resources`),
			state: () => get(this.#transport, `${this.#path}/resource-state`),
			update: (input: { revision: string; designId?: number | null; workspaceConnectorIds?: number[] }) =>
				action(this.#transport, `${this.#path}/resources`, 'PUT', input),
		};
	}
	get collaborators() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/collaborators`, options),
			add: (input: { userId: number; role: string }) =>
				action(this.#transport, `${this.#path}/collaborators`, 'POST', input),
			update: (id: Identifier, input: { role: string }) =>
				action(this.#transport, `${this.#path}/collaborators/${identifier(id)}`, 'PUT', input),
		};
	}
	get subagents() {
		return new Subagents(this.#transport, `${this.#path}/subagents`);
	}
	get agents() {
		const collection = new Collection<ProjectAgentData, ProjectAgentUpdate, ProjectAgentCreate>(
			this.#transport,
			`${this.#path}/agents`,
		);
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier, options: { include?: string } = {}) => collection.get(id, options),
			create: (input: ProjectAgentCreate) => collection.create(input),
			update: (id: Identifier, input: ProjectAgentUpdate) => collection.update(id, input),
		};
	}
	get tests() {
		return new ProjectTests(this.#transport, `${this.#path}/tests`);
	}
	#library(kind: 'designs' | 'skills') {
		const collection = new Collection<LibraryData, LibraryInput>(
			this.#transport,
			`${this.#path}/resources/library/${kind}`,
		);
		return {
			list: (options?: ListOptions) => collection.list(options),
			create: (input: LibraryInput) => collection.create(input),
			update: (id: Identifier, input: LibraryInput) => collection.update(id, input),
		};
	}

	get designs() {
		return this.#library('designs');
	}
	get skills() {
		return this.#library('skills');
	}
	get mcps() {
		return { list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/resource-mcps`, options) };
	}
	get connectors() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/connectors`, options),
		};
	}
	get files() {
		return new Files(this.#transport, `${this.#path}/files`);
	}
	get channels() {
		return new Channels(this.#transport, `${this.#path}/channels`);
	}
	get conversations() {
		return new ProjectConversations(this.#transport, this.#path, this.id);
	}
	get runs() {
		return new Runs(this.#transport, `${this.#path}/operator/runs`);
	}
	get sandbox() {
		return {
			get: () =>
				get(this.#transport, `${this.#path}/sandbox/${this.executionProfile === 'test' ? 'health' : 'config'}`),
			configure: (input: SandboxConfigInput) => {
				if (this.executionProfile === 'test')
					throw new PlaybooksError(422, 'Test Projects do not support Sandbox service configuration.');
				return action(this.#transport, `${this.#path}/sandbox/config`, 'PUT', input);
			},
		};
	}
	get logs() {
		return {
			list: (options: LogOptions = {}): Promise<ApiResponse<LogData[]>> =>
				this.#transport.request(`${this.#path}/logs`, 'GET', undefined, options),
		};
	}
	get source() {
		return {
			status: () => get(this.#transport, `${this.#path}/git-panel`),
			connect: (input: SourceInput) => action(this.#transport, `${this.#path}/source-control/connect`, 'PUT', input),
			disconnect: async (): Promise<RecordData> =>
				(await this.#transport.request(`${this.#path}/source-control/disconnect`, 'GET', undefined, {}, false)).data,
			sync: (input: { branchId: number; expectedHead: string }) =>
				action(this.#transport, `${this.#path}/git-panel/sync`, 'POST', input),
			import: async (input: { content: Blob | Uint8Array; name: string }): Promise<RecordData> => {
				const form = new FormData();
				form.set(
					'project',
					input.content instanceof Blob ? input.content : new Blob([new Uint8Array(input.content)]),
					input.name,
				);
				return (await this.#transport.request(`${this.#path}/upload`, 'POST', form, {}, false)).data;
			},
			export: (): Promise<Uint8Array> =>
				this.#transport.request(`${this.#path}/download`, 'GET', undefined, {}, false, true),
		};
	}
	get branches() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/branches`, options),
			create: (input: { name?: string; branchId?: number; baseBranch?: string }) =>
				action(this.#transport, `${this.#path}/git-panel/branches`, 'POST', input),
		};
	}
	get checkpoints() {
		return {
			list: (options?: ListOptions) => listing(this.#transport, `${this.#path}/checkpoints`, options),
			rename: (id: Identifier, input: { label: string }) =>
				action(this.#transport, `${this.#path}/checkpoints/${identifier(id)}`, 'PUT', input),
			restore: (id: Identifier) =>
				action(this.#transport, `${this.#path}/checkpoints/${identifier(id)}/restore`, 'POST'),
		};
	}
	get ownership() {
		return {
			get: () => get(this.#transport, `${this.#path}/ownership-request`),
			transfer: (input: { toUserId: number }) =>
				action(this.#transport, `${this.#path}/ownership-request`, 'POST', input),
			accept: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/accept`, 'POST'),
			decline: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/decline`, 'POST'),
			cancel: (id: Identifier) =>
				action(this.#transport, `${this.#path}/ownership-request/${identifier(id)}/cancel`, 'POST'),
		};
	}
	get schedules() {
		const path = `${this.#path}/schedules`;
		const collection = new Collection<ScheduleData, ScheduleUpdate, ScheduleInput>(this.#transport, path);
		return {
			list: (options?: ListOptions) => collection.list(options),
			get: (id: Identifier) => collection.get(id),
			create: (input: ScheduleInput) => collection.create(input),
			update: (id: Identifier, input: ScheduleUpdate) => collection.update(id, input),
			delete: (id: Identifier, input: { revision: number }) =>
				action(this.#transport, `${path}/${identifier(id)}`, 'DELETE', input),
			run: (id: Identifier, input: ScheduleRunInput) =>
				action(this.#transport, `${path}/${identifier(id)}/runs`, 'POST', input),
			runs: (id: Identifier, options?: ListOptions) =>
				listing(this.#transport, `${path}/${identifier(id)}/runs`, options),
			occurrences: (id: Identifier, options?: ListOptions) =>
				listing(this.#transport, `${path}/${identifier(id)}/occurrences`, options),
			getRun: (id: Identifier, runId: Identifier) =>
				get(this.#transport, `${path}/${identifier(id)}/runs/${identifier(runId)}`),
		};
	}
	get sites() {
		return { list: () => listing<SiteData>(this.#transport, `${this.#path}/sites`) };
	}
}

export class Projects {
	#transport: Transport;
	constructor(transport: Transport) {
		this.#transport = transport;
	}
	async list(options: ProjectListOptions = {}) {
		const response = await listing<ProjectData>(this.#transport, '/projects', options);
		return { ...response, data: response.data.map(item => new Project(this.#transport, item.toJSON())) };
	}
	async get(id: Identifier, options: ProjectGetOptions = {}) {
		const { agentId, testId, ...params } = options;
		if (agentId !== undefined && testId !== undefined)
			throw new PlaybooksError(422, 'Choose either an Agent or a Test.');
		let path = `/projects/${identifier(id)}`;
		if (agentId !== undefined) path += `/agents/${identifier(agentId)}/execution`;
		if (testId !== undefined) path += `/tests/${identifier(testId)}/execution`;
		const { data } = await this.#transport.request(path, 'GET', undefined, params);
		const childId = agentId ?? testId;
		const matches =
			childId === undefined
				? data.uuid === String(id)
				: data.childContext?.parentId === String(id) &&
					data.executionProfile === (agentId !== undefined ? 'operational' : 'test') &&
					data.childContext?.[agentId !== undefined ? 'agentId' : 'testId'] === String(childId);
		if (!matches) throw new PlaybooksError(502, 'The Project identity did not match.');
		return new Project(this.#transport, data, path);
	}
	async create(input: ProjectCreate) {
		return new Project(this.#transport, await action(this.#transport, '/projects', 'POST', input));
	}
	async update(id: Identifier, input: ProjectUpdate) {
		return new Project(this.#transport, await updateProject(this.#transport, id, input));
	}
}

const updateProject = async (transport: Transport, id: Identifier, changes: ProjectUpdate) => {
	const data = await action<ProjectData>(transport, `/projects/${identifier(id)}`, 'PUT', changes);
	if (data.uuid !== String(id)) throw new PlaybooksError(502, 'The updated Project identity did not match.');
	return data;
};
