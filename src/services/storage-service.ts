import Archiver from 'archiver';
import Fs from 'fs-extra';
import path from 'node:path';
import * as FileSystem from 'src/utils/fs';
import Unzip from 'unzip-stream';

interface StorageService {
	base: string;
	fileName: string;
}

class StorageService {
	constructor(props) {
		this.base = props.base;
		this.fileName = props?.fileName;
	}

	/* ----- Computed ----- */
	get appPath() {
		return `${this.base}`;
	}

	get downloadPath() {
		return `${this.base}/${this.fileName}`;
	}

	get zipFile() {
		return `${this.base}/${this.fileName}.zip`;
	}

	/* ----- Methods ----- */
	async checkEmpty() {
		const formattedPath = path.join(this.base, this.fileName);
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
		await FileSystem.checkOrCreatePath(this.base);
		await FileSystem.writeFile(this.zipFile, Buffer.from(buffer));
	}

	async stats() {
		return await FileSystem.fileStats(this.base);
	}

	async unzipPartial() {
		await FileSystem.checkOrCreatePath(this.appPath);

		await new Promise((resolve, reject) => {
			Fs.createReadStream(this.zipFile)
				.pipe(Unzip.Extract({ path: this.appPath }))
				.on('close', v => resolve(v))
				.on('error', e => reject(e));
		});
	}

	async unzip() {
		await FileSystem.checkOrCreatePath(this.downloadPath);

		await new Promise((resolve, reject) => {
			Fs.createReadStream(this.zipFile)
				.pipe(Unzip.Extract({ path: this.downloadPath }))
				.on('close', v => resolve(v))
				.on('error', e => reject(e));
		});
	}

	async clean() {
		await FileSystem.removePath(this.base + '/.git');
		await FileSystem.removePath(this.base + '/.github');
	}

	async zip() {
		await FileSystem.checkOrCreatePath(this.base);
		const archive = Archiver('zip', { zlib: { level: 9 } });
		const stream = Fs.createWriteStream(this.zipFile);

		await new Promise((resolve, reject) => {
			stream.on('close', v => resolve(v));
			archive.directory(this.base, false);
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
