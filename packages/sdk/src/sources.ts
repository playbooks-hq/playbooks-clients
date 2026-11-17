import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier } from 'src/types.js';

export interface SourceSelection {
	version: string;
	conversationId: string;
}

export interface SourceListOptions {
	page?: number;
	search?: string;
	type?: 'images' | 'documents' | 'data' | 'email';
	attachment?: number;
}

export interface SourceData {
	id: string;
	sourceId: string;
	versionId: string;
	conversationId: string;
	name: string;
	mediaType: string;
	size: number;
	capabilities: { canView: boolean; canDownload: boolean; canManage: boolean };
	contentType?: string;
	attachmentId?: number;
	createdAt?: string;
}

export interface SourceCopyInput extends SourceSelection {
	revision: string;
	path: string;
	activityConversationId?: string;
}

export interface ProjectSourceCopyInput extends SourceCopyInput {
	expectedBranchId: number;
}

export interface SourceCopyTarget {
	revision: string;
	suggestedPath: string;
	destination: 'Chat Files' | 'Agent Files' | 'Project Files';
}

export interface ProjectSourceCopyTarget extends SourceCopyTarget {
	branchId: number;
	branchName: string;
}

export interface SourceCopyResult extends Omit<SourceSelection, 'version'> {
	path: string;
	revision: string;
	sourceId: string;
	versionId: string;
}

export interface ProjectSourceCopyResult extends SourceCopyResult {
	branchId: number;
	branchName: string;
}

export class Sources<Scope extends 'chat' | 'agent' | 'project' = 'chat'> {
	#transport: Transport;
	#path: string;
	constructor(transport: Transport, path: string) {
		this.#transport = transport;
		this.#path = path;
	}
	list(options?: SourceListOptions) {
		return listing<SourceData>(this.#transport, this.#path, options);
	}
	get(id: Identifier, selection: SourceSelection) {
		return get<SourceData>(this.#transport, `${this.#path}/${identifier(id)}`, selection);
	}
	preview(id: Identifier, selection: SourceSelection): Promise<Buffer> {
		return this.#transport.request(`${this.#path}/${identifier(id)}/preview`, 'GET', undefined, selection, true, true);
	}
	download(id: Identifier, selection: SourceSelection): Promise<Buffer> {
		return this.#transport.request(`${this.#path}/${identifier(id)}/download`, 'GET', undefined, selection, true, true);
	}
	copyTarget(id: Identifier, selection: SourceSelection) {
		return get<Scope extends 'project' ? ProjectSourceCopyTarget : SourceCopyTarget>(
			this.#transport,
			`${this.#path}/${identifier(id)}/copy-to-file-system`,
			selection,
		);
	}
	copyToFileSystem(id: Identifier, input: Scope extends 'project' ? ProjectSourceCopyInput : SourceCopyInput) {
		return action<Scope extends 'project' ? ProjectSourceCopyResult : SourceCopyResult>(
			this.#transport,
			`${this.#path}/${identifier(id)}/copy-to-file-system`,
			'POST',
			input,
		);
	}
}
