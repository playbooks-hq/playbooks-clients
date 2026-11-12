import { name, version } from 'package.json';
import { Agents } from 'src/agents.js';
import { PlaybooksError } from 'src/error.js';
import { Projects } from 'src/project.js';
import { get, identifier, listing } from 'src/resource.js';
import { ResourceSharing } from 'src/resource-sharing.js';
import { Transport } from 'src/transport.js';
import type { ApiResponse, SharedResourceListOptions, SharedResourcePage } from 'src/types.js';
import type { ExploreTemplateListOptions, TemplateData } from 'src/types.js';
import type { ClientOptions, Identifier, ListOptions, WorkspaceData, WorkspaceUpdate } from 'src/types.js';
import { chats } from 'src/workspace.js';
import { updateWorkspace, Workspace } from 'src/workspace.js';

export class PlaybooksSDK {
	#options: ClientOptions;
	constructor(options: ClientOptions = {}) {
		this.#options = { ...options };
	}
	protected get clientHeader() {
		return `${name}@${version}`;
	}
	#transport(workspace?: string) {
		return new Transport(this.#options, workspace, this.clientHeader);
	}
	#publicTransport() {
		return new Transport({ baseUrl: this.#options.baseUrl }, undefined, this.clientHeader);
	}
	get session() {
		return {
			get: () => get(this.#transport(), '/session'),
			sharedResources: (options: SharedResourceListOptions = {}) =>
				get<SharedResourcePage>(this.#transport(), '/session/shared-resources', options),
		};
	}
	resourceSharing(workspace: Identifier, kind: 'chats' | 'agents' | 'projects', id: Identifier) {
		identifier(workspace);
		if (!['chats', 'agents', 'projects'].includes(kind))
			throw new PlaybooksError(422, 'Select chats, agents, or projects.');
		return new ResourceSharing(this.#transport(String(workspace)), kind, id);
	}

	get workspaces() {
		return {
			/** Scope operations to a known Workspace without fetching its metadata. */
			reference: (id: Identifier) => {
				identifier(id);
				const transport = this.#transport(String(id));
				return { agents: new Agents(transport), projects: new Projects(transport), chats: chats(transport) };
			},
			list: async (options: ListOptions = {}): Promise<ApiResponse<Workspace[]>> => {
				const response = await this.#transport().request('/session/workspaces', 'GET', undefined, options);
				return {
					...response,
					data: response.data.map((data: WorkspaceData) => new Workspace(this.#transport(data.uuid), data)),
				};
			},
			get: async (id: Identifier) => {
				const transport = this.#transport(String(id));
				identifier(id);
				const { data } = await transport.request('/workspace');
				if (data.uuid !== String(id))
					throw new PlaybooksError(403, 'The server did not resolve the requested workspace.');
				return new Workspace(transport, data);
			},
			update: async (id: Identifier, input: WorkspaceUpdate) => {
				identifier(id);
				const transport = this.#transport(String(id));
				const data = await updateWorkspace(transport, id, input);
				return new Workspace(transport, data);
			},
		};
	}
	get templates() {
		return {
			versions: (id: Identifier, options?: ListOptions) =>
				listing(this.#publicTransport(), `/explore/templates/${identifier(id)}/versions`, options),
			version: (id: Identifier, versionId: Identifier) =>
				get(this.#publicTransport(), `/explore/templates/${identifier(id)}/versions/${identifier(versionId)}`),
			list: (options: ExploreTemplateListOptions = {}) => {
				const { workspace, ...params } = options;
				if (params.view === 'following') {
					if (!workspace) throw new PlaybooksError(422, 'Following requires a selected Workspace.');
					if (!this.#options.apiKey) throw new PlaybooksError(401, 'Following requires an API key.');
					identifier(workspace);
					return listing<TemplateData>(this.#transport(workspace), '/explore/templates', params);
				}
				if (workspace !== undefined) throw new PlaybooksError(422, 'Workspace applies only to Following.');
				return listing<TemplateData>(this.#publicTransport(), '/explore/templates', params);
			},
			get: (id: Identifier, options: { include?: string } = {}) =>
				get<TemplateData>(this.#publicTransport(), `/explore/templates/${identifier(id)}`, options),
		};
	}
	get categories() {
		return { list: (options?: ListOptions) => listing(this.#publicTransport(), '/categories', options) };
	}
	get collections() {
		return { list: (options?: ListOptions) => listing(this.#publicTransport(), '/explore/collections', options) };
	}
	get creators() {
		return { list: (options?: ListOptions) => listing(this.#publicTransport(), '/workspaces', options) };
	}
	/** Low-level escape hatch. Named resources provide the supported typed surface. */
	request(
		path: string,
		options: {
			workspace?: string;
			method?: string;
			data?: object;
			params?: Record<string, unknown>;
			readOnly?: boolean;
			binary?: boolean;
			raw?: boolean;
			signal?: AbortSignal;
		} = {},
	) {
		return this.#transport(options.workspace).request(
			path,
			options.method,
			options.data,
			options.params,
			options.readOnly,
			options.binary,
			options.raw,
			options.signal,
		);
	}
}
