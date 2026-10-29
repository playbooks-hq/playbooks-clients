import { action, get, identifier, listing } from 'src/resource.js';
import type { Transport } from 'src/transport.js';
import type { Identifier, ListOptions } from 'src/types.js';

export interface AssetData {
	uuid: string;
	name: string;
	versionId: string;
	checksum: string;
	scope: 'local' | 'workspace';
	mediaType: string;
	size: number;
}
export class Assets {
	constructor(private transport: Transport) {}
	list(options?: ListOptions) {
		return listing<AssetData>(this.transport, '/workspace/assets', options);
	}
	get(id: Identifier, version?: string) {
		return get<AssetData>(this.transport, `/workspace/assets/${identifier(id)}`, { version });
	}
	versions(id: Identifier) {
		return get<AssetData[]>(this.transport, `/workspace/assets/${identifier(id)}/versions`);
	}
	source(id: Identifier, version: string, offset = 0) {
		return get(this.transport, `/workspace/assets/${identifier(id)}/source`, { version, offset });
	}
	preview(id: Identifier, version: string) {
		return get(this.transport, `/workspace/assets/${identifier(id)}/preview`, { version });
	}
	download(id: Identifier, version: string, companion?: 'blend' | 'py'): Promise<Uint8Array> {
		return this.transport.request(
			`/workspace/assets/${identifier(id)}/download`,
			'GET',
			undefined,
			{ version, companion },
			true,
			true,
		);
	}
	save(id: Identifier, input: { version: string; requestId: string }) {
		return action<AssetData>(this.transport, `/workspace/assets/${identifier(id)}/save`, 'POST', input);
	}
}
