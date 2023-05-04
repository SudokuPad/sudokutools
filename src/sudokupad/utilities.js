
// System
	const VisChangeEventName = document.webkitHidden ? 'webkitvisibilitychange' : 'visibilitychange';
	const reportAndRethrow = note => err => {
		console.error('%s\n%s', (note || 'Error:'), err);
		throw err;
	};
	const sleep = ms => res => new Promise(resolve => setTimeout(() => resolve(res), ms));
	const bindHandlers = obj =>
		Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
			.filter(prop => /^handle/.test(prop) && typeof obj[prop] === 'function')
			.forEach(prop => obj[prop] = obj[prop].bind(obj));
	const resolveSelector = sel => {
		if(typeof sel === 'string') sel = [...document.querySelectorAll(sel)];
		if(!Array.isArray(sel)) sel = [sel];
		return sel;
	};
	const remHandler = (sel, events, fn, opts) => {
		events = events.split(/[ ,]/);
		resolveSelector(sel).forEach(elem => events.forEach(event =>
			elem && elem.removeEventListener(event, fn, opts)));
	};
	const addHandler = (sel, events, fn, opts) => {
		events = events.split(/[ ,]/);
		resolveSelector(sel).forEach(elem => events.forEach(event =>
			elem.addEventListener(event, fn, opts)));
	};
	const removeDownEventHandler = (sel, fn, opts) => remHandler(sel, 'mousedown touchstart', fn, opts);
	const addDownEventHandler = (sel, fn, opts) => addHandler(sel, 'mousedown touchstart', fn, opts);
	const removeMoveEventHandler = (sel, fn, opts) => remHandler(sel, 'mousemove touchmove', fn, opts);
	const addMoveEventHandler = (sel, fn, opts) => addHandler(sel, 'mousemove touchmove', fn, opts);
	const removeUpEventHandler = (sel, fn, opts) => remHandler(sel, 'mouseup touchend', fn, opts);
	const addUpEventHandler = (sel, fn, opts) => addHandler(sel, 'mouseup touchend', fn, opts);
	const testLocalStorageQuota = (size) => {
		const STRING100 = [...new Array(100)].map(_=>' ').join('');
		const roughSize = Math.floor(size / STRING100.length);
		const QUOTA_DATA = [...new Array(roughSize)].map(_=>STRING100).join('') + [...new Array(size - roughSize * STRING100.length)].map(_=>' ').join('');
		let key = '___QUOTA_TEST';
		let res = false;
		while(localStorage.getItem(key) !== null) key = key += (Math.random() * 10 | 0);
		try {
			localStorage.setItem(key, QUOTA_DATA);
			res = true;
		} catch(err) {}
		localStorage.removeItem(key);
		return res;
	};
	const findLocalStorageSpace = () => {
		const checkSpace = (min, max) => {
			let mid = Math.round((min + max) * 0.5);
			if(max - mid <= 1) return mid;
			return testLocalStorageQuota(mid)
				? checkSpace(mid, max)
				: checkSpace(min, mid);
		};
		return checkSpace(0, 10e6);
	};
	function fetchWithTimeout(url, opts = {}) {
		const {timeout = 5000} = opts;
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeout);
		return fetch(url, {...opts, signal: controller.signal})
			.then(res => {
				clearTimeout(timeoutId);
				return res;
			})
			.catch(err => {
				if(controller.signal.aborted) throw new Error(`Request for ${JSON.stringify(url)} timed out`);
				throw err;
			});
	}
	const formatHHMMSS = timeMs => [
			Math.floor(timeMs / 3600000),
			Math.floor(timeMs / 60000) % 60,
			Math.floor(timeMs / 1000) % 60
		]
		.map(t => String(t).padStart(2, '0'))
		.join(':');
	function throttleFunc(func, minDelayMs, maxDelayMs) {
		let minTimeoutId, maxTimeoutId, lastThis, lastArgs;
		function stopFunc() {
			lastThis = undefined; lastArgs = undefined;
			minTimeoutId = clearTimeout(minTimeoutId);
			minTimeoutId = clearTimeout(maxTimeoutId);
		}
		function handleFunc() {
			let currThis = lastThis, currArgs = lastArgs;
			stopFunc();
			return func.apply(currThis, currArgs);
		}
		function forceFunc(...args) {
			lastThis = this; lastArgs = args;
			return handleFunc();
		}
		function throttledFunc(...args) {
			lastThis = this; lastArgs = args;
			clearTimeout(minTimeoutId);
			minTimeoutId = setTimeout(handleFunc, minDelayMs);
			if(maxTimeoutId === undefined) maxTimeoutId = setTimeout(handleFunc, maxDelayMs);
		}
		throttledFunc.force = forceFunc;
		throttledFunc.stop = stopFunc;
		return throttledFunc;
	}
	function autoRepeatFunc(func, delayMs, intervalMs) {
		const stopEventNames = `blur focusout pagehide pageshow ${VisChangeEventName} keydown keyup mousedown mouseup touchstart touchend touchcancel`;
		let delayId, intervalId, lastThis, lastArgs;
		function stopFunc(event) {
			if(event && event.repeat) return;
			lastThis = undefined; lastArgs = undefined;
			delayId = clearTimeout(delayId);
			intervalId = clearInterval(intervalId);
			remHandler([window, document], stopEventNames, stopFunc, true);
		}
		function enableStopHandlers() {
			remHandler([window, document], stopEventNames, stopFunc, true);
			addHandler([window, document], stopEventNames, stopFunc, true);
		}
		function handleFunc() {
			return func.apply(lastThis, lastArgs);
		}
		function startRepeat() {
			delayId = clearTimeout(delayId);
			intervalId = setInterval(handleFunc, intervalMs);
			handleFunc();
		}
		function repeatFunc(...args) {
			stopFunc();
			lastThis = this; lastArgs = args;
			delayId = setTimeout(startRepeat, delayMs);
			handleFunc();
			enableStopHandlers();
		}
		repeatFunc.stop = stopFunc;
		return repeatFunc;
	}
	function sanitizeHTML(html) {
		let doc = new DOMParser().parseFromString(html, 'text/html');
		return (doc && doc.body && doc.body.textContent) || '';
	}
	function textToHtml(text) {
		let e = document.createElement('div');
		e.textContent = text;
		e.innerHTML = e.textContent.replace(/(\\n|\n)/g, '<br />\n');
		return e.innerHTML;
	};
	async function fetchWithTimeout(resource, options = {}) {
		const {timeout = 8000} = options;
		const controller = new AbortController();
		const id = setTimeout(() => controller.abort(), timeout);
		const response = await fetch(resource, {...options, signal: controller.signal});
		clearTimeout(id);
		return response;
	}
	async function sanitizeImageUrl(url, {timeout = 5000} = {}) {
		// Cannot use "no-cors" as that prevents verifying that the link is indeed an image
		const respHead = await fetchWithTimeout(url, {timeout, method: 'HEAD'});
		if(respHead.status !== 200) throw new Error('Unable to fetch image');
		const isImage = respHead.headers.get('content-type').match(/^image\//);
		if(!isImage) throw new Error('Not a valid image');
		const respGet = await fetchWithTimeout(url, {timeout});
		if(respGet.status !== 200) throw new Error('Unable to fetch image');
		return URL.createObjectURL(await respGet.blob());
	};
	const svgToTinyDataUri = (() => {
		// Source: https://github.com/tigt/mini-svg-data-uri
		const reWhitespace = /\s+/g,
			reUrlHexPairs = /%[\dA-F]{2}/g,
			hexDecode = {'%20': ' ', '%3D': '=', '%3A': ':', '%2F': '/'},
			specialHexDecode = match => hexDecode[match] || match.toLowerCase(),
			svgToTinyDataUri = svg => {
				svg = String(svg);
				if(svg.charCodeAt(0) === 0xfeff) svg = svg.slice(1);
				svg = svg
					.trim()
					.replace(reWhitespace, ' ')
					.replaceAll('"', '\'');
				svg = encodeURIComponent(svg);
				svg = svg.replace(reUrlHexPairs, specialHexDecode);
				return 'data:image/svg+xml,' + svg;
			};
		svgToTinyDataUri.toSrcset = svg => svgToTinyDataUri(svg).replace(/ /g, '%20');
		return svgToTinyDataUri;
	})();

// Files
	const loadScript = async (src, sel = 'head', props) => new Promise((onload, onerror) => {
		let elem = resolveSelector(sel)[0]
			.appendChild(Object.assign(
				document.createElement('script'),
				{src, type: 'text/javascript', onload: () => onload(elem), onerror},
				props
			))
	});
	const attachStylesheet = async (cssText, sel = 'head') => new Promise((onload, onerror) => {
		let elem = resolveSelector(sel)[0].appendChild(Object.assign(
			document.createElement('style'), {textContent: cssText, onload: () => onload(elem), onerror}))
	});
	const downloadFile = (data, type, filename) => {
		let blob = new Blob([data], {type});
		let link = Object.assign(document.createElement('a'),
			{href: window.URL.createObjectURL(blob), download: filename});
		link.dispatchEvent(new MouseEvent('click', {view: window, bubbles: true, cancelable: true}));
		link.remove();
		window.URL.revokeObjectURL(blob);
	};
	const loadFromFile = (handleFile, opts) => {
		let btn = Object.assign(document.createElement('input'), {type: 'file', visibility: 'hidden'}, opts);
		let handleChange = event => {
			btn.removeEventListener('change', handleChange);
			handleFile(((event.target || {}).files || [])[0]);
		};
		btn.addEventListener('change', handleChange);
		btn.click();
		return btn;
	};
	const readFile = async file => new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.addEventListener('error', reject);
		reader.addEventListener('load', resolve);
		reader.readAsText(file);
	});

