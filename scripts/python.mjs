import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory = fileURLToPath(new URL('../packages/sdk-python', import.meta.url));
const python = path.join(directory, '.venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const [task, ...args] = process.argv.slice(2);
const run = (command, values) => execFileSync(command, values, { cwd: directory, stdio: 'inherit' });
if (task === 'setup') {
  if (!existsSync(python)) run(process.platform === 'win32' ? 'python' : 'python3', ['-m', 'venv', '.venv']);
  run(python, ['-m', 'pip', 'install', '-e', '.[dev]']);
} else {
  if (!existsSync(python)) throw new Error('Run pnpm python:setup with Python 3.11+ first.');
  if (task === 'lint') {
    run(python, ['-m', 'ruff', 'check', 'src']);
    run(python, ['-m', 'ruff', 'format', '--check', 'src']);
  } else if (task === 'lint:fix') {
    run(python, ['-m', 'ruff', 'check', '--fix', 'src']);
  } else if (task === 'format') {
    run(python, ['-m', 'ruff', 'format', '--check', 'src']);
  } else if (task === 'format:fix') {
    run(python, ['-m', 'ruff', 'format', 'src']);
  } else if (task === 'typecheck') {
    run(python, ['-m', 'mypy']);
  } else if (task === 'build' && args.length === 1) {
    run(python, ['-m', 'build', '--outdir', path.resolve(args[0])]);
  } else {
    throw new Error('Expected setup, lint, lint:fix, format, format:fix, typecheck, or build <absolute-output-directory>.');
  }
}
