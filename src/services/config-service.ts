import * as FileSystem from 'src/utils/fs';
import { logger } from 'src/utils/logger';

interface ConfigService {
	base: string;
}

class ConfigService {
	constructor(props) {
		this.base = props.base;
	}

	/* ----- Methods ----- */
	async setup() {
		const fragments = this.base.split('/');
		const path = fragments.filter((v, i) => i < fragments.length - 1).join('/');
		const file = fragments[fragments.length - 1];
		return await FileSystem.checkOrCreateFile(path, file);
	}

	async readConfig(): Promise<any> {
		const config = await FileSystem.readFile(this.base);
		const records = config.split('\n');
		const formattedRecords = {};
		records
			.filter(v => v.length > 0)
			.map(record => {
				const key = record.split('=')[0];
				const value = record.split('=')[1];
				return (formattedRecords[key] = value);
			});
		// logger.log(`readConfig: `, JSON.stringify(formattedRecords));
		return formattedRecords;
	}

	async writeConfig(records) {
		logger.log(`writeConfig: `, records);
		const formattedContent = Object.keys(records)
			.map(key => `${key}=${records[key]}`)
			.join('\n');
		return await FileSystem.writeFile(this.base, formattedContent);
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