// TODO: Move this into Framework
let SudokuPadUtilities = (() => {
	const ScrollElemEventnames = 'mousedown touchstart mousemove touchmove mouseup touchend';
	const ScrollWindowEventnames = 'mouseup touchend';
	function cancelEventHandler() {
		event.preventDefault();
		event.stopPropagation();
	}
	function makeGrabScrollHandler(elem) {
		let lastPos, hasScrolled = false;
		return function handleGrabScroll(event) {
			const {minDrag} = SudokuPadUtilities;
			let eType = event.type;
			const getPos = e => e.touches ? [e.touches[0].clientX, e.touches[0].clientY] : [e.clientX, e.clientY];
			if(eType === 'mousedown' || eType === 'touchstart') {
				lastPos = getPos(event);
				hasScrolled = false;
			}
			else if((eType === 'mousemove' || eType === 'touchmove') && lastPos) {
				elem = elem || event.target, pos = getPos(event);
				lastPos = lastPos || pos;
				let diff = [(pos[0] - lastPos[0]), (pos[1] - lastPos[1])];
				if(hasScrolled || Math.abs(diff[0]) >= minDrag || Math.abs(diff[1]) >= minDrag) {
					elem.scrollLeft -= diff[0];
					elem.scrollTop -= diff[1];
					lastPos[0] = pos[0];
					lastPos[1] = pos[1];
					hasScrolled = true;
				}
			}
			else if(eType === 'mouseup' || eType === 'touchend') {
				lastPos = undefined;
				if(hasScrolled) {
					event.preventDefault();
					event.stopImmediatePropagation();
					hasScrolled = false;
				}
			}
		};
	}
	function attachScrollHandler(elem, prevHandler) {
		dettachScrollHandler(elem, prevHandler);
		const handler = makeGrabScrollHandler(elem);
		addHandler(elem, ScrollElemEventnames, handler, {capture: true});
		addHandler(window, ScrollWindowEventnames, handler, {capture: true});
		handler.detach = () => dettachScrollHandler(elem, handler);
		return handler;
	}
	function dettachScrollHandler(elem, prevHandler) {
		if(typeof prevHandler === 'function') {
			remHandler(elem, ScrollElemEventnames, prevHandler, {capture: true});
			remHandler(window, ScrollWindowEventnames, prevHandler, {capture: true});
		}
	}
	return {
		minDrag: 5,
		cancelEventHandler,
		makeGrabScrollHandler,
		attachScrollHandler,
		dettachScrollHandler
	};
})();

