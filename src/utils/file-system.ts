const Fs = require('fs-extra');

export const readFile = async (filePath, encoding = 'utf8') => {
	return await Fs.promises.readFile(filePath, encoding);
};

export const checkPath = async (pathName: string) => {
	return await Fs.promises
		.stat(pathName)
		.then(() => true)
		.catch(() => false);
};

export const checkOrCreatePath = async (pathName: string) => {
	const pathExists = await checkPath(pathName);
	if (!pathExists) await Fs.mkdirSync(pathName, { recursive: true });
};

export const fileStats = async (filePath: string) => {
	return await Fs.promises.stat(filePath);
};

export const removePath = async (pathName: string) => {
	const pathExists = await checkPath(pathName);
	if (pathExists) await Fs.rm(pathName, { recursive: true });
};

export const writeFile = async (filePath: string, content: Buffer) => {
	return await Fs.writeFile(filePath, content);
};
