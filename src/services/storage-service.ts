const Archiver = require('archiver');
const Fs = require('fs-extra');
const Stream = require('fstream');
const Unzip = require('unzip-stream');
import * as FileSystem from 'src/utils/file-system';

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

	/* ----- Methods ----- */
	async checkEmpty() {
		const pathExists = await FileSystem.checkPath(this.basePath);
		if (pathExists) {
			const path = await FileSystem.fileStats(this.basePath);
			if (path.isDirectory()) {
				const entries = await Fs.readdir(this.basePath);
				console.log('entries: ', entries);
				return entries.length > 0 ? false : true;
			}
			return true;
		}
		return true;
	}

	async saveRepo(buffer: ArrayBuffer) {
		await FileSystem.checkOrCreatePath(this.basePath);
		await FileSystem.writeFile(this.zipFile, Buffer.from(buffer));
	}

	async fetchRepoStats() {
		return await FileSystem.fileStats(this.basePath);
	}

	async unzipRepo() {
		await FileSystem.checkOrCreatePath(this.basePath);

		await new Promise((resolve, reject) => {
			Fs.createReadStream(this.zipFile)
				.pipe(Unzip.Extract({ path: `${this.basePath}/${this.fileName}` }))
				.on('close', v => resolve(v))
				.on('error', e => reject(e));
		});
	}

	async cleanRepo() {
		await FileSystem.removePath(this.basePath + '/.git');
		await FileSystem.removePath(this.basePath + '/.github');
	}

	async zipRepo() {
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

	async removeRepo() {
		await FileSystem.removePath(this.basePath);
	}

	async removeZip() {
		await FileSystem.removePath(this.zipFile);
	}
}

export { StorageService };

// Docs
//