// Fullscreen
	let docEl = document.documentElement, reqFs = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
	let doc = document, exitFs = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
	const isFullscreen = () => document.fullscreenElement != null;
	const requestFullscreen = (el) => (typeof reqFs === 'function') ? Promise.resolve(reqFs.call(el || docEl)) : Promise.reject('Fullscreen API is not supported.');
	const exitFullscreen = () => (typeof exitFs === 'function') ? Promise.resolve(exitFs.call(doc)) : Promise.reject('Fullscreen API is not supported.');
	const toggleFullscreen = (el) => isFullscreen() ? exitFullscreen() : requestFullscreen(el || docEl);

// SVG Tools
	const $ = selector => document.querySelector(selector);
	const bounds = elem => {
		if(typeof elem === 'string') elem = $(elem);
		return elem.getBoundingClientRect();
	};
	const scaleToFit = (content, container, margins = {}) => {
		var containerWidth = container.width - (margins.h || 0);
		var containerHeight = container.height - (margins.v || 0);
		var xRatio = containerWidth / content.width;
		var yRatio = containerHeight / content.height;
		var scale = (content.height * xRatio > containerHeight) ? yRatio : xRatio;
		return scale;
	};
	const getTransform = elem => {
		if(typeof elem === 'string') elem = document.querySelector(elem);
		let res = {elem};
		let computedStyle = window.getComputedStyle(elem, null);
		let transform = ((computedStyle.transform.match(/matrix\((.*?)\)/i) || [])[1] || '').split(/\s*,\s*/).map(parseFloat);
		'sx,b,c,sy,tx,ty'.split(',').forEach((prop, i) => res[prop] = transform[i]);
		'left,top,width,height'.split(',').forEach((prop, i) => res[prop] = parseFloat(computedStyle[prop]));
		return res;
	};

