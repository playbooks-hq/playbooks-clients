import type { ToolDefinition } from 'src/tools/definition.js';
import { z } from 'zod';

const workspace = { flag: 'workspace', description: 'Explicit Workspace UUID.', required: true };
const workflow = { flag: 'workflow', description: 'Workflow UUID.', required: true };

const namedResult = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/);
const step = z.strictObject({
	id: namedResult,
	title: z.string().min(1).max(120).optional(),
	position: z.strictObject({ x: z.number(), y: z.number() }).optional(),
	dependsOn: z.array(namedResult).max(49).describe('Required predecessor IDs.'),
	branches: z
		.record(namedResult, z.boolean())
		.describe('Map Condition predecessor IDs in dependsOn to the outcome required to take this branch.')
		.optional(),
	inputs: z
		.record(namedResult, z.strictObject({ stepId: namedResult, result: namedResult }))
		.describe('Names mapped to explicitly selected results declared by upstream steps.')
		.optional(),
	outputs: z.array(namedResult).max(20).describe('Names of the results this step makes available.').optional(),
});
const targetId = z
	.string()
	.regex(/^(?:[a-z][a-z0-9]{11}|[a-z0-9](?:[a-z0-9-]{0,18}[a-z0-9])?-[a-z0-9]{8})$/)
	.describe('Public Agent or Project resource ID.')
	.optional();
const instructions = z.string().max(20_000).optional();
const operator = step.extend({
	instructions,
	references: z
		.array(
			z.strictObject({
				type: z.enum([
					'mcp',
					'connector',
					'file',
					'design',
					'skill',
					'member',
					'project',
					'workspace',
					'template',
					'collection',
					'conversation',
				]),
				uuid: z.string().min(1).max(64),
				label: z.string().min(1).max(200),
				start: z.number().int().min(0).max(20_000),
				length: z.number().int().min(2).max(201),
			}),
		)
		.max(10)
		.describe('Exact resource mentions in the saved instructions.')
		.optional(),
});
const targetedOperator = operator.omit({ inputs: true }).extend({ targetId });
const definition = z.strictObject({
	steps: z
		.array(
			z.discriminatedUnion('type', [
				step.extend({
					type: z.literal('trigger'),
					schedule: z
						.strictObject({
							frequency: z.enum(['daily', 'weekdays', 'weekly', 'monthly']),
							time: z.string().describe('Local time as HH:mm.'),
							timezone: z.string().describe('IANA time zone.'),
							weekday: z.number().int().min(0).max(6).optional(),
							monthDay: z.number().int().min(1).max(31).optional(),
						})
						.describe('Omit for manual initiation.')
						.optional(),
				}),
				operator.extend({
					type: z.literal('chat'),
					creditBudget: z
						.number()
						.min(0)
						.max(999999999999.9999)
						.describe('Optional hard credit budget for the new task Chat.')
						.optional(),
					sources: z
						.array(
							z.strictObject({
								chatId: z.string(),
								conversationId: z.string(),
								sourceId: z.uuid(),
								versionId: z.uuid(),
							}),
						)
						.max(5)
						.describe('Exact retained Source versions from authorized Chats in this Workspace.')
						.optional(),
				}),
				step.extend({
					type: z.literal('llm'),
					instructions,
					systemInstructions: instructions,
					modelId: z.string().min(1).max(150).describe('Optional public model ID.').optional(),
				}),
				step.extend({
					type: z.literal('condition'),
					condition: z
						.strictObject({
							input: namedResult.describe('An input alias explicitly bound to an upstream result.'),
							operator: z.enum([
								'equals',
								'notEquals',
								'greaterThan',
								'greaterThanOrEqual',
								'lessThan',
								'lessThanOrEqual',
							]),
							value: z.union([z.string().max(2_000), z.number(), z.boolean()]),
						})
						.describe('Compare a saved result to a typed value.')
						.optional(),
				}),
				targetedOperator.extend({ type: z.literal('agent') }),
				targetedOperator.extend({ type: z.literal('project') }),
				step.extend({ type: z.literal('approval'), instructions }),
				step.extend({ type: z.literal('join') }),
				step.extend({ type: z.literal('output'), instructions }),
			]),
		)
		.min(1)
		.max(50),
	notes: z
		.array(
			z.strictObject({
				id: namedResult,
				text: z.string().max(2_000),
				position: z.strictObject({ x: z.number(), y: z.number() }),
			}),
		)
		.max(50)
		.describe('Canvas notes for readers. Use IDs distinct from each other and from step IDs.')
		.optional(),
	limits: z.strictObject({
		maxParallelSteps: z.number().int().min(1).max(10),
		maxDurationMs: z.number().int().min(1_000).max(86_400_000),
	}),
});
const draft = z.strictObject({ name: z.string().min(1), description: z.string().optional(), definition });

export const workspaceWorkflowTools: ToolDefinition[] = [
	{
		command: 'workspace workflows',
		description: 'List private Workflow drafts that this credential can access.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: { workspace },
	},
	{
		command: 'workspace workflow',
		description: 'Read a Workflow draft and its current revision before preparing an edit.',
		toolset: 'workspace',
		readOnly: true,
		destructive: false,
		options: { workspace, workflow },
	},
	{
		command: 'workspace workflow create',
		description:
			'Save a private, inactive Workflow draft and return its canvas URL. Ask about the trigger, tasks, target resources, approval, and deliverable as needed. Use exactly one trigger. Parallel tasks share a predecessor. Use a Condition with explicit true and false branch dependencies, and explicitly bind values a task consumes. An output retains only explicitly bound upstream results. Leave uncertain choices unset for review. Creation never activates recurrence or starts a run. The Workflow owner can configure shared review material and results in the app.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace },
		dataSchema: draft,
	},
	{
		command: 'workspace workflow update',
		description:
			'Save reviewed changes to a private inactive Workflow, using expectedRevision from the inspected draft. Include the complete graph and any retained canvas notes when changing its definition. If the revision changed, inspect the latest draft and reconcile the edit. Returns the canvas URL.',
		toolset: 'workspace',
		readOnly: false,
		destructive: false,
		options: { workspace, workflow },
		dataSchema: draft.partial().extend({ expectedRevision: z.number().int().positive() }),
	},
];
