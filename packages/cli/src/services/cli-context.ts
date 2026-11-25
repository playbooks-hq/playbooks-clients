import { randomUUID } from 'node:crypto';
import { chmod, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import { apiURL, CliError } from 'src/services/cli-client';
import { authOrigin, type OAuthSession, refreshSession, revokeSession } from 'src/services/cli-oauth';

type CredentialSource = 'browserSession' | 'storedDeveloperKey' | 'environmentDeveloperKey';

type ActiveCredential = { token: string; source: CredentialSource };

type Credentials = { origin: string } & ({ token: string } | ({ issuer: string } & OAuthSession));

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

	private get credentialsPath() {
		return `${this.path}.credentials`;
	}

	private async credentials(): Promise<Credentials | null> {
		return this.readJSON(this.credentialsPath);
	}

	private async withCredentialLock<T>(operation: () => Promise<T>): Promise<T> {
		// MCP can run a separate CLI process for each tool call. Only one may rotate a refresh token.
		const lockPath = `${this.credentialsPath}.lock`;
		await mkdir(dirname(lockPath), { recursive: true, mode: 0o700 });
		const { tryLock } = (await import('fs-native-extensions')).default;
		const lock = await open(lockPath, 'a+', 0o600);
		try {
			const deadline = Date.now() + 20_000;
			while (!tryLock(lock.fd)) {
				if (Date.now() >= deadline)
					throw new CliError(409, 'Credential storage is busy. Retry once the other command finishes.');
				await delay(150);
			}
			return await operation();
		} finally {
			// The OS releases the lock on close or process exit. Keep the file's inode stable.
			await lock.close();
		}
	}

	private validateOrigin(credentials: Credentials) {
		if (credentials.origin !== new URL(apiURL()).origin)
			throw new CliError(
				401,
				'Stored credentials belong to a different API origin. Sign in with an isolated --config.',
			);
		if ('issuer' in credentials && credentials.issuer !== authOrigin())
			throw new CliError(
				401,
				'Stored credentials belong to a different sign-in issuer. Sign in with an isolated --config.',
			);
	}

	async credential(): Promise<ActiveCredential | undefined> {
		if (process.env.PLAYBOOKS_TOKEN) return { token: process.env.PLAYBOOKS_TOKEN, source: 'environmentDeveloperKey' };
		const credentials = await this.credentials();
		if (!credentials) return;
		this.validateOrigin(credentials);
		if ('token' in credentials) return { token: credentials.token, source: 'storedDeveloperKey' };
		if (credentials.expiresAt > Date.now() + 30_000)
			return { token: credentials.accessToken, source: 'browserSession' };
		return this.withCredentialLock(async () => {
			const current = await this.credentials();
			if (!current) return;
			this.validateOrigin(current);
			if ('token' in current) return { token: current.token, source: 'storedDeveloperKey' };
			if (current.expiresAt > Date.now() + 30_000) return { token: current.accessToken, source: 'browserSession' };
			const refreshed = await refreshSession(current.issuer, current.refreshToken);
			await this.writeJSON(this.credentialsPath, { origin: current.origin, issuer: current.issuer, ...refreshed });
			return { token: refreshed.accessToken, source: 'browserSession' };
		});
	}

	async login(credential: { token: string } | ({ issuer: string } & OAuthSession)) {
		await this.withCredentialLock(async () => {
			const existing = await this.credentials();
			if (existing && 'issuer' in existing) {
				this.validateOrigin(existing);
				await revokeSession(existing.issuer, existing.refreshToken);
			}
			await this.write({ version: 1 });
			await this.writeJSON(this.credentialsPath, { origin: new URL(apiURL()).origin, ...credential });
		});
	}

	async logout() {
		await this.withCredentialLock(async () => {
			const existing = await this.credentials();
			if (existing && 'issuer' in existing) {
				this.validateOrigin(existing);
				await revokeSession(existing.issuer, existing.refreshToken);
			}
			await rm(this.credentialsPath, { force: true });
			await this.write({ version: 1 });
		});
	}
}
