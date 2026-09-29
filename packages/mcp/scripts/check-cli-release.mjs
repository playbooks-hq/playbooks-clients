import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const dependency = manifest.dependencies['@playbooks/cli'];
if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(dependency) || dependency === '0.16.1') {
	throw new Error(
		'Release blocked: pin an identifiable Workspace/Project CLI release. The legacy 0.16.1 dependency is not compatible.',
	);
}
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const lockedCli = lock.packages?.['node_modules/@playbooks/cli'];
if (
	lock.packages?.[''].dependencies?.['@playbooks/cli'] !== dependency ||
	lockedCli?.version !== dependency ||
	!lockedCli.integrity
) {
	throw new Error('Release blocked: refresh the lockfile with the pinned CLI release and its artifact integrity.');
}
const require = createRequire(import.meta.url);
let directory = path.dirname(require.resolve('@playbooks/cli'));
let cli;
while (true) {
	try {
		const candidate = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8'));
		if (candidate.name === '@playbooks/cli') {
			cli = candidate;
			break;
		}
	} catch {
		/* Continue to the owning package manifest. */
	}
	const parent = path.dirname(directory);
	if (parent === directory) break;
	directory = parent;
}
if (!cli || cli.version !== dependency || cli.dependencies?.['@playbooks/serializers']) {
	throw new Error(
		'Release blocked: the installed CLI does not match the pinned rewrite. Refresh and verify the release artifact and lockfile.',
	);
}
