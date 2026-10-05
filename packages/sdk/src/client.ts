import { name, version } from 'package.json';
import { PlaybooksError } from 'src/error.js';
import { get, identifier, listing } from 'src/resource.js';
import { Transport } from 'src/transport.js';
import type { ApiResponse } from 'src/types.js';
import type { TemplateData, TemplateListOptions } from 'src/types.js';
import type { ClientOptions, Identifier, ListOptions, WorkspaceData, WorkspaceUpdate } from 'src/types.js';
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
		return { get: () => get(this.#transport(), '/session') };
	}
	get workspaces() {
		return {
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
			list: (options?: TemplateListOptions) =>
				listing<TemplateData>(this.#publicTransport(), '/explore/templates', options),
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
	get types() {
		return { list: (options?: ListOptions) => listing(this.#publicTransport(), '/project-types', options) };
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
