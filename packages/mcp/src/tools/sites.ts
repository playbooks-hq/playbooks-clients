import type { ToolDefinition } from 'src/tools/definition.js';

export const siteTools: ToolDefinition[] = [
	{
		command: 'site preview',
		description: 'Read the current deployed page preview metadata.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
		},
	},
	{
		command: 'site preview refresh',
		description: 'Refresh deployed page preview metadata without changing the release.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
		},
	},
	{
		command: 'sites',
		description: 'List Sites independently of Project access.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
		},
	},
	{
		command: 'site',
		description: 'Inspect Site health, source, current release and management capabilities.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
	},
	{
		command: 'site create',
		description: 'Create a Site with an optional same-Workspace Project component or Chat/Agent static source.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
		},
		dataFields: ['name', 'kind', 'source'],
	},
	{
		command: 'site update',
		description: 'Rename a Site.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
		dataFields: ['name'],
	},
	{
		command: 'site source',
		description: 'Inspect the source connection.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
	},
	{
		command: 'site source connect',
		description: 'Connect this Site to an authorized Project component or eligible Chat static output.',
		toolset: 'core',
		readOnly: false,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
		dataFields: ['type', 'id', 'componentKey', 'expectedSource'],
	},
	{
		command: 'site source disconnect',
		description: 'Disconnect the source while preserving live content, data and retained releases.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm this exact reviewed action when requested by the user.',
			},
		},
		dataFields: ['expectedSource'],
	},
	{
		command: 'site release-options',
		description:
			'Inspect available saved source revisions and explicit component declarations. Inference does not establish readiness.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
	},
	{
		command: 'site preflight',
		description:
			'Review requirements and capture immutable source revision, current release and Site configuration revision.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
		dataFields: [
			'expectedSource',
			'sourceRevision',
			'componentKey',
			'expectedCurrentReleaseId',
			'expectedConfigRevision',
		],
	},
	{
		command: 'site deploy',
		description:
			'Deploy exactly the reviewed component and revisions to this Site. Requires source and destination authority.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm this exact reviewed action when requested by the user.',
			},
			wait: {
				flag: 'wait',
				kind: 'boolean',
				description: 'Observe completion for up to five minutes; inspect the same release after timeout.',
			},
		},
		dataFields: [
			'expectedSource',
			'sourceRevision',
			'componentKey',
			'expectedCurrentReleaseId',
			'expectedConfigRevision',
			'requestId',
		],
	},
	{
		command: 'site redeploy',
		description:
			'Redeploy retained Site content using validated current Site configuration. Source access is unnecessary.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm this exact reviewed action when requested by the user.',
			},
			wait: {
				flag: 'wait',
				kind: 'boolean',
				description: 'Observe completion for up to five minutes; inspect the same release after timeout.',
			},
		},
		dataFields: ['retainedReleaseId', 'expectedCurrentReleaseId', 'expectedConfigRevision', 'requestId'],
	},
	{
		command: 'site rollback',
		description: 'Restore an eligible retained release without rolling back application data.',
		toolset: 'core',
		readOnly: false,
		destructive: true,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
			confirm: {
				flag: 'yes',
				kind: 'boolean',
				description: 'Confirm this exact reviewed action when requested by the user.',
			},
			wait: {
				flag: 'wait',
				kind: 'boolean',
				description: 'Observe completion for up to five minutes; inspect the same release after timeout.',
			},
		},
		dataFields: ['releaseId', 'expectedCurrentReleaseId'],
	},
	{
		command: 'site releases',
		description: 'List Site-owned releases.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
		},
	},
	{
		command: 'site release',
		description: 'Inspect a release status and provenance.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			site: {
				flag: 'site',
				description: 'Site UUID.',
				required: true,
			},
			release: {
				flag: 'release',
				description: 'Release UUID.',
				required: true,
			},
		},
	},
	{
		command: 'project sites',
		description: 'List authorized Site connections for a Project.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			project: {
				flag: 'project',
				description: 'Project UUID.',
				required: true,
			},
		},
	},
	{
		command: 'agent sites',
		description:
			'List authorized static Sites sourced from an Agent. Association and application grants do not grant Site access.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			agent: { flag: 'agent', description: 'Agent UUID.', required: true },
		},
	},
	{
		command: 'workspace chat sites',
		description: 'List authorized Site connections for a Chat.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: {
				flag: 'workspace',
				description: 'Explicit authorized Workspace UUID.',
				required: true,
			},
			chat: {
				flag: 'chat',
				description: 'Chat UUID.',
				required: true,
			},
		},
	},
];

