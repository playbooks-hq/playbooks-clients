import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions } from 'src/types.js';

export interface SubagentConfiguration {
	name?: string;
	description?: string;
	instructions?: string;
	modelId?: number | null;
	deliveryMode?: 'busy' | 'queue' | 'steer';
	skillIds?: number[];
	resourceSelection?: { fileIds?: number[]; mcpIds?: number[]; connectorIds?: number[] };
	agentScope?: {
		enabledTools: string[];
		resources: { kind: 'skill' | 'design' | 'file'; resourceId: string }[];
		externals: { assignmentId: number; operations: string[] }[];
	};
}
export type SubagentCreate = SubagentConfiguration & {
	name: string;
	idempotencyKey: string;
	conversationId: number;
};
export type SubagentUpdate = SubagentConfiguration & {
	conversationId: number;
	revision: number;
	action: 'configure' | 'enable' | 'disable' | 'archive' | 'restore';
};

/** Retained child definitions; ownership is fixed by the collection endpoint. */
export class Subagents {
	constructor(
		private transport: Transport,
		private path: string,
	) {}
	list(options: ListOptions & { conversationId: number; configuration?: boolean; archived?: boolean }) {
		return listing(this.transport, this.path, options);
	}
	get(id: Identifier, conversationId: number) {
		return get(this.transport, `${this.path}/${identifier(id)}`, { conversationId });
	}
	create(input: SubagentCreate) {
		return action(this.transport, this.path, 'POST', input);
	}
	update(id: Identifier, input: SubagentUpdate) {
		return action(this.transport, `${this.path}/${identifier(id)}`, 'PUT', input);
	}
	delete(id: Identifier, revision: number, conversationId: number) {
		return action(this.transport, `${this.path}/${identifier(id)}`, 'DELETE', { revision, conversationId });
	}
	cancelTask(id: Identifier, taskId: Identifier, conversationId: number) {
		return action(this.transport, `${this.path}/${identifier(id)}/tasks/${identifier(taskId)}/cancel`, 'POST', {
			conversationId,
		});
	}

	tasks(id: Identifier, conversationId: number, options?: ListOptions) {
		const query = { ...options, conversationId };
		return listing(this.transport, `${this.path}/${identifier(id)}/tasks`, query);
	}
}
