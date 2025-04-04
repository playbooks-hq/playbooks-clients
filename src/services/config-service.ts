import * as FileSystem from 'src/utils/file-system';
import * as Logger from 'src/utils/logger';

interface ConfigService {
	basePath: string;
}

class ConfigService {
	constructor(props: { basePath: string }) {
		this.basePath = props.basePath;
	}

	/* ----- Methods ----- */
	async setup() {
		const fragments = this.basePath.split('/');
		const path = fragments.filter((v, i) => i < fragments.length - 1).join('/');
		const file = fragments[fragments.length - 1];
		return await FileSystem.checkOrCreateFile(path, file);
	}

	async readConfig(): Promise<any> {
		const config = await FileSystem.readFile(this.basePath);
		const records = config.split('\n');
		const formattedRecords = {};
		records
			.filter(v => v.length > 0)
			.map(record => {
				const key = record.split('=')[0];
				const value = record.split('=')[1];
				return (formattedRecords[key] = value);
			});
		// Logger.info(`readConfig: `, formattedRecords);
		return formattedRecords;
	}

	async writeConfig(records) {
		Logger.log(`writeConfig: `, records);
		const formattedContent = Object.keys(records)
			.map(key => `${key}=${records[key]}`)
			.join('\n');
		return await FileSystem.writeFile(this.basePath, formattedContent);
	}

	async getValue(key) {
		const contents = await this.readConfig();
		return contents[key];
	}

	async getValues(keys) {
		const config = await this.readConfig();
		const formattedRecords = {};
		Object.keys(config)
			.filter(keyName => keys.includes(keyName))
			.map(keyName => Object.assign(formattedRecords[keyName], config[keyName]));
		return formattedRecords;
	}

	async storeValue(key, value) {
		const config = await this.readConfig();
		return await this.writeConfig({ ...config, [key]: value });
	}

	async storeValues(records) {
		const config = await this.readConfig();
		return await this.writeConfig({ ...config, ...records });
	}

	async clear() {
		return await this.writeConfig({});
	}
}

export { ConfigService };

// Docs
