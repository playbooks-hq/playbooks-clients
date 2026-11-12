/** Server-side credentials are supplied explicitly; no local configuration is read. */
export interface ClientOptions {
	apiKey?: string;
	baseUrl?: string;
}

export interface PageMeta {
	pagination: 'page';
	page: number;
	pageSize: number;
	totalRecords: number;
	hasMore: boolean;
	[key: string]: unknown;
}
export interface CursorMeta {
	pagination: 'cursor';
	pageSize: number;
	hasMore: boolean;
	nextCursor: string | null;
	[key: string]: unknown;
}
export type Page = PageMeta | CursorMeta;

export interface ApiResponse<T> {
	data: T;
	meta?: Page;
}

/** Core fields derived from Server's public schemas and serializers. */
export interface WorkspaceSummary {
	id: number;
	uuid: string;
	name: string;
}

export interface WorkspaceData extends WorkspaceSummary {
	type?: 'personal' | 'collaborative';
	thumbnail?: string | null;
	description?: string | null;
	tagline?: string | null;
	visibility?: string;
	createdAt?: string;
	updatedAt?: string;
}

export type ResourceVisibility = 'workspace' | 'private';
export type ResourceRole = 'admin' | 'editor' | 'viewer';
export interface ResourceAccess {
	role: ResourceRole | null;
	external: boolean;
	capabilities: Record<string, boolean>;
}

