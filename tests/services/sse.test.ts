import { createSseParser, parseSseEvent } from 'src/services/sse-service';

describe('parseSseEvent', () => {
	it('parses a single event with JSON data', () => {
		expect(parseSseEvent('event: health\ndata: {"status":"ready"}')).toEqual({
			event: 'health',
			data: { status: 'ready' },
			rawData: '{"status":"ready"}',
		});
	});

	it('parses plain text data', () => {
		expect(parseSseEvent('data: server booting')).toEqual({
			event: null,
			data: 'server booting',
			rawData: 'server booting',
		});
	});

	it('preserves id and retry values when present', () => {
		expect(parseSseEvent('id: 42\nretry: 1500\nevent: log\ndata: {"line":"ready"}')).toEqual({
			event: 'log',
			data: { line: 'ready' },
			rawData: '{"line":"ready"}',
			id: '42',
			retry: 1500,
		});
	});
});

describe('createSseParser', () => {
	it('merges multiple data lines into a single event', () => {
		const events = [];
		const parser = createSseParser(event => events.push(event));

		parser.push('event: log\ndata: line one\ndata: line two\n\n');

		expect(events).toEqual([
			{
				event: 'log',
				data: 'line one\nline two',
				rawData: 'line one\nline two',
			},
		]);
	});

	it('parses events split across arbitrary chunk boundaries', () => {
		const events = [];
		const parser = createSseParser(event => events.push(event));

		parser.push('event: log\ndata: {"line":"part');
		parser.push('ial"}\n\n');

		expect(events).toEqual([
			{
				event: 'log',
				data: { line: 'partial' },
				rawData: '{"line":"partial"}',
			},
		]);
	});

	it('ignores comment and heartbeat lines', () => {
		const events = [];
		const parser = createSseParser(event => events.push(event));

		parser.push(': heartbeat\n\n');
		parser.push(': keepalive\nevent: health\ndata: {"status":"ready"}\n\n');

		expect(events).toEqual([
			{
				event: 'health',
				data: { status: 'ready' },
				rawData: '{"status":"ready"}',
			},
		]);
	});

	it('flushes a final event at the end of the stream', () => {
		const events = [];
		const parser = createSseParser(event => events.push(event));

		parser.push('event: log\ndata: final line');
		parser.end();

		expect(events).toEqual([
			{
				event: 'log',
				data: 'final line',
				rawData: 'final line',
			},
		]);
	});
});
