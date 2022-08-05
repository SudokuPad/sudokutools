const PuzzleTools = (() => {
	const encode70Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz()[]-.~:@!$&\'*,;=_';
	const reEncode70Chars = new RegExp(`^[123456789${encode70Chars.replace(/./g, '\\$&')}]+$`);
	const encode70CharsMax = encode70Chars.length - 1;
	const encode70 = num => encode70Chars[num];
	const decode70 = char => encode70Chars.indexOf(char);

	const blankEncodes = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
	const reBlankEncodes = new RegExp(`^[${blankEncodes}]+$`);
	const blanksMap = ['', '0', '00', '000', '0000', '00000'];


	function PuzzleTools() {}
	const PT = PuzzleTools, P = Object.assign(PuzzleTools.prototype, {constructor: PuzzleTools});

	// classic codec
		PT.reEncode70Chars = reEncode70Chars;
		PT.reBlankEncodes = reBlankEncodes;
		PT.zipClassicSudoku = (givens) => {
			let blanks = 0, data = '';
			const encodeBlanks = () => {
				while(blanks > 0) {
					data += encode70(Math.min(encode70CharsMax, blanks));
					blanks = Math.max(0, blanks - encode70CharsMax);
				}
			};
			for(let i = 0; i < givens.length; i++) {
				if(givens[i] === '_') blanks++
				else {
					encodeBlanks();
					data += givens[i];
				}
			}
			encodeBlanks();
			return data;
		};
		PT.unzipClassicSudoku = (zipped) => {
			zipped = zipped.split('');
			let unzipped = '', decoded;
			for(let i = 0; i < zipped.length; i++) {
				decoded = decode70(zipped[i]);
				if(decoded === -1) unzipped += zipped[i]
				else while(decoded-- > 0) unzipped += '_';
			}
			return unzipped;
		};
		PT.zipClassicSudoku2 = puzzle => {
			let charCode = puzzle[0].charCodeAt(0), digit = (charCode >= 49 && charCode <= 57) ? puzzle[0] : '0';
			let res = '', blanks = 0;
			for(let i = 1; i < puzzle.length; i++) {
				let charCode = puzzle[i].charCodeAt(0), next = (charCode >= 49 && charCode <= 57) ? puzzle[i] : '0';
				if(blanks === 5 || next !== '0') {
					res += blankEncodes[Number(digit) + blanks * 10];
					digit = next;
					blanks = 0;
				}
				else blanks++;
			}
			res += blankEncodes[Number(digit) + blanks * 10];
			return res;
		};
		PT.unzipClassicSudoku2 = zipped => {
			let res = [];
			for(let i = 0; i < zipped.length; i++) {
				let dec = blankEncodes.indexOf(zipped[i]);
				res.push(String(Number(dec % 10)), blanksMap[Math.floor(dec / 10)]);
			}
			return res.join('');
		};
		PT.zip = puzzle => {
			return PT.zipClassicSudoku2(puzzle);
		};
		PT.unzip = (zipped = '') => {
			// Warning: Since formats aren't keyed, and can be valid in either format, this is a best guess algo
			zipped = zipped.replace(/^classic/, '');
			let match1 = reEncode70Chars.test(zipped), match2 = reBlankEncodes.test(zipped);
			if(!match1 && !match2) return; // Unknown chars
			if(match1 && !match2) return PT.unzipClassicSudoku(zipped); // Chars only valid for classic1
			if(match2 && !match1) return PT.unzipClassicSudoku2(zipped); // Chars only valid for classic2
			let unzipped2 = PT.unzipClassicSudoku2(zipped);
			if(Math.sqrt(unzipped2.length) % 1 === 0) return unzipped2; // is NxN in classic2, high probability
			let unzipped1 = PT.unzipClassicSudoku(zipped);
			if(Math.sqrt(unzipped1.length) % 1 === 0) return unzipped1; // is NxN in classic1, high probability
			return unzipped2; // Finally return classic2 format
		};
	// format checking
		PT.isJson = data => {
			try { JSON.parse(data); return true; }
			catch(err) { return false; }
		};
		PT.isPZZipped = data => {
			try { return !PT.isJson(data) && PT.isJson(PuzzleZipper.unzip(data)); }
			catch(err) { return false; }
		};
		PT.isFPuzzZipped = data => {
			try {
				if(typeof data !== 'string') return false;
				let decomp = loadFPuzzle.fpuzzlesDecompress(data.replace(/^fpuzzles/, ''));
				if(decomp === null) return false;
				return PT.isJson(decomp);
			}
			catch(err) { return false; }
		};
		PT.isClassic = (data = '') => {
			data = data.replace(/^classic/, '');
			let unzipped = PT.unzipClassicSudoku(data);
			return unzipped.length === 81;
		};
		PT.isClassic2 = (data = '') => {
			if(!reBlankEncodes.test(data)) return false;
			let unzipped = PT.unzipClassicSudoku2(data);
			return unzipped.length === 81;
		};
		PT.isCTC = data => {
			if(PT.isPZZipped(data)) return true;
			if(!PT.isJson(data)) return false;
			let json = JSON.parse(data);
			return (
				(json.cellSize === 50)
				&& Array.isArray(json.cells)
				&& Array.isArray(json.arrows)
				&& Array.isArray(json.cages)
				&& Array.isArray(json.lines)
				&& Array.isArray(json.regions)
				&& Array.isArray(json.overlays)
				&& Array.isArray(json.underlays)
			);
		};
		PT.isFPuzz = data => {
			if(PT.isFPuzzZipped(data)) return true;
			if(!PT.isJson(data)) return false;
			let json = JSON.parse(data);
			return (
				(Number.isInteger(json.size))
				&& Array.isArray(json.grid)
			);
		};
		PT.reSCF = /^scf(.*)/;
		PT.isSCF = data => PT.reSCF.test(data);
		PT.getPuzzleFormat = data => {
			if(PT.isClassic(data)) return 'classic';
			if(PT.isPZZipped(data)) return 'ctc.pz';
			if(PT.isCTC(data)) return 'ctc';
			if(PT.isFPuzzZipped(data)) return 'fpuzzles.lz';
			if(PT.isFPuzz(data)) return 'fpuzzles';
			if(PT.isSCF(data)) return 'scf';
			return 'unknown';
		};
	// tests
		PT.runTests = () => Promise.all([
				Promise.resolve('classic_M'),
				Promise.resolve('classicNOTVALID'),
				Promise.resolve('classicB6B91D7C2E15F4D9C3K6D4B3D25D4F8F87B4C5B7C3B'),
				fetch(PuzzleLoader.apiPuzzleUrlLegacy('ddGfd499G7')).then(res => res.text()),
				fetch(PuzzleLoader.apiPuzzleUrlLegacy('4FN8RN9LfN')).then(res => res.text()),
				fetch(PuzzleLoader.apiPuzzleUrlLocal('ddGfd499G7')).then(res => res.text()),
				fetch(PuzzleLoader.apiPuzzleUrlLocal('4FN8RN9LfN')).then(res => res.text()),
				loadFPuzzle.fpuzzlesFetchRawId('fpuzzlesyhkyz63b'),
				Promise.resolve('N4IgzglgXgpiBcBOANCA5gJwgEwQbT2AF9ljSSzKLryBdZQmq8l54+x1p7rjtn/nQaCR3PgIm9hk0UM6zR4rssW0iQA='),
				Promise.resolve('fpuzzlesN4IgzglgXgpiBcBmANCA5gJwgEwQbT2AF9ljSiBdZQks4qm88iiooA=='),
				Promise.resolve('N4IgzglgXgpiBcBmANCA5gJwgEwQbT2AF9ljSiBdZQks4qm88iiooA=='),
				Promise.resolve('{"size":3,"grid":[[{},{},{}],[{},{},{}],[{},{},{}]]}'),
			])
			.then(testData => {
				testData.forEach(data => {
					console.log('getPuzzleFormat("%s..."):', data.slice(0, 30), PuzzleTools.getPuzzleFormat(data));
				});
			});
	// Screenshots
		PT.puzzleToSvg = (opts = {}) => new Promise((resolve, reject) => {
			//const svgStyle = 'font-family:Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif;background:rgba(255,255,255,0)';
			const svgStyle = 'font-family:Tahoma, Verdana, sans-serif;background:rgba(255,255,255,255)';
			let {svg, serializer} = opts;
			if(svg === undefined) svg = opts.svg = document.querySelector(SvgRenderer.DefaultSelector);
			if(serializer === undefined) serializer = opts.serializer = new XMLSerializer();
			const boardBounds = SvgRenderer.getContentBounds(svg);
			let width = Math.ceil(-boardBounds.left + boardBounds.right), height = Math.ceil(-boardBounds.top + boardBounds.bottom);
			let svgCssText = [...document.styleSheets]
				.map(style => [...(style.rules || style.cssRules)].map(rule => rule.cssText).join('\n'))
				.join('\n');
			svgData = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="${width}" height="${height}" style="${svgStyle}">
				<style>@import url("/style.css")</style>
				<defs>
					<style type="text/css"><![CDATA[
						${svgCssText}
						#cell-highlights { display: none; }
					]]></style>
				</defs>
				${serializer.serializeToString(svg)}
			</svg>`;
			resolve(svgData);
		});
		PT.dataToBlobUrl = (data, type) => window.URL.createObjectURL(new Blob([data], {type}));
		PT.urlToImg = url => new Promise((resolve, reject) => {
			let img = document.createElement('img');
			img.onload = () => resolve(img);
			img.error = reject;
			img.src = url;
		});
		PT.svgToImg = data => new Promise((resolve, reject) => {
			let img = document.createElement('img');
			img.onload = () => resolve(img);
			img.error = reject;
			img.src = PT.dataToBlobUrl(data, 'image/svg+xml');
		});
		PT.imgToCanvas = img => {
			const {width, height} = img;
			let canvas = Object.assign(document.createElement('canvas'), {width, height}), ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			return canvas;
		};
		PT.imgToPngUrl = (img, opts = {}) => new Promise((resolve, reject) => {
			let {canvas} = opts;
			if(canvas === undefined) {
				canvas = opts.canvas = document.createElement('canvas');
				canvas.width = opts.width || 256;
				canvas.height = opts.height || 256;
				canvas.style.cssText = `
					image-rendering: -moz-crisp-edges;
					image-rendering: -webkit-crisp-edges;
					image-rendering: pixelated;
					image-rendering: crisp-edges;
				`;
			}
			let ctx = canvas.getContext('2d');
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			if(opts.background) {
				ctx.fillStyle = opts.background;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}
			let drawScale = scaleToFit(img, canvas);
			let w = img.width * drawScale, h = img.height * drawScale;
			let x = 0.5 * (canvas.width - w), y = 0.5 * (canvas.height - h);
			ctx.drawImage(img, x, y, w, h);
			resolve(canvas.toDataURL('image/png'));
		});
		PT.startDownload = (dataUrl, opts = {}) => {
			let {downloadA} = opts;
			if(opts.downloadA === undefined) {
				downloadA = opts.downloadA = document.createElement('a');
				downloadA.style.display = 'none';
				document.body.appendChild(downloadA);
			}
			downloadA.href = dataUrl;
			downloadA.setAttribute('download', opts.filename);
			downloadA.click();
		};
		PT.convertSvgToFormat = (svg, opts = {}) => Promise.resolve()
			.then(() => {
				switch(opts.format) {
					case 'svg': return svg;
					case 'img': return PT.svgToImg(svg);
					default: return PT.svgToImg(svg).then(img => PT.imgToPngUrl(img, opts));
				}
			});
		PT.downloadSvgToFormat = (svg, opts = {}) => Promise.resolve()
			.then(() => (opts.download === undefined) ? null : Promise.resolve()
					.then(() => {
					switch(opts.download) {
						case 'svg': return Promise.resolve(PT.dataToBlobUrl(svg, 'image/svg+xml'));
						case 'png': return PT.svgToImg(svg).then(img => PT.imgToPngUrl(img, opts));
						default: throw Error(`Invalid download format: "${opts.download}"`);
					}
				})
				.then(data => PT.startDownload(data, Object.assign({}, opts, {filename: `${opts.filename}.${opts.ext || opts.download}`})))
			);
		PT.createThumbnail = (opts = {}) => Promise.resolve(Framework.app)
			.then(app => Promise.resolve()
				.then(() => opts.puzzleId ? app.loadRemoteCTCPuzzle(opts.puzzleId) : null)
				.then(() => opts.clearProgress ? app.clearPuzzle() : null)
				.then(() => PT.puzzleToSvg(opts))
				.then(svg => Promise.all([
					PT.downloadSvgToFormat(svg, Object.assign({filename: `${app.puzzle.puzzleId}_thumb`}, opts)),
					PT.convertSvgToFormat(svg, opts)
				]))
				.then(([dl, res]) => res)
			);
		PT.createThumbnails = (puzzleIds, opts = {}) => {
			let thumbImgs = [], format = opts.format || 'png';
			const thumbExists = opts.checkExists
				? puzzleId => fetch(`/api/thumbnails/${puzzleId}_thumb.png`).then(res => res.status !== 404)
				: () => Promise.resolve(false);
			const fetchNextThumbnail = (puzzleIds) => Promise.resolve(puzzleIds.pop())
				.then(puzzleId => thumbExists(puzzleId).then(exists => exists ? null
					: PT.createThumbnail(Object.assign({puzzleId}, opts)).then(res => thumbImgs.push({id: puzzleId, res}))
				))
				.then(() => puzzleIds.length > 0
					? new Promise((resolve, reject) => setTimeout(resolve, 10)).then(() => fetchNextThumbnail(puzzleIds))
					: null
				)
				.then(() => thumbImgs);
			return fetchNextThumbnail(puzzleIds)
				.catch(err => console.error(err));
		};
		PT.createLinkedThumbnail = (filename, opts = {}) =>
			PuzzleTools.createThumbnail(Object.assign({width: 256, height: 256, format: 'png'}, opts))
			.then(PuzzleTools.urlToImg)
			.then(img => PuzzleTools.imgToCanvas(img))
			.then(canvas => Stegosaur.encode(canvas, document.location.pathname.replace(/^.*sudoku\/(.*)/, '$1')))
			.then(canvas => PuzzleTools.startDownload(canvas.toDataURL('image/png'), {filename}));
		PT.listenForLinkedThumbnailDrop = () => {
			window.addEventListener('dragenter', event => event.preventDefault());
			window.addEventListener('dragover', event => event.preventDefault());
			window.addEventListener('drop', event => {
				if(event.dataTransfer.types.includes('Files') && event.dataTransfer.files.length > 0 && event.dataTransfer.files[0].type === 'image/png') {
					event.preventDefault();
					Object.assign(new FileReader(), {onload: event => 
						PuzzleTools.urlToImg(event.target.result)
							.then(PuzzleTools.imgToCanvas)
							.then(canvas => document.location.pathname = `/sudoku/${Stegosaur.decode(canvas)}`)})
					.readAsDataURL(event.dataTransfer.files[0]);
				}
			});
		};
	// Cell iteration
		const A9 = [0,1,2,3,4,5,6,7,8];
		const A81 = [...Array(81).keys()];
		const idxToRow = A81.map(i => ~~(i / 9));
		const idxToCol = A81.map(i => i % 9);
		const idxToBox = A81.map(i => ~~(i / 27) * 3 + (~~(i / 3) % 3));
		const rowToIdx = A9.map(r => r * 9);
		const colToIdx = A9.map(c => c);
		const boxToIdx = A9.map(b => ~~(b / 3) * 27 + b * 3 % 9);
		const rowOff = A9.map(n => n);
		const colOff = A9.map(n => n * 9);
		const boxOff = A9.map(n => ~~(n / 3) * 9 + n % 3);
		const seenRow = A9.map(r => A9.map(n => rowToIdx[r] + rowOff[n]));
		const seenCol = A9.map(c => A9.map(n => colToIdx[c] + colOff[n]));
		const seenBox = A9.map(b => A9.map(n => boxToIdx[b] + boxOff[n]));
		const idxToRowN = A81.map(i => seenRow[idxToRow[i]].indexOf(i));
		const idxToColN = A81.map(i => seenCol[idxToCol[i]].indexOf(i));
		const idxToBoxN = A81.map(i => seenBox[idxToBox[i]].indexOf(i));
		Object.assign(PT, {
			A9, A81,
			idxToRow, idxToCol, idxToBox,
			rowToIdx, colToIdx, boxToIdx,
			rowOff, colOff, boxOff,
			seenRow, seenCol, seenBox,
			idxToRowN, idxToColN, idxToBoxN,
		});
		PT.idxToReg = {
			row: r => ~~(r / 9),
			col: c => (c % 9),
			box: b => ~~(b / 27) * 3 + (~~(b / 3) % 3)
		};
		PT.regToIdx = {
			row: i => i * 9,
			col: i => i,
			box: i => ~~(i / 3) * 27 + i * 3 % 9
		};
		PT.regToSeen = {
			row: (r,o=r*9) => [o+0,o+1,o+2,o+3,o+4,o+5,o+6,o+7,o+8],
			col: c => [c+0,c+9,c+18,c+27,c+36,c+45,c+54,c+63,c+72],
			box: (b,o=BOXTOIDX[b]) => [o+0,o+1,o+2,o+9,o+10,o+11,o+18,o+19,o+20]
		};
		PT.idxToSeen = {
			row: idx => PT.A9.map(n => ~~(idx / 9) * 9 + n),
			col: idx => PT.A9.map(n => (idx % 9) + n * 9),
			box: idx => PT.A9.map(n => ~~(idx / 27) * 27 + ~~((idx % 9) / 3) * 3 + ~~(n / 3) * 9 + n % 3)
		};
		PT.idxAligned = {
			row: (idxList, row = PT.idxToSeen.row(idxList[0])) => idxList.every(i => row.includes(i)),
			col: (idxList, col = PT.idxToSeen.col(idxList[0])) => idxList.every(i => col.includes(i)),
			box: (idxList, box = PT.idxToSeen.box(idxList[0])) => idxList.every(i => box.includes(i))
		};
		PT.getClassicSeenCells = idx => {
			let seen = [], row, col, box;
			for(let i = 0; i < 9; i++) {
				row = ~~(idx / 9) * 9 + i;
				col = (idx % 9) + i * 9;
				box = ~~(~~(idx / 9) / 3) * 3 * 9 + ~~((idx % 9) / 3) * 3 +	~~(i / 3) * 9 + i % 3;
				seen.push(row, col, box);
			}
			return [...new Set(seen)];
		};
	// SCF
		PT.decodeSCF = scf => {
			const codoku=p=>p.replace(/.0{0,5}/g,d=>String.fromCharCode((d=+d[0]+10*d.length)+(d<20?38:d<46?45:51)));
			const dedoku=p=>p.replace(/./g,d=>(d=d.charCodeAt()-(d>'Z'?61:d>'9'?55:48),d%10+'0'.repeat(d/10)));
			const createBlank = (givens = '') => {
				let cells = [], regions = [];
				for(var r = 0; r < 9; r++) {
					cells[r] = [];
					regions[r] = [];
					for(var c = 0; c < 9; c++) {
						cells[r][c] = {};
						regions[r][c] = [~~(r / 3) * 3 + ~~(c / 3), (r * 3) % 9 + c % 3];
						let digit = Number(givens[r * 9 + c]);
						if(digit !== 0) cells[r][c].value = digit;
					}
				}
				return {cells, regions};
			};
			const addRules = (puz, rules = '') => {
				rules.split('').forEach(rule => {
					switch(rule) {
						case 'w': // windoku
							puz.underlays = puz.underlays || [];
							[[2.5, 2.5], [2.5, 6.5], [6.5, 2.5], [6.5, 6.5]].forEach(center => puz.underlays.push({center, width: 3, height: 3, backgroundColor: '#CFCFCF'}));
							break;
						case 'x': // x-sudoku
							puz.lines = puz.lines || [];
							[[[0, 0], [9, 9]], [[0, 9], [9, 0]]].forEach(wayPoints => puz.lines.push({color: '#34BBE6', thickness: 2, wayPoints}));
							break;
					}
				});
				return puz;
			};
			let scfData = scf.replace(/(^scf|\.scf$)/, '');
			let decoded = dedoku(scfData);
			let givens = decoded.slice(0, 81);
			let rules = scfData.replace(new RegExp(`^${codoku(givens)}`), '');
			let puz = Object.assign({id: scf}, createBlank(givens));
			puz = addRules(puz, rules);
			return puz;
		};
	return PT;
})();

if(typeof module != 'undefined') module.exports = PuzzleTools;