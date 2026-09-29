/** Server-side credentials are supplied explicitly; no local configuration is read. */
export interface ClientOptions {
	token?: string;
	workspace?: string;
	baseUrl?: string;
}

/** Endpoint-specific metadata is returned without page-base conversion. */
export interface Page {
	page?: number;
	pageSize?: number;
	totalRecords?: number;
	hasMore?: boolean;
	nextCursor?: string | null;
}

export interface ApiResponse<T> {
	data: T;
	meta?: Page;
}

/** Small public API surface, derived from Server's public schemas and serializers. */
export interface WorkspaceSummary {
	id: number;
	uuid: string;
	name: string;
}

export interface Workspace extends WorkspaceSummary {
	type?: 'personal' | 'collaborative';
	thumbnail?: string | null;
	description?: string | null;
	tagline?: string | null;
	visibility?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Project {
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
	/** Ordinary Projects use the Server's one-based page convention. */
	page?: number;
	pageSize?: number;
	query?: string;
	sortProp?: 'id' | 'name' | 'createdAt' | 'updatedAt';
	sortValue?: 'asc' | 'desc';
	folderId?: number;
	projectOwnerId?: number;
}
