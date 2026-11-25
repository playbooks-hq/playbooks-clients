import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

import { apiURL, CliError } from 'src/services/cli-client';

const clientId = 'playbooks-cli';
const callbackPath = '/auth/callback/playbooks';
const productionAPI = 'https://api.playbooks.ai';
const productionIssuer = 'https://auth.playbooks.ai';
const loopbackHosts = ['localhost', '127.0.0.1', '[::1]'];

export interface OAuthSession {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
}

export const authOrigin = () => {
	const api = new URL(apiURL());
	const configured = process.env.PLAYBOOKS_AUTH_URL;
	const loopbackAPI = loopbackHosts.includes(api.hostname);
	const localAPI = api.hostname === 'api.playbooks.dev' || loopbackAPI;
	const defaultIssuer = loopbackAPI
		? 'http://localhost:9150'
		: localAPI
			? 'https://auth.playbooks.dev:9150'
			: productionIssuer;
	let issuer: URL;
	try {
		issuer = new URL(configured || defaultIssuer);
	} catch {
		throw new CliError(422, 'Provide a valid issuer origin in PLAYBOOKS_AUTH_URL.');
	}
	if (api.origin !== productionAPI && !localAPI && !configured)
		throw new CliError(422, 'Set PLAYBOOKS_AUTH_URL for this API origin before signing in.');
	if (
		issuer.href !== issuer.origin + '/' ||
		issuer.username ||
		issuer.password ||
		(issuer.protocol !== 'https:' &&
			!(localAPI && issuer.protocol === 'http:' && loopbackHosts.includes(issuer.hostname)))
	)
		throw new CliError(422, 'The sign-in issuer must be an HTTPS origin or a local loopback HTTP origin.');
	return issuer.origin;
};

const oauthRequest = async (issuer: string, path: '/token' | '/revoke', params: Record<string, string>) => {
	const response = await fetch(issuer + path, {
		method: 'POST',
		body: new URLSearchParams({ client_id: clientId, ...params }),
		redirect: 'error',
		signal: AbortSignal.timeout(15000),
	}).catch(() => {
		throw new CliError(503, 'Could not reach the Playbooks sign-in service.');
	});
	if (path === '/revoke' && response.ok) {
		await response.body?.cancel();
		return;
	}
	const result = await response.json().catch(() => null);
	if (!response.ok) {
		if (result?.error === 'invalid_grant')
			throw new CliError(401, 'This sign-in has expired or been revoked. Run playbooks login again.');
		throw new CliError(502, 'The Playbooks sign-in service could not complete the request.');
	}
	if (
		typeof result?.access_token !== 'string' ||
		!result.access_token ||
		typeof result.refresh_token !== 'string' ||
		!result.refresh_token ||
		!Number.isFinite(result.expires_in) ||
		result.expires_in <= 0 ||
		typeof result.token_type !== 'string' ||
		result.token_type.toLowerCase() !== 'bearer'
	)
		throw new CliError(502, 'The Playbooks sign-in service returned an invalid session.');
	return {
		accessToken: result.access_token,
		refreshToken: result.refresh_token,
		expiresAt: Date.now() + result.expires_in * 1000,
	};
};

export const refreshSession = (issuer: string, token: string) =>
	oauthRequest(issuer, '/token', { grant_type: 'refresh_token', refresh_token: token });

export const revokeSession = (issuer: string, token: string) =>
	oauthRequest(issuer, '/revoke', { token, token_type_hint: 'refresh_token' });

const openBrowser = (url: string) => {
	const [command, ...args] =
		process.platform === 'darwin'
			? ['open']
			: process.platform === 'win32'
				? ['rundll32.exe', 'url.dll,FileProtocolHandler']
				: ['xdg-open'];
	const browser = spawn(command, [...args, url], { stdio: 'ignore', windowsHide: true });
	browser.on('error', () => undefined);
	browser.unref();
};

export const browserSession = async (issuer: string) => {
	const state = randomBytes(32).toString('base64url');
	const verifier = randomBytes(32).toString('base64url');
	const challenge = createHash('sha256').update(verifier).digest('base64url');
	const nonce = randomBytes(32).toString('base64url');
	const server = createServer();
	server.requestTimeout = 10000;
	server.headersTimeout = 5000;
	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	}).catch(() => {
		throw new CliError(503, 'Could not start the local browser sign-in callback.');
	});
	const redirectURI = `http://127.0.0.1:${(server.address() as AddressInfo).port}${callbackPath}`;
	const url = new URL('/authorize', issuer);
	url.search = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		scope: 'openid platform',
		redirect_uri: redirectURI,
		code_challenge: challenge,
		code_challenge_method: 'S256',
		state,
		nonce,
	}).toString();
	let timeout: ReturnType<typeof setTimeout>;
	let interrupt: () => void;
	try {
		const code = await new Promise<string>((resolve, reject) => {
			timeout = setTimeout(() => reject(new CliError(408, 'Browser sign-in timed out. Try again.')), 5 * 60_000);
			interrupt = () => reject(new CliError(499, 'Browser sign-in canceled.'));
			process.once('SIGINT', interrupt);
			server.on('request', (request, response) => {
				response.setHeader('Cache-Control', 'no-store');
				response.setHeader('Referrer-Policy', 'no-referrer');
				response.setHeader('Content-Type', 'text/plain; charset=utf-8');
				const [path, query] = (request.url || '').split('?', 2);
				if (request.method !== 'GET' || path !== callbackPath) {
					response.writeHead(404).end('Not found.');
					return;
				}
				const params = new URLSearchParams(query);
				if (params.getAll('state').length !== 1 || params.get('state') !== state) {
					response.writeHead(400).end('This browser sign-in is invalid. Return to the terminal.');
					return;
				}
				const code = params.get('code');
				if (!code || params.getAll('code').length !== 1 || params.has('error')) {
					response.writeHead(400).end('Playbooks sign-in did not complete. Return to the terminal.');
					reject(new CliError(401, 'Browser sign-in was declined or did not complete.'));
					return;
				}
				const scriptNonce = randomBytes(16).toString('base64');
				response.setHeader('Content-Type', 'text/html; charset=utf-8');
				response.setHeader(
					'Content-Security-Policy',
					`default-src 'none'; script-src 'nonce-${scriptNonce}'; frame-ancestors 'none'; base-uri 'none'`,
				);
				response.end(
					`<!doctype html><html lang="en"><meta charset="utf-8"><title>Playbooks CLI</title><p>Authorization received. You can close this tab and return to the terminal.</p><script nonce="${scriptNonce}">history.replaceState(null, '', location.pathname); window.close();</script></html>`,
				);
				resolve(code);
			});
			console.error(`Opening your browser to sign in. If it does not open, visit:\n${url}`);
			openBrowser(url.href);
		});
		return await oauthRequest(issuer, '/token', {
			grant_type: 'authorization_code',
			code,
			redirect_uri: redirectURI,
			code_verifier: verifier,
		});
	} finally {
		clearTimeout(timeout);
		process.removeListener('SIGINT', interrupt);
		server.close();
		server.closeIdleConnections();
	}
};
