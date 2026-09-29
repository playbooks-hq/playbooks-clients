import { readdir, readFile, writeFile } from 'node:fs/promises';
for (const name of await readdir('dist')) {
	if (name.endsWith('.d.ts'))
		await writeFile(
			`dist/${name.replace(/\.d\.ts$/, '.d.cts')}`,
			(await readFile(`dist/${name}`, 'utf8')).replace(/from '(.+)\.js'/g, "from '$1.cjs'"),
		);
}
