import { stripVTControlCharacters } from 'node:util';

export const terminalText = (text: string) =>
	// Preserve newlines and tabs, but never execute remote terminal controls.
	// eslint-disable-next-line no-control-regex
	stripVTControlCharacters(text).replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '');
