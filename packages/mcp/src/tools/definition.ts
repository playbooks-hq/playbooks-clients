import type { Toolset } from 'src/options.js';
import { z } from 'zod';

export interface ToolOption {
	flag: string;
	description: string;
	kind?: 'number' | 'boolean';
	required?: boolean;
}

export interface ToolDefinition {
	command: string;
	description: string;
	toolset: Toolset;
	readOnly: boolean;
	destructive: boolean;
	options: Record<string, ToolOption>;
	positional?: string;
	dataFields?: string[];
	dataOptional?: boolean;
}

export const toolName = (tool: ToolDefinition) => `playbooks_${tool.command.replaceAll(' ', '_')}`;

export const inputSchema = (tool: ToolDefinition) => {
	const shape: Record<string, z.ZodType> = {};
	for (const [name, option] of Object.entries(tool.options)) {
		let field: z.ZodType =
			option.kind === 'boolean'
				? z.boolean()
				: option.kind === 'number'
					? z.number().int().nonnegative()
					: z.string().min(1);
		if (name === tool.positional) field = z.string().regex(/^[1-9][0-9]*$/);
		field = field.describe(option.description);
		shape[name] = name === 'confirm' ? field.default(false) : option.required ? field : field.optional();
	}
	if (tool.dataFields) {
		const field = z
			.record(z.string(), z.json())
			.describe(
				`JSON body. Supported fields: ${tool.dataFields.join(', ') || 'none (empty object)'}. The CLI validates field values and required revisions. Sent through stdin.`,
			);
		shape.data = tool.dataOptional ? field.optional() : field;
	}
	return z.strictObject(shape);
};
