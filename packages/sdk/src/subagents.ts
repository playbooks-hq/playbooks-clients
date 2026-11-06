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
	resourceSelection?: { referenceIds?: number[]; mcpIds?: number[]; connectorIds?: number[] };
	agentScope?: {
		enabledTools: string[];
		resources: { kind: 'skill' | 'design' | 'reference'; resourceId: string }[];
		externals: { assignmentId: number; operations: string[] }[];
	};
}
export type SubagentCreate = SubagentConfiguration & { name: string; idempotencyKey: string; temporary?: boolean };
export type SubagentUpdate = SubagentConfiguration & {
	revision: number;
	action: 'configure' | 'enable' | 'disable' | 'archive' | 'restore';
};

/** Retained child definitions; ownership is fixed by the collection endpoint. */
export class Subagents {
	constructor(
		private transport: Transport,
		private path: string,
	) {}
	list(options?: ListOptions & { configuration?: boolean; archived?: boolean }) {
		return listing(this.transport, this.path, options);
	}
	get(id: Identifier) {
		return get(this.transport, `${this.path}/${identifier(id)}`);
	}
	create(input: SubagentCreate) {
		return action(this.transport, this.path, 'POST', input);
	}
	update(id: Identifier, input: SubagentUpdate) {
		return action(this.transport, `${this.path}/${identifier(id)}`, 'PUT', input);
	}
	delete(id: Identifier, revision: number) {
		return action(this.transport, `${this.path}/${identifier(id)}`, 'DELETE', { revision });
	}
	cancelTask(id: Identifier, taskId: Identifier) {
		return action(this.transport, `${this.path}/${identifier(id)}/tasks/${identifier(taskId)}/cancel`, 'POST', {});
	}

	tasks(id: Identifier, options?: ListOptions) {
		return listing(this.transport, `${this.path}/${identifier(id)}/tasks`, options);
	}
}
