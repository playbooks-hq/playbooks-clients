import { channel } from 'node:diagnostics_channel';
import { clearLine, cursorTo } from 'node:readline';

// Scope the indicator to HTTP activity so prompts, local commands and idle streams stay quiet.
export const requestProgress = (minimumMs = 300) => {
	const pending = new Set<object>();
	const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
	let timer: NodeJS.Timeout;
	let visible = false;
	let frame = 0;
	let visibleSince = 0;
	let clearTimer: NodeJS.Timeout;
	const remaining = () => Math.max(0, minimumMs - (performance.now() - visibleSince));
	const clear = () => {
		clearTimeout(clearTimer);
		clearInterval(timer);
		if (visible) {
			cursorTo(process.stderr, 0);
			clearLine(process.stderr, 0);
			visible = false;
		}
	};
	const draw = () => {
		cursorTo(process.stderr, 0);
		process.stderr.write(`${frames[frame++ % frames.length]} fetching data.`);
		visible = true;
	};
	const start = ({ request }) => {
		pending.add(request);
		clearTimeout(clearTimer);
		if (visible) return;
		visibleSince = performance.now();
		draw();
		timer = setInterval(draw, 120);
		timer.unref();
	};
	const finish = ({ request }) => {
		if (!pending.delete(request) || pending.size) return;
		const wait = remaining();
		if (wait > 0) clearTimer = setTimeout(clear, wait);
		else clear();
	};
	const created = channel('undici:request:create');
	const headers = channel('undici:request:headers');
	const failed = channel('undici:request:error');
	created.subscribe(start);
	headers.subscribe(finish);
	failed.subscribe(finish);
	return async () => {
		created.unsubscribe(start);
		headers.unsubscribe(finish);
		failed.unsubscribe(finish);
		clearTimeout(clearTimer);
		const wait = visible ? remaining() : 0;
		if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
		clear();
	};
};