export interface ProjectData {
	visibility: ResourceVisibility;
	access: ResourceAccess;
	id: number;
	uuid: string;
	ownerUserId: number;
	createdByUserId?: number | null;
	name: string;
	description?: string | null;
	thumbnail?: string | null;
	status?: string;
	executionProfile?: 'application' | 'operational' | 'test';
	parentProjectId?: number | null;
	resourceRevision?: string;
	childContext?: {
		profile: 'operational' | 'test';
		executionProjectId: number;
		parentProjectId: number;
		parentId: string;
		agentId?: string;
		testId?: string;
	};
	workspaceId?: number | null;
	promptId?: number | null;
	archived?: boolean;
	archivedAt?: string | null;
	lifecycleState?: string;
	duplicationPending?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface ProjectGetOptions {
	include?: string;
	agentId?: Identifier;
	testId?: Identifier;
}

export interface ProjectListOptions {
	include?: string;
	/** Pages are zero-based. */
	page?: number;
	pageSize?: number;
	query?: string;
	sortProp?: 'id' | 'name' | 'createdAt' | 'updatedAt';
	sortValue?: 'asc' | 'desc';
}

export type Identifier = string | number;
export interface RecordData {
	id?: Identifier;
	uuid?: string;
	name?: string;
	status?: string;
	[key: string]: unknown;
}
export interface ListOptions {
	page?: number;
	pageSize?: number;
	query?: string;
	include?: string;
	sortProp?: string;
	sortValue?: 'asc' | 'desc';
	sort?: string;
	available?: boolean;
}
export interface WorkspaceUpdate {
	name?: string;
	thumbnail?: string | null;
	tagline?: string | null;
	description?: string | null;
	visibility?: 'public' | 'private';
	urls?: Record<string, string>;
}
export interface ProjectCreate {
	name?: string;
	description?: string;
}
export interface ProjectUpdate {
	revision?: string;
	name?: string;
	description?: string;
	thumbnail?: string | null;
}
export interface NamedInput {
	name?: string;
	description?: string;
}
export interface LibraryInput {
	name?: string;
	files?: Record<string, string>;
	revision?: string;
}
export interface SettingsInput {
	mode?: 'plan' | 'execute';
	deliveryMode?: 'queue' | 'steer';
	instructions?: string;
	modelId?: number;
	permissions?: 'autonomous' | 'critical' | 'all';
	opinionPolicy?: string;
	inferenceProviderMode?: string;
	inferenceProjectConnectorId?: number | null;
	revision?: string;
}
export interface MessageInput {
	attachments?: { mediaId: number }[];
	text: string;
	mode?: 'plan' | 'execute';
	modelId?: number;
	deliveryMode?: 'queue' | 'steer';
	replyToMessageId?: number;
	maxCredits?: number | null;
	idempotencyKey?: string;
}
export interface MessageUpdate {
	text?: string;
	queuedMode?: 'plan' | 'execute';
	queuedModelId?: number;
}
export interface MessageOptions {
	cursor?: string;
	pageSize?: number;
}
export interface FileUpload {
	name: string;
	content: Blob | Uint8Array;
	expectedRevision?: string | null;
}
export interface WaitOptions {
	timeoutMs?: number;
	signal?: AbortSignal;
}
export interface StreamOptions {
	signal: AbortSignal;
	onActivity?: () => void;
}
export interface StreamEvent {
	event: string;
	data: any;
}
export interface ScheduleReference {
	type: string;
	uuid: string;
	start: number;
	length: number;
	label: string;
}
export interface ScheduleAttachment {
	mediaId: number;
}

export interface ChatScheduleTiming {
	frequency: 'daily' | 'weekly' | 'monthly';
	weekday?: number | null;
	monthDay?: number | null;
	time: string;
	timezone: string;
}
export interface ChatScheduleInput extends ChatScheduleTiming {
	name: string;
	instructions: string;
	references?: ScheduleReference[];
	attachments?: ScheduleAttachment[];
	enabled: boolean;
}
export type ChatScheduleCreate = ChatScheduleInput & {
	idempotencyKey: string;
	originConversationId?: string;
	originMessageId?: number;
};
export type ChatScheduleMutation = { expectedRevision: number } & (
	| { action: 'update'; changes: ChatScheduleInput }
	| { action: 'pause' | 'resume' | 'delete' }
	| { action: 'run'; idempotencyKey: string }
);
export interface ScheduleInput {
	originConversationId?: number;
	name: string;
	instructions: string;
	references?: ScheduleReference[];
	attachments?: ScheduleAttachment[];
	modelId?: number;
	branchId?: number;
	enabled?: boolean;
	recurrence?: string | null;
	time?: string | null;
	timezone?: string | null;
}
export type ScheduleUpdate = Partial<Omit<ScheduleInput, 'originConversationId'>> & { revision: number };
export interface ScheduleRunInput {
	revision: number;
	requestKey: string;
}
export interface DnsRecordInput {
	type?: string;
	name?: string;
	value?: string;
	ttl?: number;
	priority?: number;
	port?: number;
	weight?: number;
}
export interface SourceInput {
	provider?: string;
	githubInstallationId?: number;
	githubRepositoryId?: number;
	workspaceConnectorId?: number;
	workspace?: string;
	repository?: string;
	repositoryId?: Identifier;
	namespaceId?: Identifier;
	repositoryName?: string;
	subdirectory?: string;
	preserveSource?: boolean;
}
export interface ActionReceipt extends RecordData {
	status?: string;
}

export type TemplateKind = 'agent' | 'chat' | 'project';

export interface TemplateSetupRequirement {
	kind?: 'connector' | 'mcp' | 'browser' | 'channel' | (string & {});
	key?: string;
	name?: string;
	requiresSetup?: boolean;
}

export interface TemplatePackageItem {
	name?: string;
	key?: string;
	path?: string;
	size?: number;
	artifactId?: string;
	versionId?: string;
	entryPoint?: string;
	category?: string;
	environment?: string;
	provider?: string;
	checksum?: string;
	requiresSetup?: boolean;
	setupVariables?: string[];
	missingDependencies?: Array<string | { name?: string; key?: string }>;
	connectorSetup?: Array<string | { name?: string; key?: string }>;
}

/** Safe inventory only; package bytes and account credentials are never returned here. */
export interface TemplatePackageSummary {
	format?: number;
	kind?: TemplateKind;
	files?: number;
	fileInventory?: TemplatePackageItem[];
	artifactInventory?: TemplatePackageItem[];
	services?: TemplatePackageItem[];
	runtimes?: TemplatePackageItem[];
	skills?: TemplatePackageItem[];
	designs?: TemplatePackageItem[];
	connectors?: TemplatePackageItem[];
	mcps?: TemplatePackageItem[];
	scheduleInventory?: TemplatePackageItem[];
	subagentInventory?: TemplatePackageItem[];
	setupRequirements?: TemplateSetupRequirement[];
	agents?: number;
	subagents?: number;
	schedules?: number;
	conversations?: number;
	excluded?: string[];
	configuration?: {
		instructions?: boolean;
		model?: { provider: string; providerModelId: string } | null;
		enabledTools?: string[];
		operatorRelease?: string;
		budget?: { creditBudget?: number | null; budgetStopNewWork?: boolean };
	};
}

export interface TemplateVersionData extends RecordData {
	uuid?: string;
	version?: string;
	major?: number;
	minor?: number;
	patch?: number;
	status?: string;
	notes?: string | null;
	publishedAt?: string | null;
	bundleSummary?: TemplatePackageSummary;
}

export interface TemplateData extends RecordData {
	kind?: TemplateKind;
	description?: string | null;
	tagline?: string | null;
	liveUrl?: string | null;
	chatUuid?: string | null;
	projectUuid?: string | null;
	agentUuid?: string | null;
	visibility?: string;
	licenseId?: number;
	categoryIds?: number[];
	bundleSummary?: TemplatePackageSummary;
	currentVersion?: TemplateVersionData | null;
}
export interface MemberData extends RecordData {
	userId?: number;
	memberRole?: string;
	status?: 'active' | 'deactivated' | 'removing';
	deactivatedAt?: string | null;
	revision?: string;
}
export interface MemberListOptions extends ListOptions {
	role?: string;
	status?: 'active' | 'deactivated' | 'all';
}
export interface MemberGovernance {
	revision: string;
	member: { id: number; name: string };
	status: 'active' | 'deactivated' | 'removing';
	blockers: string[];
	capabilities: { canDeactivate: boolean; canReactivate: boolean; canReassign: boolean; canRemove: boolean };
	retention: { reason: string | null; expiresAt: string | null; status: string | null };
}
export interface ProjectAgentData extends RecordData {
	description?: string | null;
	revision?: string | number;
	projectId?: number;
}
export interface ChatComposerOverrides {
	instructions?: string | null;
	modelId?: number | null;
	mode?: 'plan' | 'execute' | null;
	deliveryMode?: 'queue' | 'steer' | null;
	permissions?: 'autonomous' | 'critical' | 'all' | null;
}
export interface ChatData extends RecordData {
	id: number;
	uuid: string;
	ownerUserId: number;
	creator?: { id: number; uuid: string; name: string } | null;
	revision: number;
	conversationId: number;
	conversation?: ConversationData;
}
export interface ChatCreate {
	idempotencyKey: string;
	name?: string;
}
export type ChatUpdate = { revision: number } & (
	| { action: 'rename'; name: string }
	| { action: 'archive' | 'restore' }
	| { action: 'delete'; confirmation: string }
);
export interface LibraryData extends RecordData {
	files?: Record<string, string>;
	revision?: string;
}
export interface ScheduleData extends Omit<RecordData, keyof ScheduleInput>, ScheduleInput {
	revision: number;
	projectId: number;
	projectAgentId?: number | null;
	projectTestId?: number | null;
	configurationIssue?: string | null;
	nextOccurrenceAt?: string | null;
}
export interface ConversationData extends RecordData {
	workspaceId?: number;
	projectId?: number | null;
	latestBranchId?: number | null;
}
export interface MessageData extends RecordData {
	text?: string | null;
	role?: string;
	intent?: string;
	branchId?: number | null;
	conversationId?: number | null;
	environment?: string;
	latestRun?: RunData;
}
export interface RunData extends RecordData {
	conversationId?: number;
	messageId?: number;
	branchId?: number | null;
	startedAt?: string | null;
	finishedAt?: string | null;
}
export interface RunListOptions extends ListOptions {
	messageId?: number;
	branchId?: number;
	conversationId?: string;
}
export interface ReleaseData extends RecordData {
	deployId?: number;
	title?: string;
	live?: boolean;
	phase?: string | null;
}
export interface TemplateListOptions extends ListOptions {
	category?: string;
	kind?: TemplateKind;
}
export interface ExploreTemplateListOptions {
	page?: number;
	pageSize?: number;
	search?: string;
	query?: string;
	include?: string;
	kind?: TemplateKind;
	view?: 'discover' | 'popular' | 'recent' | 'following';
	category?: string;
	/** Required for Following; sent as the Workspace header, never a query parameter. */
	workspace?: string;
}
export interface TemplatePublish {
	notes?: string;
	bump?: 'patch' | 'minor' | 'major';
}
export interface TemplateSourceReview {
	sourceRevision: string;
	expectedRevision: string;
	bundleSummary: TemplatePackageSummary;
}
export interface TemplateRemixResult extends RecordData {
	id: number;
	uuid: string;
	name: string;
	kind: TemplateKind;
	webPath: string;
	templateVersionId: number;
	setup: TemplatePackageSummary;
	attribution: {
		sourceVersionId: number;
		packageChecksum: string;
	};
}
export interface ChatTemplateSetup {
	templateVersionId: number;
	resources: {
		files: Array<{ key: string; name: string; checksum: string; size?: number; imported: boolean }>;
		designs: Array<{ key: string; name: string; checksum: string; size?: number; imported: boolean }>;
		skills: Array<{ key: string; name: string; checksum: string; size?: number; imported: boolean }>;
		connectors: Array<{
			key: string;
			name: string;
			operations: string[];
			requiresSetup: true;
			definition?: Record<string, unknown>;
		}>;
		mcps: Array<{
			key: string;
			name: string;
			operations: string[];
			requiresSetup: true;
			definition?: Record<string, unknown>;
		}>;
	};
}
export interface ChatTemplateSetupItem {
	key: string;
	category: 'files' | 'designs' | 'skills';
	name: string;
	checksum: string;
	content?: string;
	mimeType?: string;
	files?: Array<{ path: string; content: string; encoding: 'base64' }>;
}
export interface ChatTemplateImport {
	category: 'files' | 'designs' | 'skills';
	keys: string[];
	acknowledgment: true;
	idempotencyKey: string;
}
export interface ChatTemplateImportResult {
	category: ChatTemplateImport['category'];
	items: Array<{ key: string; id: number; uuid: string; name: string }>;
	idempotencyKey: string;
}
export interface TemplateUpdate {
	name?: string;
	description?: string;
	tagline?: string;
	thumbnail?: string | null;
	cover?: string | null;
	liveUrl?: string | null;
	categoryIds?: number[];
	visibility?: 'private' | 'unlisted' | 'public';
}
export interface BudgetUpdate {
	creditBudget?: number | null;
	budgetStopNewWork?: boolean;
	budgetAlertThresholds?: number[];
	budgetRecipientMode?: string;
	budgetRecipientIds?: number[];
	budgetEmail?: boolean;
}

export interface MemberUpdate {
	memberRole: string;
}

export interface LogOptions {
	query?: string;
	pageSize?: number;
	cursor?: string;
}
export interface LogData extends RecordData {
	message?: string;
	timestamp?: string;
}
export interface ProjectAgentCreate {
	name: string;
	description?: string;
	thumbnail?: string;
	creationKey?: string;
}
export interface ProjectAgentUpdate {
	status: string;
	revision: string | number;
}

export interface InboxListOptions {
	page?: number;
	pageSize?: number;
	view?: 'attention' | 'mentions' | 'all';
	scope?: 'all' | 'workspace' | `project:${string}`;
	type?: 'all' | 'approval' | 'question' | 'review' | 'failure' | 'mention' | 'reply' | 'report';
	search?: string;
	conversation?: string;
}

export interface InboxCounts {
	all: number;
	attention: number;
	mentions: number;
	unread: number;
}

export interface InboxItem extends RecordData {
	id: number;
	uuid: string;
	title: string;
	excerpt: string;
	unread: boolean;
	unreadBranchCount: number;
	needsAttention: boolean;
	running: boolean;
	requests: RecordData[];
	canonicalPath: string;
}

export interface InboxReadInput {
	throughMessageId: number;
	/** Required for Project conversations; omit or use null for unbranched conversations. */
	branchId?: number | null;
}

/** Environment lifecycle uses the parent management API; execution uses the child Project. */
export type ProjectTestAction =
	| 'test'
	| 'data'
	| 'reset'
	| 'delete'
	| 'stop'
	| 'sleep'
	| 'refresh'
	| 'reset-workspace'
	| 'preview-start'
	| 'preview-stop'
	| 'preview-restart';
export interface ProjectTestCreate {
	requestKey: string;
	name?: string;
	instructions?: string;
	branchId?: number;
	intent?: 'custom' | 'auth' | 'payments';
	authMethod?: string;
}
export interface ProjectTestActionInput {
	replacesOperationId?: string;
	intent?: 'custom' | 'auth' | 'payments';
	authMethod?: string;
	requestKey?: string;
	revision?: string;
	confirm?: boolean;
	operationId?: string;
	instructions?: string;
	attachments?: { mediaId: number }[];
}

export interface ConversationForkInput {
	submissionKey: string;
	throughMessageId?: number;
	branchId?: number;
}
export interface MessageResponseInput {
	idempotencyKey: string;
	parts: Record<string, unknown>[];
	text?: string;
	maxCredits?: number | null;
}

/** Conversation-attributed work; reads and activity in other conversations are excluded. */
export type ConversationUtilityKind = 'files' | 'artifacts' | 'sources' | 'subagents' | 'plans';
export interface ConversationUtilityListOptions extends ListOptions {
	kind: ConversationUtilityKind;
	search?: string;
	type?: string;
}

export interface SharedResourceListOptions {
	type?: 'all' | 'chats' | 'agents' | 'projects';
	q?: string;
	workspaceUuid?: string;
	limit?: number;
	cursor?: string;
}

export interface SharedResourceData {
	type: 'chat' | 'agent' | 'project';
	uuid: string;
	name: string;
	workspace: { uuid: string; name: string };
	role: 'admin' | 'editor' | 'viewer';
	visibility: 'workspace' | 'private';
	archived: boolean;
	access: { external: true };
}

export interface SharedResourcePage {
	items: SharedResourceData[];
	nextCursor: string | null;
}
