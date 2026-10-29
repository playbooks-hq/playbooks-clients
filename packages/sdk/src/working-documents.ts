import { action, get, identifier } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier } from 'src/types.js';

export interface WorkingFile {
	path: string;
	kind?: 'file' | 'directory';
	/** Base64-encoded bytes; omitted for directories. */
	content?: string;
}
export interface WorkingTree {
	revision: string;
	checksum: string;
	readOnly: boolean;
	files: WorkingFile[];
}
export interface PlanDocument {
	uuid: string;
	title: string;
	currentRevisionId: string;
	readOnly: boolean;
	revision: { uuid: string; content: string; checksum: string };
}

/** Working content, never background Reference files. */
export class WorkingFiles {
	constructor(
		private transport: Transport,
		private path: string,
	) {}
	get() {
		return get<WorkingTree>(this.transport, this.path);
	}
	download(): Promise<Uint8Array> {
		return this.transport.request(this.path, 'GET', undefined, { download: true }, true, true);
	}
	replace(input: { revision: string; files: WorkingFile[] }) {
		return action<WorkingTree>(this.transport, this.path, 'PUT', input);
	}
	preview(input: { revision: string; entryPoint?: string }) {
		return action<{ html: string; revision: string }>(this.transport, `${this.path}/preview`, 'POST', input);
	}
	save(input: { revision: string; entryPoint?: string; path?: string; name?: string; requestId: string }) {
		return action(this.transport, `${this.path}/save`, 'POST', input);
	}
}

export class ConversationPlans {
	constructor(
		private transport: Transport,
		private path: string,
	) {}
	current() {
		return get<PlanDocument>(this.transport, `${this.path}/current`);
	}
	get(id: Identifier, revision?: string) {
		return get<PlanDocument>(this.transport, `${this.path}/${identifier(id)}`, revision ? { revision } : {});
	}
	create(input: { title: string; content: string }) {
		return action<PlanDocument>(this.transport, this.path, 'POST', input);
	}
	revise(id: Identifier, input: { revision: string; content: string }) {
		return action<PlanDocument>(this.transport, `${this.path}/${identifier(id)}`, 'PUT', input);
	}
	save(id: Identifier, input: { revision: string; requestId: string }) {
		return action(this.transport, `${this.path}/${identifier(id)}/save`, 'POST', input);
	}
}
