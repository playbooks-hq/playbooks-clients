import { randomUUID } from 'node:crypto';
import { chmod, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { apiURL } from 'src/services/cli-client';

export interface ContextData {
	version: 1;
	workspace?: string;
}

export class CliContext {
	constructor(readonly path: string) {}

	async read(): Promise<ContextData> {
		const data = await this.readJSON(this.path);
		if (!data) return { version: 1 };
		if (data.version !== 1) throw new Error('Unsupported config. Choose a new --config file and sign in again.');
		return { version: 1, ...(data.workspace !== undefined ? { workspace: data.workspace } : {}) };
	}

	async readJSON(path: string) {
		try {
			return JSON.parse(await readFile(path, 'utf8'));
		} catch (error) {
			if (error.code === 'ENOENT') return null;
			throw new Error(`Cannot read ${path}: expected a valid JSON configuration.`);
		}
	}

	async write(data: ContextData) {
		await this.writeJSON(this.path, { version: 1, workspace: data.workspace });
	}

	async writeJSON(path: string, data: object) {
		await mkdir(dirname(path), { recursive: true, mode: 0o700 });
		const temporary = `${path}.${randomUUID()}.tmp`;
		try {
			await writeFile(temporary, JSON.stringify(data, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
			await rename(temporary, path);
			await chmod(path, 0o600);
		} finally {
			await rm(temporary, { force: true });
		}
	}

	async token() {
		if (process.env.PLAYBOOKS_TOKEN) return process.env.PLAYBOOKS_TOKEN;
		const credentials = await this.readJSON(`${this.path}.credentials`);
		if (credentials && credentials.origin !== new URL(apiURL()).origin)
			throw new Error('Stored credentials belong to a different API origin. Sign in with an isolated --config.');
		return credentials?.token;
	}

	async login(token: string) {
		await this.write({ version: 1 });
		await this.writeJSON(`${this.path}.credentials`, { token, origin: new URL(apiURL()).origin });
	}

	async logout() {
		await rm(`${this.path}.credentials`, { force: true });
		await this.write({ version: 1 });
	}
}
