import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

export const toolsets = ['core', 'operator', 'discovery', 'templates', 'workspace', 'project', 'local'] as const;
export type Toolset = (typeof toolsets)[number];
export interface ServerOptions {
	config: string;
	toolsets: Toolset[];
	readOnly: boolean;
	help: boolean;
}

export const parseOptions = (args: string[]): ServerOptions => {
	const { values } = parseArgs({
		args,
		strict: true,
		allowPositionals: false,
		options: {
			config: { type: 'string' },
			toolsets: { type: 'string', default: 'core,operator,discovery' },
			'read-only': { type: 'boolean', default: false },
			help: { type: 'boolean', default: false },
		},
	});
	const requested = values.toolsets!.split(',');
	if (requested.some(value => value !== 'all' && !toolsets.includes(value as Toolset)))
		throw new Error('Unknown toolset. Use core, operator, discovery, templates, workspace, project, local, or all.');
	if (values.config !== undefined && !values.config.trim()) throw new Error('--config requires a path.');
	return {
		config: path.resolve(values.config ?? path.join(os.homedir(), '.config/playbooks/config.json')),
		toolsets: requested.includes('all') ? [...toolsets] : ([...new Set(requested)] as Toolset[]),
		readOnly: values['read-only']!,
		help: values.help!,
	};
};
