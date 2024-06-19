import * as FileSystem from 'src/utils/file-system';

interface ConfigService {
	basePath: string;
}

class ConfigService {
	constructor(props: { basePath: string }) {
		this.basePath = props.basePath;
	}

	/* ----- Methods ----- */
	async checkEmpty() {
		// console.log("Checking path: ", this.basePath);
		const pathExists = await FileSystem.checkPath(this.basePath);
		if (pathExists) {
			const path = await FileSystem.fileStats(this.basePath);
			if (path.isDirectory()) return false;
			return true;
		}
		return false;
	}

	async readContents() {
		const contents = await FileSystem.readFile(this.basePath);
		const records = contents.split('\n');
		return records
			.filter(v => v.length > 0)
			.map(record => {
				const key = record.split('=')[0];
				const value = record.split('=')[1];
				return { key, value };
			});
	}
}

export { ConfigService };

// Docs