// Numbers
	const triangularNumber = value => {
		let abs = Math.abs(value);
		return ((abs / 2) * (abs + 1)) * (abs / value) || 0;
	};

// Geometry
	const calcDistance = (a, b) => {
		const ax = (a.x !== undefined) ? a.x : a[0], ay = (a.y !== undefined) ? a.y : a[1];
		const bx = (b.x !== undefined) ? b.x : b[0], by = (b.y !== undefined) ? b.y : b[1];
		const dx = bx - ax, dy = by - ay;
		return Math.sqrt(dx * dx + dy * dy);
	};
	const calcDistanceArr = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1]; return Math.sqrt(dx * dx + dy * dy); };
	const pathLength = points => {
		var len = 0;
		(points || []).forEach((p, idx, arr) => len += (idx > 0) ? calcDistance(arr[idx - 1], p) : 0);
		return len;
	};
	const calcAngle = (a1, a2, b1, b2) => {
		const dax = a2[0] - a1[0], day = a2[1] - a1[1];
		const dbx = b2[0] - b1[0], dby = b2[1] - b1[1];
		var angle = Math.atan2(dax * dby - day * dbx, dax * dbx + day * dby);
		if(angle < 0) angle = angle * -1;
		return angle * (180 / Math.PI);
	};
	const squareSegment = (a1, a2) => {
		const angToSquareEdgePoint = a => {
			let phi = a * Math.PI / 180;
			let sin = Math.sin(phi), cos = Math.cos(phi + Math.PI);
			let x, y;
			if(Math.abs(sin) < Math.abs(cos)) {
				y = Math.sign(cos);
				x = Math.tan(phi) * -y;
			}
			else {
				x = Math.sign(sin);
				y = (1 / Math.tan(phi)) * -x;
			}
			return [0.5 * (x + 1), 0.5 * (y + 1)];
		};
		let da = a2 - a1;
		let offset = a1 - (a1 % 90);
		let b1 = a1 % 90, b2 = b1 + da;
		let ps = [];
		ps.push(angToSquareEdgePoint(b1 + offset));
		for(let c = 0; c < 4; c++) {
			let ca = 45 + c * 90;
			if(Math.sign(b1 - ca) !== Math.sign(b2 - ca)) ps.push(angToSquareEdgePoint(ca + offset));
		}
		ps.push(angToSquareEdgePoint(b2 + offset));
		return ps;
	};
	const toRC = ([r, c]) => ([Math.floor(r), Math.floor(c)]);
	const isSameRC = (rc1 = [], rc2 = []) => rc1[0] === rc2[0] && rc1[1] === rc2[1];
	const roundCenter = ([r, c]) => ([Math.floor(r) + 0.5, Math.floor(c) + 0.5]);
	const getLinePoints = (x0, y0, x1, y1, points = []) => {
		let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
		let sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
		let err = dx - dy;
		while(true) {
			points.push([x0, y0]);
			if((x0 === x1) && (y0 === y1)) break;
			let e2 = 2*err;
			if(e2 > -dy) { err -= dy; x0  += sx; }
			if(e2 < dx) { err += dx; y0  += sy; }
		}
		return points;
	};
	const stepPoints = (x0, y0, x1, y1, handler) => {
		let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
		let sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1;
		let err = dx - dy;
		while(true) {
			handler(x0, y0);
			if((x0 === x1) && (y0 === y1)) break;
			let e2 = 2*err;
			if(e2 > -dy) { err -= dy; x0  += sx; }
			if(e2 < dx) { err += dx; y0  += sy; }
		}
	};

