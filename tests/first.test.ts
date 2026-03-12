import { testAndFormatUUID } from 'src/utils/helpers';

describe('testAndFormatUUID', () => {
	it('returns the uuid unchanged when a raw identifier is passed', () => {
		expect(testAndFormatUUID('astro-official-starter')).toBe('astro-official-starter');
	});
});

describe('testAndFormatUUID with a URL', () => {
	it('extracts and formats the identifier from a playbooks URL', () => {
		expect(testAndFormatUUID('https://playbooks.xyz/plays/astro-official-starter')).toBe('astro-official-starter');
	});
});
