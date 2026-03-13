import { ConfigService } from 'src/services/config-service';
import { dayjs } from 'src/utils/dates';
import { logger } from 'src/utils/logger';

import { version as packageVersion } from '../../package.json';

interface UpdateService {
	base: string;
	packageName?: string;
}

class UpdateService {
	constructor(props) {
		this.base = props.base;
		this.packageName = '@playbooks/cli';
	}

	get configuration() {
		return new ConfigService({ base: this.base });
	}

	async runCheck() {
		const data = await this.fetchCache();
		if (data.timestamp) {
			if (data.latestVersion !== data.currentVersion) {
				const cached = this.verifyCache(data);
				return cached ? cached : this.printUpdate(data);
			} else {
				const cached = this.verifyCache(data);
				return cached ? cached : await this.storeUpdate();
			}
		}
		return await this.storeUpdate();
	}

	getCurrentVersion = () => {
		return packageVersion;
	};

	async fetchCache() {
		const configuration = this.configuration;
		const currentVersion = this.getCurrentVersion();
		const latestVersion = await configuration.getValue('latestVersion');
		const timestamp = await configuration.getValue('timestamp');
		return { currentVersion, latestVersion, timestamp };
	}

	verifyCache(data) {
		const currentTimestamp = dayjs().unix();
		const cachedTimestamp = dayjs(data.timestamp).unix();
		const difference = (currentTimestamp - cachedTimestamp) / 1000 / 60 / 60 / 24;
		logger.log(`verifyCache: `, { currentTimestamp, cachedTimestamp, difference });
		return difference <= 1;
	}

	async storeUpdate() {
		const configuration = this.configuration;
		const update = await this.fetchUpdate();
		if (update) {
			await configuration.storeValues({ latestVersion: update.latestVersion, timestamp: new Date().toJSON() });
			if (update.latestVersion !== update.currentVersion) this.printUpdate(update);
		}
	}

	printUpdate(data) {
		console.log('\n--- Update Available ---');
		console.log(`Current: ${data.currentVersion}`);
		console.log(`Latest:  ${data.latestVersion}`);
		console.log(`Run \`npm install -g ${this.packageName}@latest\` to update.`);
		console.log('------------------------\n');
	}

	async fetchUpdate() {
		const currentVersion = this.getCurrentVersion();

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 1000);

			const url = `https://registry.npmjs.org/-/package/${this.packageName}/dist-tags`;
			const response = await fetch(url, { signal: controller.signal });

			clearTimeout(timeoutId);

			if (!response.ok) return null;

			const data = await response.json();
			const latestVersion = data.latest;

			return { currentVersion, latestVersion };
		} catch (error) {
			return null;
		}
	}
}

export { UpdateService };

// Docs