// Checksum
	const md5Digest = ((data) => {
		function md5cycle(x, k) {
			var a = x[0], b = x[1], c = x[2], d = x[3];

			a = ff(a, b, c, d, k[0], 7, -680876936);
			d = ff(d, a, b, c, k[1], 12, -389564586);
			c = ff(c, d, a, b, k[2], 17,  606105819);
			b = ff(b, c, d, a, k[3], 22, -1044525330);
			a = ff(a, b, c, d, k[4], 7, -176418897);
			d = ff(d, a, b, c, k[5], 12,  1200080426);
			c = ff(c, d, a, b, k[6], 17, -1473231341);
			b = ff(b, c, d, a, k[7], 22, -45705983);
			a = ff(a, b, c, d, k[8], 7,  1770035416);
			d = ff(d, a, b, c, k[9], 12, -1958414417);
			c = ff(c, d, a, b, k[10], 17, -42063);
			b = ff(b, c, d, a, k[11], 22, -1990404162);
			a = ff(a, b, c, d, k[12], 7,  1804603682);
			d = ff(d, a, b, c, k[13], 12, -40341101);
			c = ff(c, d, a, b, k[14], 17, -1502002290);
			b = ff(b, c, d, a, k[15], 22,  1236535329);

			a = gg(a, b, c, d, k[1], 5, -165796510);
			d = gg(d, a, b, c, k[6], 9, -1069501632);
			c = gg(c, d, a, b, k[11], 14,  643717713);
			b = gg(b, c, d, a, k[0], 20, -373897302);
			a = gg(a, b, c, d, k[5], 5, -701558691);
			d = gg(d, a, b, c, k[10], 9,  38016083);
			c = gg(c, d, a, b, k[15], 14, -660478335);
			b = gg(b, c, d, a, k[4], 20, -405537848);
			a = gg(a, b, c, d, k[9], 5,  568446438);
			d = gg(d, a, b, c, k[14], 9, -1019803690);
			c = gg(c, d, a, b, k[3], 14, -187363961);
			b = gg(b, c, d, a, k[8], 20,  1163531501);
			a = gg(a, b, c, d, k[13], 5, -1444681467);
			d = gg(d, a, b, c, k[2], 9, -51403784);
			c = gg(c, d, a, b, k[7], 14,  1735328473);
			b = gg(b, c, d, a, k[12], 20, -1926607734);

			a = hh(a, b, c, d, k[5], 4, -378558);
			d = hh(d, a, b, c, k[8], 11, -2022574463);
			c = hh(c, d, a, b, k[11], 16,  1839030562);
			b = hh(b, c, d, a, k[14], 23, -35309556);
			a = hh(a, b, c, d, k[1], 4, -1530992060);
			d = hh(d, a, b, c, k[4], 11,  1272893353);
			c = hh(c, d, a, b, k[7], 16, -155497632);
			b = hh(b, c, d, a, k[10], 23, -1094730640);
			a = hh(a, b, c, d, k[13], 4,  681279174);
			d = hh(d, a, b, c, k[0], 11, -358537222);
			c = hh(c, d, a, b, k[3], 16, -722521979);
			b = hh(b, c, d, a, k[6], 23,  76029189);
			a = hh(a, b, c, d, k[9], 4, -640364487);
			d = hh(d, a, b, c, k[12], 11, -421815835);
			c = hh(c, d, a, b, k[15], 16,  530742520);
			b = hh(b, c, d, a, k[2], 23, -995338651);

			a = ii(a, b, c, d, k[0], 6, -198630844);
			d = ii(d, a, b, c, k[7], 10,  1126891415);
			c = ii(c, d, a, b, k[14], 15, -1416354905);
			b = ii(b, c, d, a, k[5], 21, -57434055);
			a = ii(a, b, c, d, k[12], 6,  1700485571);
			d = ii(d, a, b, c, k[3], 10, -1894986606);
			c = ii(c, d, a, b, k[10], 15, -1051523);
			b = ii(b, c, d, a, k[1], 21, -2054922799);
			a = ii(a, b, c, d, k[8], 6,  1873313359);
			d = ii(d, a, b, c, k[15], 10, -30611744);
			c = ii(c, d, a, b, k[6], 15, -1560198380);
			b = ii(b, c, d, a, k[13], 21,  1309151649);
			a = ii(a, b, c, d, k[4], 6, -145523070);
			d = ii(d, a, b, c, k[11], 10, -1120210379);
			c = ii(c, d, a, b, k[2], 15,  718787259);
			b = ii(b, c, d, a, k[9], 21, -343485551);

			x[0] = add32(a, x[0]);
			x[1] = add32(b, x[1]);
			x[2] = add32(c, x[2]);
			x[3] = add32(d, x[3]);
		}
		function cmn(q, a, b, x, s, t) {
			a = add32(add32(a, q), add32(x, t));
			return add32((a << s) | (a >>> (32 - s)), b);
		}
		function ff(a, b, c, d, x, s, t) {
			return cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function gg(a, b, c, d, x, s, t) {
			return cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function hh(a, b, c, d, x, s, t) {
			return cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function ii(a, b, c, d, x, s, t) {
			return cmn(c ^ (b | (~d)), a, b, x, s, t);
		}
		function md51(s) {
			var txt = '';
			var n = s.length,
			state = [1732584193, -271733879, -1732584194, 271733878], i;
			for (i=64; i<=s.length; i+=64) {
			md5cycle(state, md5blk(s.substring(i-64, i)));
			}
			s = s.substring(i-64);
			var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
			for (i=0; i<s.length; i++)
			tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
			tail[i>>2] |= 0x80 << ((i%4) << 3);
			if (i > 55) {
			md5cycle(state, tail);
			for (i=0; i<16; i++) tail[i] = 0;
			}
			tail[14] = n*8;
			md5cycle(state, tail);
			return state;
		}
		function md5blk(s) {
			var md5blks = [], i;
			for (i=0; i<64; i+=4) {
			md5blks[i>>2] = s.charCodeAt(i)
			+ (s.charCodeAt(i+1) << 8)
			+ (s.charCodeAt(i+2) << 16)
			+ (s.charCodeAt(i+3) << 24);
			}
			return md5blks;
		}
		var hex_chr = '0123456789abcdef'.split('');
		function rhex(n) {
			var s='', j=0;
			for(; j<4; j++)
			s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
			+ hex_chr[(n >> (j * 8)) & 0x0F];
			return s;
		}
		function hex(x) {
			for (var i=0; i<x.length; i++)
			x[i] = rhex(x[i]);
			return x.join('');
		}
		function md5(s) {
			return hex(md51(s));
		}
		function add32(a, b) {
			return (a + b) & 0xFFFFFFFF;
		}
		if(md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
			function add32(x, y) {
				var lsw = (x & 0xFFFF) + (y & 0xFFFF),
				msw = (x >> 16) + (y >> 16) + (lsw >> 16);
				return (msw << 16) | (lsw & 0xFFFF);
			}
		}
		return md5;
	})();

// Hide Solution
	const HideSol = (() => {
		const HS = {
			radix: 5,
			base: 32,
		};
		const solMap = sol => sol.split('').map(d => d.match(/[?]/) ? '0' : '1').join('');
		const solMapEncode = sol => solMap(sol)
			.padEnd(Math.ceil(sol.length / HS.radix) * HS.radix, '0')
			.match(new RegExp(`(.{${HS.radix}})`,'g'))
			.map(set => parseInt(set, 2).toString(HS.base)).join('');
		const solMapDecode = (map, len) => map
			.split('')
			.map(n => parseInt(n, HS.base).toString(2).padStart(HS.radix, '0'))
			.join('')
			.slice(0, len);
		const mapSol = (sol, map) => sol
			.split('')
			.reduce((acc, cur, idx) => acc + (map[idx] === '1' ? cur : ''), '');
		const hideSol = sol => `${solMapEncode(sol)}|${md5Digest(mapSol(sol, solMap(sol)))}`;
		const checkHiddenSol = (hsol, p81) => {
			const [map, md5] = hsol.split('|');
			let decodedMap = solMapDecode(map, p81.length);
			let p81Mapped = mapSol(p81, decodedMap);
			let digest = md5Digest(p81Mapped);
			return digest === md5;
		};
		HS.solMap = solMap;
		HS.encode = solMapEncode;
		HS.decode = solMapDecode;
		HS.mapSol = mapSol;
		HS.hideSol = hideSol;
		HS.check = checkHiddenSol;
		return HS;
	})();

// JSONEditor
	let createJSONEditor = async (opts = {}) => {
		let url = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/9.5.6/jsoneditor.min.js',
			{json = {}, elem = '#jsoneditor', cssUrl = url.replace('.js', '.css'), jsUrl = url, editor} = opts;
		if(typeof JSONEditor === 'undefined') {
			const promisifyOnload = obj => new Promise((resolve, onerror) => Object.assign(obj, {onload: () => resolve(obj), onerror}));
			let head = document.querySelector('head'),
				link = document.createElement('link'),
				script = document.createElement('script'),
				scriptP = promisifyOnload(script);
			head.appendChild(Object.assign(link, {href: cssUrl, rel: 'stylesheet', type: 'text/css', media: 'all'}));
			head.appendChild(Object.assign(script, {src: jsUrl}));
			await scriptP;
		}
		if(typeof elem === 'string') elem = document.querySelector(elem);
		elem = elem || document.createElement('div');
		if(editor instanceof JSONEditor) editor.destroy();
		editor = new JSONEditor(elem, {});
		editor.set(json);
		return editor;
	};
