const Fs = require('fs-extra');

export const checkOrCreateFile = async (pathName, fileName) => {
	const fileExists = await checkPath(`${pathName}/${fileName}`);
	return fileExists ? fileExists : await createFile(pathName, fileName);
};

export const createFile = async (pathName, fileName) => {
	await createPath(pathName);
	return await Fs.promises.writeFile(`${pathName}/${fileName}`, '');
};

export const readFile = async (filePath, encoding = 'utf8') => {
	return await Fs.promises.readFile(filePath, encoding);
};

export const writeFile = async (filePath: string, content: string | Buffer) => {
	return await Fs.writeFile(filePath, content);
};

export const fileStats = async (filePath: string) => {
	return await Fs.promises.stat(filePath);
};

export const checkPath = async (pathName: string) => {
	return await Fs.promises
		.stat(pathName)
		.then(() => true)
		.catch(() => false);
};

export const createPath = async pathName => {
	return await Fs.mkdirSync(pathName, { recursive: true });
};

export const checkOrCreatePath = async (pathName: string) => {
	const pathExists = await checkPath(pathName);
	return pathExists ? pathExists : await createPath(pathName);
};

export const removePath = async (pathName: string) => {
	const pathExists = await checkPath(pathName);
	if (pathExists) return await Fs.rm(pathName, { recursive: true });
};

// Docs
//
