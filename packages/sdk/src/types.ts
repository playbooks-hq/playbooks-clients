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

export interface ProjectData {
	id: number;
	uuid: string;
	name: string;
	description?: string | null;
	thumbnail?: string | null;
	status?: string;
	executionProfile?: 'application' | 'operational';
	parentProjectId?: number | null;
	workspaceId?: number | null;
	projectOwnerId?: number | null;
	folderId?: number | null;
	typeId?: number | null;
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
}

export interface ProjectListOptions extends ProjectGetOptions {
	/** Pages are zero-based. */
	page?: number;
	pageSize?: number;
	query?: string;
	sortProp?: 'id' | 'name' | 'createdAt' | 'updatedAt';
	sortValue?: 'asc' | 'desc';
	folderId?: number;
	projectOwnerId?: number;
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
	typeId?: number;
	folderId?: number;
}
export interface ProjectUpdate {
	name?: string;
	description?: string;
	thumbnail?: string | null;
	typeId?: number;
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
	permissions?: Record<string, unknown>;
	opinionPolicy?: string;
	inferenceProviderMode?: string;
	inferenceProjectConnectorId?: number | null;
	revision?: string;
}
export interface MessageInput {
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
export interface PublishInput {
	branchId?: number;
	expectedRevision: string;
}
export interface PreflightInput {
	branchId?: number;
	expectedRevision?: string;
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
export interface WorkflowInput {
	name?: string;
	status?: string;
	steps?: WorkflowStep[];
	schedule?: Record<string, unknown>;
	revision?: string;
}
export interface ScheduleInput {
	enabled?: boolean;
	recurrence?: string;
	time?: string;
	timezone?: string;
	actingUserId?: number;
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

export interface TemplateData extends RecordData {
	description?: string | null;
	tagline?: string | null;
	visibility?: string;
	licenseId?: number;
	categoryIds?: number[];
}
export interface FolderData extends RecordData {
	description?: string | null;
}
export interface MemberData extends RecordData {
	userId?: number;
	memberRole?: string;
}
export interface AgentData extends RecordData {
	description?: string | null;
	revision?: string | number;
	projectId?: number;
}
export interface LibraryData extends RecordData {
	files?: Record<string, string>;
	revision?: string;
}
export interface WorkflowData extends RecordData {
	revision?: number;
	projectId?: number;
	conversationId?: number;
	steps?: WorkflowStep[];
}
export interface WorkflowStep {
	key?: string;
	title: string;
	instructions: string;
}
export interface ConversationData extends RecordData {
	workspaceId?: number;
	projectId?: number | null;
	folderId?: number | null;
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
	projectType?: string;
}
export interface TemplateUpdate {
	name?: string;
	description?: string;
	tagline?: string;
	thumbnail?: string | null;
	cover?: string | null;
	licenseId?: number;
	categoryIds?: number[];
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

export interface PreflightData extends RecordData {
	status?: 'ready' | 'blocked';
	expectedRevision?: string;
	blockers?: { code: string; message: string }[];
	warnings?: string[];
	costImpact?: boolean;
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
export interface AgentCreate {
	name: string;
	description?: string;
	thumbnail?: string;
	creationKey?: string;
}
export interface AgentUpdate {
	status: string;
	revision: string | number;
}

export interface InboxListOptions {
	page?: number;
	pageSize?: number;
	view?: 'attention' | 'mentions' | 'all';
	scope?: 'all' | 'workspace' | `project:${string}` | `folder:${string}`;
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
