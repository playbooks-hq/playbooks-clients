import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, RecordData } from 'src/types.js';

export type CustomerArtifactType =
	| 'document'
	| 'presentation'
	| 'diagram'
	| 'website'
	| 'interactive-experience'
	| 'other';

type ArtifactScope = 'chat' | 'project';
type Origin<Scope extends ArtifactScope> = { conversationId: number } & (Scope extends 'chat'
	? { chatId: number; projectId?: never }
	: { projectId: number; chatId?: never });
type TreeSource<Scope extends ArtifactScope> = Scope extends 'chat' ? 'chat-tree' : 'project-branch';

export interface CustomerArtifactEditingSource<Kind extends string = TreeSource<ArtifactScope> | 'submitted-content'> {
	type: Kind;
	id: string;
	revisionId: string;
	entrypoint: string;
}

export interface CustomerArtifactSourceReceipt {
	sourceType: 'workspace' | 'project';
	sourceId: string;
	sourceRevisionId: string;
}

interface ArtifactOriginInput<Scope extends ArtifactScope> {
	requestId: string;
	name: string;
	type?: CustomerArtifactType;
	origin: Origin<Scope>;
}

export type CustomerArtifactRegister<Scope extends ArtifactScope = ArtifactScope> = ArtifactOriginInput<Scope> &
	(
		| {
				editingSource: CustomerArtifactEditingSource<TreeSource<Scope>>;
				sourceReceipt?: CustomerArtifactSourceReceipt;
		  }
		| {
				editingSource?: CustomerArtifactEditingSource<TreeSource<Scope> | 'submitted-content'> | null;
				sourceReceipt: CustomerArtifactSourceReceipt;
		  }
	);

export interface CustomerArtifactPrepare<
	Scope extends ArtifactScope = ArtifactScope,
> extends ArtifactOriginInput<Scope> {
	artifactId?: string;
	editingSource: CustomerArtifactEditingSource<TreeSource<Scope>>;
	paths: string[];
	routingMode?: 'files' | 'spa';
}

export interface CustomerArtifactUpdate {
	name?: string;
	description?: string;
	activityConversationId?: string;
}

export interface CustomerArtifactListOptions {
	page?: number;
	search?: string;
	type?: CustomerArtifactType;
	archived?: boolean;
	view?: 'all' | 'owner' | 'collaborator' | 'pinned' | 'archive';
	sort?: 'recent' | 'name';
	audience?: 'private' | 'workspace' | 'public';
}

export interface CustomerArtifactData extends RecordData {
	id: string;
	uuid: string;
	artifactId: string;
	kind: 'artifact';
	name: string;
	type: CustomerArtifactType;
	status: string;
	currentVersionId: string | null;
	versionId: string | null;
	description: string;
	format: 'html' | 'bundle' | null;
}

export interface CustomerArtifactVersion {
	id: string;
	versionId: string;
	name: string;
	createdAt: string;
	actor: { id: number; name: string } | null;
	format: 'html' | 'bundle';
	checksum: string;
	restoredFromVersionId: string | null;
	isCurrent: boolean;
}

export interface CustomerArtifactPreview {
	html: string;
	versionId: string;
	checksum: string;
}

export interface CustomerArtifactOpen {
	url: string;
	grant: string;
	displayUrl: string;
	versionId: string;
	checksum: string;
}

export class CustomerArtifacts<Scope extends ArtifactScope> {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	list(options?: CustomerArtifactListOptions) {
		return listing<CustomerArtifactData>(this.#transport, this.#path, options);
	}
	get(id: Identifier, version?: string) {
		return get<CustomerArtifactData>(this.#transport, `${this.#path}/${identifier(id)}`, { version });
	}
	versions(id: Identifier, options?: { page?: number }) {
		return listing<CustomerArtifactVersion>(this.#transport, `${this.#path}/${identifier(id)}/versions`, options);
	}
	open(id: Identifier, version?: string) {
		return get<CustomerArtifactOpen>(this.#transport, `${this.#path}/${identifier(id)}/open`, { version });
	}
	preview(id: Identifier, version?: string) {
		return get<CustomerArtifactPreview>(this.#transport, `${this.#path}/${identifier(id)}/preview`, { version });
	}
	export(id: Identifier, version?: string): Promise<Buffer> {
		return this.#transport.request(`${this.#path}/${identifier(id)}/export`, 'GET', undefined, { version }, true, true);
	}
	download(id: Identifier, version?: string): Promise<Buffer> {
		return this.#transport.request(
			`${this.#path}/${identifier(id)}/download`,
			'GET',
			undefined,
			{ version },
			true,
			true,
		);
	}
	register(input: CustomerArtifactRegister<Scope>) {
		return action<CustomerArtifactData>(this.#transport, this.#path, 'POST', input);
	}
	prepare(input: CustomerArtifactPrepare<Scope>) {
		return action<CustomerArtifactData>(this.#transport, `${this.#path}/prepare`, 'POST', input);
	}
	update(id: Identifier, input: CustomerArtifactUpdate) {
		return action<CustomerArtifactData>(this.#transport, `${this.#path}/${identifier(id)}`, 'PUT', input);
	}
}
