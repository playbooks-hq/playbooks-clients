import Shell from 'shelljs';

interface ShellService {
	basePath: string;
	fileName: string;
}

class ShellService {
	constructor(props) {}

	/* ----- Computed ----- */
	get client() {
		return Shell.cd(this.basePath);
	}

	/* ----- Helpers ----- */
	async command(command, options = { silent: false }): Promise<any> {
		return this.client.exec(command, options);
	}

	/* ----- Methods ----- */
}

export { ShellService };

// Docs
//