siteTools.push(
	{
		command: 'site logs',
		description: 'Read Site production logs retained for seven days, optionally for one release.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
			release: { flag: 'release', description: 'Release UUID for historical logs.' },
			query: { flag: 'query', description: 'Search messages and request or trace identifiers.' },
			pageSize: { flag: 'page-size', description: 'Entries per page (1-500).', kind: 'number' },
			cursor: { flag: 'cursor', description: 'Cursor for older entries.' },
			after: { flag: 'after', description: 'Ingestion cursor for incremental reads.' },
			from: { flag: 'from', description: 'Earliest timestamp (ISO 8601).' },
			to: { flag: 'to', description: 'Latest timestamp (ISO 8601).' },
		},
	},
	{
		command: 'site log',
		description: 'Inspect one Site log entry and related request output.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
			log: { flag: 'log', description: 'Log entry identifier.', required: true },
			release: { flag: 'release', description: 'Release UUID.' },
		},
	},
	{
		command: 'site analytics',
		description: 'Inspect Site production request traffic, response statuses and latency.',
		toolset: 'core',
		readOnly: true,
		destructive: false,
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
			hours: { flag: 'hours', description: 'Time window: 1, 24, 168 or 720 hours (default 24).', kind: 'number' },
			service: { flag: 'service', description: 'Exact Site component key.' },
			route: { flag: 'route', description: 'Exact path, beginning with /.' },
			search: { flag: 'search', description: 'Substring filter for listed paths.' },
			offset: { flag: 'offset', description: 'Route-list offset (0-10000; default 0).', kind: 'number' },
		},
	},
);

