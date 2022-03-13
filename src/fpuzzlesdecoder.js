
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
		txt = '';
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

const loadFPuzzle = (() => {
	const fpuzzlesTinyIdLength = 20;
	const regionShapes = {
		3: [1, 3],
		4: [2, 2],
		5: [1, 5],
		6: [2, 3],
		7: [1, 7],
		8: [2, 4],
		9: [3, 3],
		10:[2, 5],
		11:[1, 11],
		12:[3, 4],
		13:[1, 13],
		14:[2, 7],
		15:[3, 5],
		16:[4, 4],
	};
	const highlightColours = '#a8a8a8a8,#000,#ffa0a0,#ffdf61,#feffaf,#b0ffb0,#61d060,#d0d0ff,#8180f0,#ff08ff,#ffd0d0'.split(',');
	const littlekillerDirs = {
		UR: [-1, 1],
		UL: [-1, -1],
		DR: [1, 1],
		DL: [1, -1],
	};
	const layerOrder = 'size,title,author,ruleset,clone,grid,disjointgroups,thermometer,killercage,arrow,difference,ratio,betweenline,quadruple,rectangle,text'.split(',');
	const decompressPuzzle = data => {
		var f = String.fromCharCode;
		var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\\";
		var baseReverseDic = {};
		function getBaseValue(alphabet, character){
			if(!baseReverseDic[alphabet]){
				baseReverseDic[alphabet] = {};
				for(var i = 0; i < alphabet.length; i++) {
					baseReverseDic[alphabet][alphabet.charAt(i)] = i;
				}
			}
			return baseReverseDic[alphabet][character];
		}
		function decompressFromBase64(input){
			if(input == null) return "";
			if(input == "") return null;
			return _decompress(input.length, 32, function(index){return getBaseValue(keyStrBase64, input.charAt(index));});
		}
		function _decompress(length, resetValue, getNextValue){
			var dictionary = [],
				next,
				enlargeIn = 4,
				dictSize = 4,
				numBits = 3,
				entry = "",
				result = [],
				i,
				w,
				bits, resb, maxpower, power,
				c,
				data = {val: getNextValue(0), position: resetValue, index:1};
			for(i = 0; i < 3; i++)
				dictionary[i] = i;
			bits = 0;
			maxpower = Math.pow(2, 2);
			power = 1;
			while (power != maxpower) {
				resb = data.val & data.position;
				data.position >>= 1;
				if(data.position == 0){
					data.position = resetValue;
					data.val = getNextValue(data.index++);
				}
				bits |= (resb > 0 ? 1 : 0) * power;
				power <<= 1;
			}
			switch(next = bits){
				case 0:
					bits = 0;
					maxpower = Math.pow(2, 8);
					power=1;
					while (power != maxpower) {
						resb = data.val & data.position;
						data.position >>= 1;
						if(data.position == 0){
							data.position = resetValue;
							data.val = getNextValue(data.index++);
						}
						bits |= (resb > 0 ? 1 : 0) * power;
						power <<= 1;
					}
					c = f(bits);
					break;
				case 1:
					bits = 0;
					maxpower = Math.pow(2, 16);
					power = 1;
					while(power != maxpower){
						resb = data.val & data.position;
						data.position >>= 1;
						if(data.position == 0){
							data.position = resetValue;
							data.val = getNextValue(data.index++);
						}
						bits |= (resb > 0 ? 1 : 0) * power;
						power <<= 1;
					}
					c = f(bits);
					break;
				case 2:
					return "";
			}
			dictionary[3] = c;
			w = c;
			result.push(c);
			while(true){
				if(data.index > length) return "";
				bits = 0;
				maxpower = Math.pow(2, numBits);
				power = 1;
				while(power != maxpower){
					resb = data.val & data.position;
					data.position >>= 1;
					if(data.position == 0){
						data.position = resetValue;
						data.val = getNextValue(data.index++);
					}
					bits |= (resb > 0 ? 1 : 0) * power;
					power <<= 1;
				}
				switch (c = bits) {
					case 0:
						bits = 0;
						maxpower = Math.pow(2, 8);
						power = 1;
						while(power != maxpower){
							resb = data.val & data.position;
							data.position >>= 1;
							if(data.position == 0){
								data.position = resetValue;
								data.val = getNextValue(data.index++);
							}
							bits |= (resb > 0 ? 1 : 0) * power;
							power <<= 1;
						}
						dictionary[dictSize++] = f(bits);
						c = dictSize-1;
						enlargeIn--;
						break;
					case 1:
						bits = 0;
						maxpower = Math.pow(2, 16);
						power=1;
						while(power != maxpower){
							resb = data.val & data.position;
							data.position >>= 1;
							if(data.position == 0){
								data.position = resetValue;
								data.val = getNextValue(data.index++);
							}
							bits |= (resb > 0 ? 1 : 0) * power;
							power <<= 1;
						}
						dictionary[dictSize++] = f(bits);
						c = dictSize-1;
						enlargeIn--;
						break;
					case 2:
						return result.join('');
				}
				if(enlargeIn == 0){
					enlargeIn = Math.pow(2, numBits);
					numBits++;
				}
				if(dictionary[c]){
					entry = dictionary[c];
				} else {
					if(c === dictSize){
						entry = w + w.charAt(0);
					} else return null;
				}
				result.push(entry);
				dictionary[dictSize++] = w + entry.charAt(0);
				enlargeIn--;
				w = entry;
				if(enlargeIn == 0){
					enlargeIn = Math.pow(2, numBits);
					numBits++;
				}
			}
		}
		return decompressFromBase64(data);
	};
	const puzzleAdd = (puzzle, feature, part) => {
		if(puzzle[feature] === undefined) puzzle[feature] = [];
		if(typeof part === 'object' && !Array.isArray(part)) {
			part = Object.keys(part).reduce((acc, cur) => Object.assign(acc, part[cur] === undefined ? {} : {[cur]: part[cur]}), {});
		}
		puzzle[feature].push(part);
	};
	const createBlankPuzzle = (fpuzzle, puzzle) => {
		puzzle = Object.assign(puzzle, {cellSize: 50, cells: [], regions: []});
		let regRC = regionShapes[fpuzzle.size || 9];
		let regions = {};
		fpuzzle.grid.forEach((row, r) => {
			let newRow = [];
			puzzleAdd(puzzle, 'cells', newRow);
			row.forEach((cell, c) => {
				let newCell = {};
				newRow.push(newCell);
				let defaultRegion = Math.floor(r / regRC[0]) * regRC[0] + Math.floor(c / regRC[1]);
				let region = defaultRegion;
				if(cell.region !== undefined) region = Number(cell.region);
				regions[region] = regions[region] || [];
				regions[region].push([r, c]);
				if(cell.given) newCell.value = cell.value;
				if(cell.centerPencilMarks) newCell.centremarks = cell.centerPencilMarks;
				if(cell.cornerPencilMarks) newCell.pencilMarks = cell.cornerPencilMarks;
			});
		});
		Object.keys(regions).forEach(region => puzzleAdd(puzzle, 'regions', regions[region]));
	};
	const fpuzzlesParseRC = rc => rc.match(/R([0-9]+)C([0-9]+)/).slice(1, 3).map(Number).map(n => n - 1);
	const offsetRC = (or, oc) => ([r, c]) => [r + or, c + oc];
	const rcMinMax = rcs => {
		let min = [999, 999], max = [-999, -999];
		rcs.forEach(rc => {
			min[0] = Math.min(min[0], rc[0]);
			max[0] = Math.max(max[0], rc[0]);
			min[1] = Math.min(min[1], rc[1]);
			max[1] = Math.max(max[1], rc[1]);
		});
		return [min, max];
	};
	const getPartCenter = part => {
		if(typeof part.cell === 'string') {
			return offsetRC(0.5, 0.5)(fpuzzlesParseRC(part.cell));
		}
		if(Array.isArray(part.cells) && part.cells.length > 0) {
			let cells = part.cells.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5)), [min, max] = rcMinMax(cells);
			return [0.5 * (min[0] + max[0]), 0.5 * (min[1] + max[1])];
		}
		throw new Error('Unable to calculate part center for: ' + JSON.stringify(part));
	};
	const fpuzzlesParseMeta = (from, to) => (fpuzzle, puzzle) => {
		if(fpuzzle[from]) puzzleAdd(puzzle, 'cages', {value: `${to}: ${fpuzzle[from]}`});
	};
	const parse = {};
	parse.size = (fpuzzle, puzzle) => {};
	parse.disabledlogic = (fpuzzle, puzzle) => {};
	parse.truecandidatesoptions = (fpuzzle, puzzle) => {};
	parse.grid = (fpuzzle, puzzle) => {
		fpuzzle.grid.forEach((row, r) => {
			row.forEach((cell, c) => {
				if(cell.c) {
					let col = cell.c
					if(highlightColours[parseInt(col)] !== undefined) col = highlightColours[parseInt(col)];
					puzzleAdd(puzzle, 'underlays', {
						backgroundColor: col,
						center: [r + 0.5, c + 0.5],
						rounded: false,
						width: 1, height: 1,
					});
				}
			});
		});
	};
	parse.author =  fpuzzlesParseMeta('author', 'author');
	parse.title = fpuzzlesParseMeta('title', 'title');
	parse.author = fpuzzlesParseMeta('author', 'author');
	parse.ruleset = fpuzzlesParseMeta('ruleset', 'rules');
	parse.littlekillersum = (fpuzzle, puzzle) => {
		(fpuzzle.littlekillersum || []).forEach(part => {
			let rc = offsetRC(0.5, 0.5)(fpuzzlesParseRC(part.cell));
			let dir = littlekillerDirs[part.direction];
			let val = part.value !== undefined ? part.value : '_';
			puzzleAdd(puzzle, 'arrows', {
				color: '#000000',
				thickness: 2,
				wayPoints: [
					[rc[0] + 0.3 * dir[0], rc[1] + 0.3 * dir[1]],
					[rc[0] + 0.48 * dir[0], rc[1] + 0.48 * dir[1]]
				]
			});
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: '#FFFFFF',
				borderColor: '#FFFFFF',
				center: [rc[0] - 0 * dir[0], rc[1] - 0 * dir[1]],
				fontSize: 28,
				width: 0.25, height: 0.25,
				rounded: false,
				text: val
			});
		});
	};
	parse.arrow = (fpuzzle, puzzle) => {
		(fpuzzle.arrow || []).forEach(part => {
			part.lines.forEach(line => {
				if(line.length <= 1) console.error('Arrow has less than one point!');
				let points = line.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5));
				let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
				points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
				points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
				puzzleAdd(puzzle, 'arrows', {
					color: '#a1a1a1',
					headLength: 0.3,
					thickness: 5,
					wayPoints: points
				});
			});
			let cells = part.cells.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5)), [min, max] = rcMinMax(cells);
			puzzleAdd(puzzle, 'overlays', {
				borderColor: '#a1a1a1',
				backgroundColor: '#ffffff',
				center: getPartCenter(part),
				fontSize: 16,
				borderSize: 5,
				rounded: true,
				text: '',
				width: 0.65 + (max[1] - min[1]), height: 0.65 + (max[0] - min[0]),
			});
		});
	};
	parse.killercage = (fpuzzle, puzzle) => {
		(fpuzzle.killercage || []).forEach(cage => puzzleAdd(puzzle, 'cages', {value: cage.value, cells: cage.cells.map(fpuzzlesParseRC)}));
	};
	parse['diagonal+'] = (fpuzzle, puzzle) => {
		puzzleAdd(puzzle, 'lines', {color: '#34BBE6', thickness: 2, wayPoints: [[0, 9], [9, 0]]});
	};
	parse['diagonal-'] = (fpuzzle, puzzle) => {
		puzzleAdd(puzzle, 'lines', {color: '#34BBE6', thickness: 2, wayPoints: [[0, 0], [9, 9]]});
	};
	parse.ratio = (fpuzzle, puzzle) => { // kropki
		(fpuzzle.ratio || []).forEach(part => {
			let opts = {
				borderColor: '#000000',
				backgroundColor: '#000000',
				center: getPartCenter(part),
				rounded: true,
				width: 0.3, height: 0.3,
			};
			if(part.value) {
				opts.color = '#fff';
				opts.stroke = 'none';
				opts.text = part.value;
			}
			puzzleAdd(puzzle, 'overlays', opts);
		});
	};
	parse.difference = (fpuzzle, puzzle) => { // kropki
		(fpuzzle.difference || []).forEach(part => {
			let opts = {
				borderColor: '#000000',
				backgroundColor: '#FFFFFF',
				center: getPartCenter(part),
				rounded: true,
				width: 0.3, height: 0.3,
			};
			if(part.value) {
				opts.color = '#000';
				opts.stroke = 'none';
				opts.text = part.value;
			}
			puzzleAdd(puzzle, 'overlays', opts);
		});
	};
	parse.xv = (fpuzzle, puzzle) => {
		(fpuzzle.xv || []).forEach(part => {
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: '#FFFFFF', borderColor: '#FFFFFF',
				center: getPartCenter(part),
				fontSize: 21,
				rounded: false,
				width: 0.25, height: 0.25,
				text: part.value
			});
		});
	};
	parse.thermometer = (fpuzzle, puzzle) => {
		(fpuzzle.thermometer || []).forEach(part => {
			part.lines.forEach(line => {
				let cells = line.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5));
				puzzleAdd(puzzle, 'underlays', {
					borderColor: '#CFCFCF',
					backgroundColor: '#CFCFCF',
					center: cells[0],
					rounded: true,
					width: 0.85,
					height: 0.85,
				});
				puzzleAdd(puzzle, 'lines', {
					color: '#CFCFCF',
					thickness: 21,
					wayPoints: cells
				});
			});
		});
	};
	parse.palindrome = (fpuzzle, puzzle) => {
		(fpuzzle.palindrome || []).forEach(part => {
			part.lines.forEach(line => {
				puzzleAdd(puzzle, 'lines', {
					color: '#CFCFCF',
					thickness: 16,
					wayPoints: line.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5))
				});
			});
		});
	};
	parse.sandwichsum = (fpuzzle, puzzle) => {
		(fpuzzle.sandwichsum || []).forEach(part => {
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: '#FFFFFF', borderColor: '#FFFFFF',
				center: getPartCenter(part),
				fontSize: 32,
				rounded: false,
				width: 0.25, height: 0.25,
				text: part.value
			});
		});
	};
	parse.even = (fpuzzle, puzzle) => {
		(fpuzzle.even || []).forEach(part => {
			puzzleAdd(puzzle, 'underlays', {
				borderColor: '#CFCFCF', backgroundColor: '#CFCFCF',
				center: getPartCenter(part),
				rounded: false,
				width: 0.7, height: 0.7,
			});
		});
	};
	parse.odd = (fpuzzle, puzzle) => {
		(fpuzzle.odd || []).forEach(part => {
			puzzleAdd(puzzle, 'underlays', {
				borderColor: '#CFCFCF', backgroundColor: '#CFCFCF',
				center: offsetRC(0.5, 0.5)(fpuzzlesParseRC(part.cell)),
				rounded: true,
				width: 0.7, height: 0.7,
			});
		});
	};
	parse.extraregion = (fpuzzle, puzzle) => {
		(fpuzzle.extraregion || []).forEach(extraregion => {
			let cells = extraregion.cells.map(fpuzzlesParseRC);
			cells.map(offsetRC(0.5, 0.5)).forEach(cell => {
				puzzleAdd(puzzle, 'underlays', {
					backgroundColor: 'rgba(207, 207, 207, 0.95)',
					center: cell,
					rounded: false,
					width: 1,
					height: 1,
				});
			});
			puzzleAdd(puzzle, 'cages', {cells});
		});
	};
	parse.clone = (fpuzzle, puzzle) => {
		(fpuzzle.clone || []).forEach(part => {
			[...part.cells, ...part.cloneCells].map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5)).forEach(cell => {
				puzzleAdd(puzzle, 'underlays', {
					borderColor: '#CFCFCF',
					backgroundColor: '#CFCFCF',
					center: cell,
					rounded: false,
					width: 1,
					height: 1,
				});
			});
		});
	};
	parse.quadruple = (fpuzzle, puzzle) => {
		(fpuzzle.quadruple || []).forEach(part => {
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: '#FFFFFF', borderColor: '#000000',
				center: getPartCenter(part),
				fontSize: 14,
				rounded: true,
				width: 0.7, height: 0.7,
				text: part.values.reduce((acc, cur, idx) => acc + ((idx % 2) === 1 ? ' ' : '') + ((idx % 3) === 2? '\n' : '') + cur, '')
			});
		});
	};
	parse.betweenline = (fpuzzle, puzzle) => {
		(fpuzzle.betweenline || []).forEach(part => {
			part.lines.forEach(line => {
				let points = line.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5));
				let last = points.length - 1;
				puzzleAdd(puzzle, 'overlays', {
					borderColor: '#CFCFCF',
					backgroundColor: '#FFFFFF',
					center: [...points[0]],
					fontSize: 16,
					borderSize: 2,
					rounded: true,
					width: 0.8, height: 0.8,
				});
				puzzleAdd(puzzle, 'overlays', {
					borderColor: '#CFCFCF',
					backgroundColor: '#FFFFFF',
					center: [...points[last]],
					fontSize: 16,
					borderSize: 2,
					rounded: true,
					width: 0.8, height: 0.8,
				});
				let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
				points[0][0] += Math.round(10 * 0.4 * Math.sign(dr) / dist) / 10;
				points[0][1] += Math.round(10 * 0.4 * Math.sign(dc) / dist) / 10;
				dr = points[last - 1][0] - points[last][0]; dc = points[last - 1][1] - points[last][1]; dist = Math.sqrt(dr * dr + dc * dc);
				points[last][0] += Math.round(10 * 0.4 * Math.sign(dr) / dist) / 10;
				points[last][1] += Math.round(10 * 0.4 * Math.sign(dc) / dist) / 10;
				puzzleAdd(puzzle, 'lines', {color: '#CFCFCF', thickness: 2, wayPoints: points});
			});
		});
	};
	parse.minimum = (fpuzzle, puzzle) => {
		(fpuzzle.minimum || []).forEach(part => {
			let center = getPartCenter(part);
			[
				[[-0.5, 0], [-0.3, 0]],
				[[0, 0.5], [0, 0.3]],
				[[0.5, 0], [0.3, 0]],
				[[0, -0.5], [0, -0.3]],
			]
				.forEach(([[r1, c1],[r2, c2]]) => puzzleAdd(puzzle, 'arrows', {color: '#000000', thickness: 1, wayPoints: [[center[0] + r1, center[1] + c1], [center[0]  + r2, center[1] + c2]]}));
		});
	};
	parse.maximum = (fpuzzle, puzzle) => {
		(fpuzzle.maximum || []).forEach(part => {
			let center = getPartCenter(part);
			[
				[[-0.3, 0], [-0.5, 0]],
				[[0, 0.3], [0, 0.5]],
				[[0.3, 0], [0.5, 0]],
				[[0, -0.3], [0, -0.5]],
			]
				.forEach(([[r1, c1],[r2, c2]]) => puzzleAdd(puzzle, 'arrows', {color: '#000000', thickness: 1, wayPoints: [[center[0] + r1, center[1] + c1], [center[0]  + r2, center[1] + c2]]}));
		});
	};
	parse.line = (fpuzzle, puzzle) => {
		(fpuzzle.line || []).forEach(line => {
			line.lines.forEach(points => {
				puzzleAdd(puzzle, 'lines', {
					color: line.outlineC,
					thickness: 32 * line.width,
					wayPoints: points.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5))
				});
			});
		});
	};
	parse.rectangle = (fpuzzle, puzzle) => {
		(fpuzzle.rectangle || []).forEach(part => {
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: part.baseC,
				borderColor: part.outlineC,
				center: getPartCenter(part),
				borderSize: 1,
				rounded: false,
				width: part.width, height: part.height,
				text: part.value,
				angle: part.angle
			});
		});
	};
	parse.circle = (fpuzzle, puzzle) => {
		(fpuzzle.circle || []).forEach(part => {
			puzzleAdd(puzzle, 'overlays', {
				backgroundColor: part.baseC,
				borderColor: part.outlineC,
				center: getPartCenter(part),
				borderSize: 1,
				rounded: true,
				width: part.width, height: part.height,
				text: part.value,
				angle: part.angle
			});
		});
	};
	parse.text = (fpuzzle, puzzle) => {
		(fpuzzle.text || []).forEach(part => {
			let text = part.value && part.value.replace(/ /g, '\u00A0');
			if(typeof text === 'string' && text.length > 0) {
				puzzleAdd(puzzle, 'overlays', {
					backgroundColor: '#FFFFFF',
					borderColor: '#FFFFFF',
					color: part.fontC,
					center: getPartCenter(part),
					fontSize: Math.round(32 * (part.size || 1)),
					rounded: false,
					width: 0.25, height: 0.25,
					text: text,
					angle: part.angle
				});
			}
		});
	};
	parse.cage = (fpuzzle, puzzle) => {
		(fpuzzle.cage || []).forEach(cage => puzzleAdd(puzzle, 'cages', Object.assign({}, cage, {cells: cage.cells.map(fpuzzlesParseRC)})));
	};
	const parseFPuzzle = fpuzzleRaw => {
		let fpuzzle = fpuzzleRaw;
		let uriDecoded = decodeURIComponent(fpuzzle);
		if(uriDecoded.length < fpuzzle.length) fpuzzle = uriDecoded;
		if(typeof fpuzzle === 'string') fpuzzle = JSON.parse(decompressPuzzle(fpuzzle));
		let puzzle = {id: `fpuzzle${md5Digest(fpuzzleRaw)}`};
		createBlankPuzzle(fpuzzle, puzzle);
		[...layerOrder, ...Object.keys(fpuzzle).filter(feature => !layerOrder.includes(feature))]
			.filter(feature => fpuzzle[feature] !== undefined)
			.forEach(feature => {
				if(typeof parse[feature] !== 'function') return console.error('Unsupported feature:', feature, fpuzzle[feature]);
				parse[feature](fpuzzle, puzzle);
			});
		return puzzle;
	};
	const fetchRawId = rawId => rawId.length > fpuzzlesTinyIdLength
		? Promise.resolve(rawId)
		: fetch(`/api/puzzle/${rawId}`)
			.then(res => res.json())
			.then(res => res.result);
	const loadPuzzle = rawId => Promise.resolve()
		.then(() => fetchRawId(rawId))
		.then(fpuzzleRaw => fpuzzleRaw.replace(/^fpuzzles/, ''))
		.then(parseFPuzzle)
		.then(puzzle => {
			if(rawId.length < fpuzzlesTinyIdLength) puzzle.id = rawId;
			return PuzzleZipper.zip(JSON.stringify(puzzle));
		})
		.catch(err => (console.error('Error fetching FPuzzle:', err), Promise.reject(err)));
	
	loadPuzzle.fetchRawId = fetchRawId;
	loadPuzzle.parseFPuzzle = parseFPuzzle;
	loadPuzzle.decompressPuzzle = decompressPuzzle;
	return loadPuzzle;
})();

if(typeof module != 'undefined') module.exports = loadFPuzzle;