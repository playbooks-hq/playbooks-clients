import Shell from 'shelljs';

interface ShellService {
	base: string;
	fileName: string;
}

class ShellService {
	constructor(props) {
		this.base = props?.base;
	}

	/* ----- Computed ----- */
	get client() {
		return Shell.cd(this.base);
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