const operationalTools: Array<{
	command: string;
	description: string;
	fields?: string[];
	id?: string;
	confirm?: boolean;
	readOnly?: boolean;
}> = [
	{ command: 'site config', description: 'Inspect Site production configuration.' },
	{
		command: 'site config update',
		description: 'Update Site production configuration with its revision.',
		fields: ['provider', 'region', 'runtimeProfile', 'runtimeUuid', 'lifecycleUuid', 'expectedConfigRevision'],
	},
	{ command: 'site visitor-policy', description: 'Inspect Site visitor access.' },
	{
		command: 'site visitor-policy update',
		description: 'Set Site visitor access with its configuration revision.',
		fields: ['mode', 'expectedConfigRevision'],
	},
	{ command: 'site credentials', description: 'List Site credential names and locked status without values.' },
	{
		command: 'site credential put',
		description: 'Store a Site production credential.',
		id: 'key',
		fields: ['value', 'expectedConfigRevision'],
	},
	{
		command: 'site credential delete',
		description: 'Remove an unlocked Site production credential.',
		id: 'key',
		fields: ['expectedConfigRevision'],
		confirm: true,
	},
	{ command: 'site domains', description: 'List Site domain bindings.' },
	{
		command: 'site domain bind',
		description: 'Assign a Workspace domain hostname to a Site.',
		fields: ['domainId', 'hostname', 'primary'],
	},
	{ command: 'site domain unbind', description: 'Remove a Site domain binding.', id: 'binding', confirm: true },
	{ command: 'site domain recheck', description: 'Check Site domain DNS and TLS readiness.', id: 'binding' },
	{ command: 'site collaborators', description: 'List Site collaborators.' },
	{
		command: 'site collaborator put',
		description: 'Grant or update accepted Site access.',
		fields: ['userId', 'role'],
	},
	{
		command: 'site collaborator delete',
		description: 'Remove Site collaborator access.',
		id: 'collaborator',
		confirm: true,
	},
	{ command: 'site invitations', description: 'List pending Site invitations.' },
	{ command: 'site invitation create', description: 'Invite a person to this Site.', fields: ['email', 'role'] },
	{
		command: 'site invitation resend',
		description: 'Resend a pending Site invitation.',
		id: 'invitation',
		readOnly: false,
	},
	{
		command: 'site invitation revoke',
		description: 'Revoke a pending Site invitation.',
		id: 'invitation',
		confirm: true,
	},
	{ command: 'site connections', description: 'List Site production connection assignments.' },
	{
		command: 'site connection create',
		description: 'Assign a Workspace connector account to this Site.',
		fields: ['connectorId', 'workspaceConnectorId', 'profile'],
	},
	{
		command: 'site connection update',
		description: 'Configure or activate a Site production connection.',
		id: 'connection',
		fields: ['profile', 'status'],
	},
	{
		command: 'site connection delete',
		description: 'Remove a Site production connection.',
		id: 'connection',
		confirm: true,
	},
	{ command: 'site database', description: 'Inspect Site database status.' },
	{ command: 'site storage', description: 'Inspect Site storage status.' },
	{ command: 'site monitoring config', description: 'Inspect Site monitoring configuration.' },
	{
		command: 'site monitoring config set',
		description: 'Configure Site monitoring.',
		fields: ['provider', 'framework', 'projectConnectorId', 'expectedConfigRevision'],
	},
	{ command: 'site monitoring synchronize', description: 'Synchronize Site monitoring.', fields: [] },
	{
		command: 'site monitoring overview',
		description: 'Inspect Site request performance.',
		fields: ['hours', 'search'],
		readOnly: true,
	},
	{
		command: 'site monitoring issues',
		description: 'List Site monitoring issues.',
		fields: ['hours', 'search', 'offset', 'status'],
		readOnly: true,
	},
	{ command: 'site monitoring issue', description: 'Inspect Site monitoring issue.', id: 'issue' },
	{
		command: 'site monitoring issue resolve',
		description: 'Resolve a Site monitoring issue.',
		id: 'issue',
		confirm: true,
	},
	{ command: 'site monitoring', description: 'Read Site production health.' },
	{ command: 'site jobs', description: 'List Site production job runs.' },
	{ command: 'site job', description: 'Inspect a Site job run.', id: 'job' },
	{
		command: 'site job retry',
		description: 'Retry an eligible failed Site job; external effects may repeat.',
		id: 'job',
		confirm: true,
	},
	{ command: 'site job cancel', description: 'Cancel an eligible pending Site job.', id: 'job', confirm: true },
	{ command: 'site schedules', description: 'List Site recurring job schedules.' },
	{
		command: 'site schedule activate',
		description: 'Activate or pause a Site job schedule.',
		id: 'schedule',
		fields: ['active'],
	},
	{ command: 'site lifecycle', description: 'Inspect Site lifecycle and cleanup receipts.' },
	{ command: 'site start', description: 'Start released Site compute.', fields: [] },
	{ command: 'site stop', description: 'Stop Site compute.', confirm: true },
	{ command: 'site archive', description: 'Archive a Site.', confirm: true },
	{ command: 'site restore', description: 'Restore an archived Site.', fields: [] },
	{ command: 'site delete', description: 'Delete a Site and purge managed resources.', confirm: true },
	{
		command: 'site database provision',
		description: 'Provision managed Site database.',
		fields: ['name', 'databaseName'],
	},
	{ command: 'site storage provision', description: 'Provision managed Site storage.', fields: ['name'] },
	{ command: 'site maps', description: 'List Site map capabilities.' },
	{
		command: 'site map set',
		description: 'Set a Site map capability.',
		id: 'capability',
		fields: ['provider', 'projectConnectorId', 'expectedConfigRevision'],
	},
	{ command: 'site database tables', description: 'List Site database tables.' },
	{ command: 'site database table create', description: 'Create a Site database table.', fields: ['name', 'columns'] },
	{ command: 'site database table', description: 'Inspect a Site database table.', id: 'table' },
	{
		command: 'site database table update',
		description: 'Update a Site database table.',
		id: 'table',
		fields: ['name', 'columns'],
	},
	{ command: 'site database table delete', description: 'Delete a Site database table.', id: 'table', confirm: true },
	{
		command: 'site database rows',
		description: 'List Site database rows.',
		id: 'table',
		fields: ['page', 'pageSize', 'sort', 'filter'],
		readOnly: true,
	},
	{ command: 'site database row create', description: 'Create a Site database row.', id: 'table', fields: ['data'] },
	{
		command: 'site database rows update',
		description: 'Update Site database rows.',
		id: 'table',
		fields: ['data', 'filter'],
	},
	{
		command: 'site database rows delete',
		description: 'Delete Site database rows.',
		id: 'table',
		fields: ['filter'],
		confirm: true,
	},
	{
		command: 'site database inspect-query',
		description: 'Inspect a read-only Site database query.',
		fields: ['sql'],
		readOnly: true,
	},
	{ command: 'site database query', description: 'Execute a Site database query.', fields: ['sql'], confirm: true },
	{ command: 'site database migrations', description: 'List Site database migrations.' },
	{
		command: 'site storage files',
		description: 'List Site storage files.',
		fields: ['path', 'page', 'pageSize'],
		readOnly: true,
	},
	{ command: 'site storage metadata', description: 'Inspect Site file metadata.', id: 'path' },
	{ command: 'site storage content', description: 'Read Site file bytes as base64.', id: 'path' },
	{ command: 'site storage download', description: 'Download Site file bytes as base64.', id: 'path' },
	{
		command: 'site storage upload',
		description: 'Upload an encoded Site file.',
		fields: ['path', 'content', 'contentType'],
	},
	{ command: 'site storage rename', description: 'Rename a Site file.', fields: ['path', 'newPath'] },
	{ command: 'site storage delete', description: 'Delete a Site file.', fields: ['path'], confirm: true },
	{ command: 'site storage folder create', description: 'Create a Site folder.', fields: ['path'] },
	{ command: 'site storage usage', description: 'Inspect Site storage usage.' },
	{ command: 'site analytics config', description: 'Inspect Site analytics provider forwarding and availability.' },
	{
		command: 'site analytics config set',
		description: 'Enable or disable forwarding to eligible Site analytics providers.',
		fields: ['enabled'],
	},
	{ command: 'site analytics source rotate', description: 'Rotate Site analytics source key.', confirm: true },
	{ command: 'site analytics providers', description: 'List Site analytics providers.' },
	{
		command: 'site analytics provider create',
		description: 'Create a Site analytics provider.',
		fields: ['provider', 'connectorId', 'credentialId', 'enabled', 'configuration'],
	},
	{ command: 'site analytics provider', description: 'Inspect a Site analytics provider.', id: 'provider' },
	{
		command: 'site analytics provider update',
		description: 'Update a Site analytics provider.',
		id: 'provider',
		fields: ['enabled', 'configuration'],
	},
	{
		command: 'site analytics provider delete',
		description: 'Delete a Site analytics provider.',
		id: 'provider',
		confirm: true,
	},
	{
		command: 'site analytics events',
		description: 'List Site analytics events.',
		fields: ['page', 'pageSize'],
		readOnly: true,
	},
	{ command: 'site analytics event', description: 'Inspect a Site analytics event.', id: 'event' },
	{
		command: 'site analytics deliveries',
		description: 'List Site analytics deliveries.',
		fields: ['page', 'pageSize'],
		readOnly: true,
	},
	{ command: 'site analytics delivery', description: 'Inspect a Site analytics delivery.', id: 'delivery' },
];
siteTools.push(
	...operationalTools.map(tool => ({
		command: tool.command,
		description: tool.description,
		toolset: 'core' as const,
		readOnly: tool.readOnly ?? (!tool.fields && !tool.confirm),
		destructive: Boolean(tool.confirm),
		options: {
			workspace: { flag: 'workspace', description: 'Explicit authorized Workspace UUID.', required: true },
			site: { flag: 'site', description: 'Site UUID.', required: true },
			...(tool.id ? { [tool.id]: { flag: tool.id, description: `${tool.id} identifier.`, required: true } } : {}),
			...(tool.confirm
				? {
						confirm: {
							flag: 'yes',
							kind: 'boolean' as const,
							description: 'Confirm this exact reviewed action when requested by the user.',
						},
					}
				: {}),
		},
		...(tool.fields ? { dataFields: tool.fields } : {}),
	})),
);
