import Archiver from 'archiver';
import Fs from 'fs-extra';
import path from 'node:path';
import * as FileSystem from 'src/utils/fs';
import Unzip from 'unzip-stream';

interface StorageService {
	basePath: string;
	fileName: string;
}

class StorageService {
	constructor(props: { basePath: string; fileName: string }) {
		this.basePath = props.basePath;
		this.fileName = props?.fileName;
	}

	/* ----- Computed ----- */
	get zipFile() {
		return `${this.basePath}/${this.fileName}.zip`;
	}

	get repoPath() {
		return `${this.basePath}/${this.fileName}`;
	}

	/* ----- Methods ----- */
	async checkEmpty() {
		const formattedPath = path.join(this.basePath, this.fileName);
		const pathExists = await FileSystem.checkPath(formattedPath);
		if (pathExists) {
			const path = await FileSystem.fileStats(formattedPath);
			if (path.isDirectory()) {
				const entries = await Fs.promises.readdir(formattedPath);
				const filteredEntries = entries.filter(v => v.slice(0, 1) !== '.');
				return filteredEntries.length > 0 ? false : true;
			}
			return true;
		}
		return true;
	}

	async save(buffer: ArrayBuffer) {
		await FileSystem.checkOrCreatePath(this.basePath);
		await FileSystem.writeFile(this.zipFile, Buffer.from(buffer));
	}

	async fetchRepoStats() {
		return await FileSystem.fileStats(this.basePath);
	}

	async unzip() {
		await FileSystem.checkOrCreatePath(this.repoPath);

		await new Promise((resolve, reject) => {
			Fs.createReadStream(this.zipFile)
				.pipe(Unzip.Extract({ path: this.repoPath }))
				.on('close', v => resolve(v))
				.on('error', e => reject(e));
		});
	}

	async clean() {
		await FileSystem.removePath(this.basePath + '/.git');
		await FileSystem.removePath(this.basePath + '/.github');
	}

	async zip() {
		await FileSystem.checkOrCreatePath(this.basePath);
		const archive = Archiver('zip', { zlib: { level: 9 } });
		const stream = Fs.createWriteStream(this.zipFile);

		await new Promise((resolve, reject) => {
			stream.on('close', v => resolve(v));
			archive.directory(this.basePath, false);
			archive.on('error', err => reject(err));
			archive.pipe(stream);
			archive.finalize();
		});
	}

	async remove() {
		await FileSystem.removePath(this.zipFile);
	}
}

export { StorageService };

// Docs
//
