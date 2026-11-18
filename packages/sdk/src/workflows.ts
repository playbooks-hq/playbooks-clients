import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier } from 'src/types.js';

export type WorkflowSchedule = {
	frequency: 'daily' | 'weekdays' | 'weekly' | 'monthly';
	time: string;
	timezone: string;
	weekday?: number;
	monthDay?: number;
};

export type WorkflowReference = {
	type:
		| 'mcp'
		| 'connector'
		| 'file'
		| 'design'
		| 'skill'
		| 'member'
		| 'project'
		| 'workspace'
		| 'template'
		| 'collection'
		| 'conversation';
	uuid: string;
	label: string;
	start: number;
	length: number;
};

export type WorkflowSource = {
	chatId: string;
	conversationId: string;
	sourceId: string;
	versionId: string;
};

type WorkflowOperator = { instructions?: string; references?: WorkflowReference[] };
export type WorkflowCondition = {
	input: string;
	operator: 'equals' | 'notEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual';
	value: string | number | boolean;
};

type WorkflowInputs = { inputs?: Record<string, { stepId: string; result: string }> };

export type WorkflowStep = {
	id: string;
	title?: string;
	position?: { x: number; y: number };
	dependsOn: string[];
	branches?: Record<string, boolean>;
	outputs?: string[];
} & (
	| { type: 'trigger'; schedule?: WorkflowSchedule }
	| ({ type: 'chat'; sources?: WorkflowSource[]; creditBudget?: number } & WorkflowOperator & WorkflowInputs)
	| ({ type: 'llm'; instructions?: string; systemInstructions?: string; modelId?: string } & WorkflowInputs)
	| ({ type: 'condition'; condition?: WorkflowCondition } & WorkflowInputs)
	| ({ type: 'agent' | 'project'; targetId?: string } & WorkflowOperator)
	| ({ type: 'approval' | 'output'; instructions?: string } & WorkflowInputs)
	| ({ type: 'join' } & WorkflowInputs)
);

export type WorkflowNote = {
	id: string;
	text: string;
	position: { x: number; y: number };
};

/** Definition for credential-scoped, private, inactive drafts. Workflow owners configure disclosure in the app. */
export type WorkflowDefinition = {
	steps: WorkflowStep[];
	notes?: WorkflowNote[];
	limits: { maxParallelSteps: number; maxDurationMs: number };
};

export type WorkflowDraftCreate = {
	name: string;
	description?: string;
	definition: WorkflowDefinition;
};

export type WorkflowDraftUpdate = Partial<WorkflowDraftCreate> & { expectedRevision: number };

export type WorkflowData = {
	id: string;
	name: string;
	description: string;
	owner: boolean;
	role: 'admin' | 'editor' | 'viewer';
	canEdit: boolean;
	definition: WorkflowDefinition | null;
	revision: number;
	enabled: boolean;
	nextRunAt: string | null;
	archivedAt: string | null;
	visibility: 'private' | 'workspace';
	createdAt: string;
	updatedAt: string;
};

const path = '/workspace/workflows';

/** Author and inspect private, inactive Workflow drafts owned by this credential. */
export class Workflows {
	#transport: Transport;

	constructor(transport: Transport) {
		this.#transport = transport;
	}

	list() {
		return listing<WorkflowData>(this.#transport, path);
	}

	get(id: Identifier) {
		return get<WorkflowData>(this.#transport, `${path}/${identifier(id)}`);
	}

	createDraft({ name, description, definition }: WorkflowDraftCreate) {
		return action<WorkflowData>(this.#transport, path, 'POST', { name, description, definition });
	}

	updateDraft(id: Identifier, { expectedRevision, name, description, definition }: WorkflowDraftUpdate) {
		return action<WorkflowData>(this.#transport, `${path}/${identifier(id)}`, 'PATCH', {
			expectedRevision,
			name,
			description,
			definition,
		});
	}
}
