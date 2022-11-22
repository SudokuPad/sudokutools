/*
Unsupported:
*/
const loadFPuzzle = (() => {
	const fpuzzlesTinyIdLength = 20;
	const getRegionShape = (size = 9) => {
		let height = Math.sqrt(size);
		if(Number.isInteger(height)) return [height, height];
		height = Math.floor(height);
		while(!Number.isInteger(size / height) && height > 1) height--;
		return height > 0 ? [height, size / height] : [1, 1];
	};
	const highlightColours = '#a8a8a8a8,#000,#ffa0a0,#ffdf61,#feffaf,#b0ffb0,#61d060,#d0d0ff,#8180f0,#ff08ff,#ffd0d0'.split(',');
	const littlekillerDirs = {
		UR: [-1, 1],
		UL: [-1, -1],
		DR: [1, 1],
		DL: [1, -1],
	};
	const layerOrder = 'size,title,author,ruleset,clone,grid,disjointgroups,thermometer,killercage,arrow,difference,ratio,betweenline,lockout,quadruple,rectangle,circle,text,palindrome,line,minimum,maximum'.split(',');
	const base64Codec = (() => {
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
		function compressToBase64(input){
			if(input === null) return '';
			var res = _compress(input, 6, function(index){return keyStrBase64.charAt(index);});
			switch(res.length % 4){
				default:
				case 0: return res;
				case 1: return res + '===';
				case 2: return res + '==';
				case 3: return res + '=';
			}
		}
		function _compress(uncompressed, bitsPerChar, getCharFromInt){
			if(uncompressed == null)
				return "";
			var i, value,
				context_dictionary= {},
				context_dictionaryToCreate= {},
				context_c="",
				context_wc="",
				context_w="",
				context_enlargeIn= 2,
				context_dictSize= 3,
				context_numBits= 2,
				context_data=[],
				context_data_val=0,
				context_data_position=0,
				ii;

			for(ii = 0; ii < uncompressed.length; ii++){
				context_c = uncompressed.charAt(ii);
				if(!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)){
					context_dictionary[context_c] = context_dictSize++;
					context_dictionaryToCreate[context_c] = true;
				}

				context_wc = context_w + context_c;
				if(Object.prototype.hasOwnProperty.call(context_dictionary, context_wc))
					context_w = context_wc;
				else {
					if(Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)){
						if(context_w.charCodeAt(0) < 256){
							for(i = 0; i < context_numBits; i++){
								context_data_val = (context_data_val << 1);
								if(context_data_position == bitsPerChar - 1){
									context_data_position = 0;
									context_data.push(getCharFromInt(context_data_val));
									context_data_val = 0;
								} else context_data_position++;
							}
							value = context_w.charCodeAt(0);
							for(i = 0; i < 8; i++){
								context_data_val = (context_data_val << 1) | (value & 1);
								if(context_data_position == bitsPerChar - 1){
									context_data_position = 0;
									context_data.push(getCharFromInt(context_data_val));
									context_data_val = 0;
								} else context_data_position++;
								value = value >> 1;
							}
						} else {
							value = 1;
							for(i = 0; i < context_numBits; i++){
								context_data_val = (context_data_val << 1) | value;
								if(context_data_position == bitsPerChar - 1){
									context_data_position = 0;
									context_data.push(getCharFromInt(context_data_val));
									context_data_val = 0;
								} else context_data_position++;
								value = 0;
							}
							value = context_w.charCodeAt(0);
							for(i = 0; i < 16; i++){
								context_data_val = (context_data_val << 1) | (value & 1);
								if(context_data_position == bitsPerChar - 1){
									context_data_position = 0;
									context_data.push(getCharFromInt(context_data_val));
									context_data_val = 0;
								} else context_data_position++;
								value = value >> 1;
							}
						}
						context_enlargeIn--;
						if(context_enlargeIn == 0){
							context_enlargeIn = Math.pow(2, context_numBits);
							context_numBits++;
						}
						delete context_dictionaryToCreate[context_w];
					} else {
						value = context_dictionary[context_w];
						for(i = 0; i < context_numBits; i++){
							context_data_val = (context_data_val << 1) | (value & 1);
							if(context_data_position == bitsPerChar - 1){
								context_data_position = 0;
								context_data.push(getCharFromInt(context_data_val));
								context_data_val = 0;
							} else context_data_position++;
							value = value >> 1;
						}


					}
					context_enlargeIn--;
					if(context_enlargeIn == 0){
						context_enlargeIn = Math.pow(2, context_numBits);
						context_numBits++;
					}
					context_dictionary[context_wc] = context_dictSize++;
					context_w = String(context_c);
				}
			}

			if(context_w !== ""){
				if(Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)){
					if(context_w.charCodeAt(0) < 256){
						for(i = 0; i < context_numBits; i++){
							context_data_val = (context_data_val << 1);
							if(context_data_position == bitsPerChar - 1){
								context_data_position = 0;
								context_data.push(getCharFromInt(context_data_val));
								context_data_val = 0;
							} else context_data_position++;
						}
						value = context_w.charCodeAt(0);
						for(i = 0; i < 8; i++){
							context_data_val = (context_data_val << 1) | (value & 1);
							if(context_data_position == bitsPerChar - 1){
								context_data_position = 0;
								context_data.push(getCharFromInt(context_data_val));
								context_data_val = 0;
							} else context_data_position++;
							value = value >> 1;
						}
					} else {
						value = 1;
						for(i = 0; i < context_numBits; i++) {
							context_data_val = (context_data_val << 1) | value;
							if(context_data_position == bitsPerChar - 1){
								context_data_position = 0;
								context_data.push(getCharFromInt(context_data_val));
								context_data_val = 0;
							} else context_data_position++;
							value = 0;
						}
						value = context_w.charCodeAt(0);
						for(i = 0; i < 16; i++){
							context_data_val = (context_data_val << 1) | (value & 1);
							if(context_data_position == bitsPerChar - 1){
								context_data_position = 0;
								context_data.push(getCharFromInt(context_data_val));
								context_data_val = 0;
							} else context_data_position++;
							value = value >> 1;
						}
					}
					context_enlargeIn--;
					if(context_enlargeIn == 0){
						context_enlargeIn = Math.pow(2, context_numBits);
						context_numBits++;
					}
					delete context_dictionaryToCreate[context_w];
				} else {
					value = context_dictionary[context_w];
					for(i = 0; i < context_numBits; i++){
						context_data_val = (context_data_val << 1) | (value & 1);
						if(context_data_position == bitsPerChar - 1){
							context_data_position = 0;
							context_data.push(getCharFromInt(context_data_val));
							context_data_val = 0;
						} else context_data_position++;
						value = value >> 1;
					}


				}
				context_enlargeIn--;
				if(context_enlargeIn == 0){
					context_enlargeIn = Math.pow(2, context_numBits);
					context_numBits++;
				}
			}

			value = 2;
			for(i = 0; i < context_numBits; i++){
				context_data_val = (context_data_val << 1) | (value & 1);
				if(context_data_position == bitsPerChar - 1){
					context_data_position = 0;
					context_data.push(getCharFromInt(context_data_val));
					context_data_val = 0;
				} else context_data_position++;
				value = value >> 1;
			}

			while(true){
				context_data_val = (context_data_val << 1);
				if(context_data_position == bitsPerChar - 1){
					context_data.push(getCharFromInt(context_data_val));
					break;
				}
				else context_data_position++;
			}
			return context_data.join('');
		}
		return {
			decompress: decompressFromBase64,
			compress: compressToBase64
		};
	})();
	const puzzleHas = (puzzle, feature, part) => {
		const partStr = JSON.stringify(part);
		return (puzzle[feature] || []).map(item => JSON.stringify(item)).includes(partStr);
	};
	const puzzleAdd = (puzzle, feature, part, unique = false) => {
		if(puzzle[feature] === undefined) puzzle[feature] = [];
		if(unique === true && puzzleHas(puzzle, feature, part)) return;
		if(typeof part === 'object' && !Array.isArray(part)) {
			part = Object.keys(part).reduce((acc, cur) => Object.assign(acc, part[cur] === undefined ? {} : {[cur]: part[cur]}), {});
		}
		puzzle[feature].push(part);
	};
	const puzzleAddFogLamp = (fpuzzle, puzzle, [r, c]) => {
		const rows = fpuzzle.grid.length, cols = fpuzzle.grid[0].length;
		for(let r0 = Math.max(0, r - 1), r1 = Math.min(cols - 1, r + 1); r0 <= r1; r0++) {
			for(let c0 = Math.max(0, c - 1), c1 = Math.min(rows - 1, c + 1); c0 <= c1; c0++) {
				puzzleAdd(puzzle, 'foglight', [r0, c0], true);
			}
		}
	};
	const createBlankPuzzle = (fpuzzle, puzzle) => {
		puzzle = Object.assign(puzzle, {cellSize: 50, cells: [], regions: []});
		let regRC = getRegionShape(fpuzzle.size || 9);
		let regions = {};
		const convRegion = (r, c, region) => {
			if(region === null) return 'null';
			if(region === undefined) return Math.floor(r / regRC[0]) * regRC[0] + Math.floor(c / regRC[1]);
			return Number(region);
		};
		fpuzzle.grid.forEach((row, r) => {
			let newRow = [];
			puzzleAdd(puzzle, 'cells', newRow);
			row.forEach((cell, c) => {
				let newCell = {};
				newRow.push(newCell);
				if(cell.given) newCell.value = cell.value;
				if(cell.centerPencilMarks) newCell.centremarks = cell.centerPencilMarks;
				if(cell.cornerPencilMarks) newCell.pencilMarks = cell.cornerPencilMarks;
				let region = convRegion(r, c, cell.region);
				if(regions[region] === undefined) regions[region] = [];
				regions[region].push([r, c]);
			});
		});
		if(regions['null'] !== undefined) { // Handle "null" region
			puzzleAdd(puzzle, 'cages', {cells: regions['null'], unique: false, hidden: true});
			delete regions['null'];
		}
		Object.keys(regions).forEach(region => puzzleAdd(puzzle, 'regions', regions[region]));
	};
	const reMetaTags = /^([^: ]+):\s*(.+)/m;
	const reTransparentColor = /#([0-9a-f]{3}0|[0-9a-f]{6}00)/i;
	const reAllBlankSolution = /^([.]*|0*)$/;
	const isIntStrict = str => Number.isInteger(Number(str)) && String(Number(str)) === String(str);
	const puzzleAddMeta = (puzzle, key, val) => {
		if(puzzle.metaData === undefined) puzzle.metaData = {};
		let {metaData} = puzzle;
		if(metaData[key] === undefined) {
			metaData[key] = val;
		}
		else {
			if(!Array.isArray(metaData[key])) metaData[key] = [metaData[key]];
			metaData[key].push(val);
		}
	};
	const isMetaData = cage => {
		let noCells = (cage.cells || []).length === 0
		let noColor = reTransparentColor.test(cage.fontC || '#0000') &&  reTransparentColor.test(cage.outlineC || '#0000');
		let metaValue = reMetaTags.test(String(cage.value) || '');
		return (noCells || noColor) && metaValue;
	};
	const parseMetaData = (fpuzzle, puzzle) => {
		(fpuzzle.cage || []).forEach(cage => {
			if(!isMetaData(cage)) return;
			let [_, metaName, metaVal] = (String(cage.value || '').match(reMetaTags) || []);
			puzzleAddMeta(puzzle, metaName, metaVal);
		});
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
		const {cell, cells} = part;
		if(typeof cell === 'string') {
			return offsetRC(0.5, 0.5)(fpuzzlesParseRC(cell));
		}
		if(Array.isArray(cells) && cells.length > 0) {
			let [sr, sc] = cells.reduce(([r, c], rc) => offsetRC(r + 0.5, c + 0.5)(fpuzzlesParseRC(rc)), [0, 0]),
					len = cells.length;
			return [sr / len, sc / len];
		}
		throw new Error('Unable to calculate part center for: ' + JSON.stringify(part));
	};
	const fpuzzlesParseMeta = (from, to) => (fpuzzle, puzzle) => {
		if(fpuzzle[from]) puzzleAdd(puzzle, 'cages', {value: `${to}: ${fpuzzle[from]}`});
	};
	const applyDefaultMeta = (fpuzzle, puzzle, metaName, metaDefaultFunc) => {
		if(fpuzzle[metaName] === undefined && (typeof metaDefaultFunc === 'function')) {
			let defaultVal = metaDefaultFunc(fpuzzle, puzzle);
			if(defaultVal !== undefined) {
				puzzle.cages = puzzle.cages || [];
				if(puzzle.cages.find(cage => (cage.value || '').indexOf(`${metaName}: `) === 0) === undefined) {
					puzzle.cages.push({value: `${metaName}: ${defaultVal}`});
				}
			}
		}
	};
	const getDefaultTitle = (fpuzzle, puzzle) => 'Untitled';
	const getDefaultAuthor = (fpuzzle, puzzle) => 'Unknown';
	const getDefaultRules = (fpuzzle, puzzle) => 'No rules provided for this puzzle. Please check the related video or website for rules.';
	const getCellSize = typeof SvgRenderer !== 'undefined' ? SvgRenderer.CellSize : 64;
	const parse = {};
	parse.size = (fpuzzle, puzzle) => {};
	parse.disabledlogic = (fpuzzle, puzzle) => {};
	parse.truecandidatesoptions = (fpuzzle, puzzle) => {};
	parse.grid = (fpuzzle, puzzle) => {
		fpuzzle.grid.forEach((row, r) => {
			row.forEach((cell, c) => {
				let col = cell.c || (cell.cArray || [])[0];
				if(Array.isArray(cell.cArray) && cell.cArray.length > 1) {
					console.warn('f-puzzles decoder does not currently support multiple given colors. Please submit this puzzle for testing.');
				}
				if(highlightColours[parseInt(col)] !== undefined) col = highlightColours[parseInt(col)];
				if(![null, undefined].includes(col)) {
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
	parse.isSolutionBlank = solString => reAllBlankSolution.test(solString);
	parse.solution = (fpuzzle, puzzle) => {
		let solution = fpuzzle.solution || [];
		if(typeof solution === 'string') {
			solution = solution.split(solution.indexOf(',') !== -1 ? ',' : '');
		}
		const solString = solution.map(n => String(n)).join('');
		if(!parse.isSolutionBlank(solString)) {
			puzzleAdd(puzzle, 'cages', {value: `solution: ${solString}`});
		}
	};
	parse.antiknight = (fpuzzle, puzzle) => puzzleAddMeta(puzzle, 'antiknight', fpuzzle.antiknight);
	parse.antiking = (fpuzzle, puzzle) => puzzleAddMeta(puzzle, 'antiking', fpuzzle.antiking);
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
		let customStyle = {};
		try {
			customStyle = JSON.parse((puzzle.metaData || {}).customstyle || '{}');
		} catch (err) {
			console.warn('Invalid JSON in imported meta data "customStyle":', (puzzle.metaData || {}).customstyle);
		}
		if(customStyle.bulb && customStyle.bulb.color) customStyle.bulb.borderColor = customStyle.bulb.color;
		(fpuzzle.arrow || []).forEach(part => {
			part.lines.forEach(line => {
				if(line.length <= 1) console.error('Arrow has less than one point!');
				let points = line.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5));
				let dr = points[1][0] - points[0][0], dc = points[1][1] - points[0][1], dist = Math.sqrt(dr * dr + dc * dc);
				points[0][0] += Math.round(10 * 0.3 * Math.sign(dr) / dist) / 10;
				points[0][1] += Math.round(10 * 0.3 * Math.sign(dc) / dist) / 10;
				puzzleAdd(puzzle, 'arrows', Object.assign({
					color: '#a1a1a1',
					headLength: 0.3,
					thickness: 5,
					wayPoints: points
				}, customStyle.arrow));
			});
			let cells = part.cells.map(fpuzzlesParseRC).map(offsetRC(0.5, 0.5)), [min, max] = rcMinMax(cells);
			let bulbStrokeThickness = 5, bulbSize = 0.7;
			if((max[0] === min[0]) || (max[1] === min[1])) {
				puzzleAdd(puzzle, 'overlays', Object.assign({
					borderColor: '#a1a1a1',
					backgroundColor: '#ffffff',
					center: getPartCenter(part),
					fontSize: 16,
					thickness: bulbStrokeThickness,
					rounded: true,
					text: '',
					width: 0.75 + (max[1] - min[1]), height: 0.75 + (max[0] - min[0]),
				}, customStyle.bulb));
			}
			else {
				let lineThickness = Math.round(bulbSize * getCellSize());
				puzzleAdd(puzzle, 'lines', Object.assign({
					color: '#a1a1a1', thickness: lineThickness, opacity: 0.7,
					wayPoints: cells
				}, customStyle.bulb));
				puzzleAdd(puzzle, 'lines', Object.assign({
					color: '#ffffff', thickness: lineThickness - 2 * bulbStrokeThickness, opacity: 0.8,
					wayPoints: cells
				}));
			}
		});
	};
	parse.killercage = (fpuzzle, puzzle) => {
		(fpuzzle.killercage || []).forEach(cage => {
			let pCage = {unique: true};
			if(Array.isArray(cage.cells)) pCage.cells = cage.cells.map(fpuzzlesParseRC);
			if(cage.value) pCage.value = cage.value;
			if(isIntStrict(cage.value)) pCage.sum = parseInt(cage.value);
			puzzleAdd(puzzle, 'cages', pCage);
		});
	};
	parse.cage = (fpuzzle, puzzle) => {
		const reMetaCageValue = /^[a-z]+: /;
		(fpuzzle.cage || []).forEach(cage => {
			if(cage.value === 'FOW' && cage.cells.length === 1) {
				return puzzleAddFogLamp(fpuzzle, puzzle, fpuzzlesParseRC(cage.cells[0]));
			}
			if(cage.value === 'FOGLIGHT') {
				cage.cells.forEach(rc => puzzleAdd(puzzle, 'foglight', fpuzzlesParseRC(rc), true));
				return;
			}
			let cageOpts = Object.assign({}, cage, {cells: cage.cells.map(fpuzzlesParseRC)});
			if(cageOpts.style === undefined) {
				switch(cage.fromConstraint) {
					case 'Row Indexer': cageOpts.style = 'fpRowIndexer'; break;
					case 'Column Indexer': cageOpts.style = 'fpColumnIndexer'; break;
					case 'Box Indexer': cageOpts.style = 'fpBoxIndexer'; break;
				}
			}
			if(typeof cage.value === 'string' && cage.value.match(reMetaCageValue)) delete cageOpts.cells;
			puzzleAdd(puzzle, 'cages', cageOpts);
		});
	};
	parse.fogofwar = (fpuzzle, puzzle) => {
		(fpuzzle.fogofwar || []).forEach(rc => puzzleAddFogLamp(fpuzzle, puzzle, fpuzzlesParseRC(rc)));
	};
	parse.foglight = (fpuzzle, puzzle) => {
		(fpuzzle.foglight || []).forEach(rc => puzzleAdd(puzzle, 'foglight', fpuzzlesParseRC(rc), true));
	};
	parse['diagonal+'] = (fpuzzle, puzzle) => {
		let cellHeight = puzzle.cells.length, cellWidth = puzzle.cells.reduce((acc, cur) => Math.max(cur.length, acc), 0);
		puzzleAdd(puzzle, 'lines', {color: '#34BBE6', thickness: 2, wayPoints: [[0, cellWidth], [cellHeight, 0]]});
	};
	parse['diagonal-'] = (fpuzzle, puzzle) => {
		let cellHeight = puzzle.cells.length, cellWidth = puzzle.cells.reduce((acc, cur) => Math.max(cur.length, acc), 0);
		puzzleAdd(puzzle, 'lines', {color: '#34BBE6', thickness: 2, wayPoints: [[0, 0], [cellHeight, cellWidth]]});
	};
	parse.ratio = (fpuzzle, puzzle) => { // kropki
		(fpuzzle.ratio || []).forEach(part => {
			let opts = {
				borderColor: '#000000',
				backgroundColor: '#000000',
				center: getPartCenter(part),
				rounded: true,
				width: 0.3, height: 0.3,
				text: ''
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
				text: ''
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
	parse.lockout = (fpuzzle, puzzle) => {};
	parse.minMax = (puzzle, cells = [], inwards = true) => {
		let minRC = [1, 1], maxRC = [puzzle.cells.length, puzzle.cells[0].length];
		let a = inwards ? 0.44 : 0.39, b = inwards ? 0.39 : 0.44;
		let otherRCs = cells.map(({cell}) => cell);
		cells.forEach((part, idx, arr) => {
			let center = getPartCenter(part);
			puzzleAdd(puzzle, 'underlays', {backgroundColor: '#ccc', center, rounded: false, width: 1, height: 1});
			[[-1, 0], [0, 1], [1, 0], [0, -1]]
				.forEach(([dy, dx]) => {
					let neighbourRC = [Math.floor(center[0] + dy + 1), Math.floor(center[1] + dx + 1)];
					if(
						   (neighbourRC[0] < minRC[0]) || (neighbourRC[1] < minRC[1])
						|| (neighbourRC[0] > maxRC[0]) || (neighbourRC[1] > maxRC[1])
						|| otherRCs.indexOf(`R${neighbourRC[0]}C${neighbourRC[1]}`) !== -1) return;
					puzzleAdd(puzzle, 'lines', {
						color: '#000000',
						thickness: 1,
						wayPoints: [
							[center[0] + dy * a + 0.1 * dx, center[1] + dx * a + 0.1 * dy],
							[center[0] + dy * b, center[1] + dx * b],
							[center[0] + dy * a - 0.1 * dx, center[1] + dx * a - 0.1 * dy],
						]
					});
				});
		});
	};
	parse.minimum = (fpuzzle, puzzle) => {
		parse.minMax(puzzle, fpuzzle.minimum);
	};
	parse.maximum = (fpuzzle, puzzle) => {
		parse.minMax(puzzle, fpuzzle.maximum, false);
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
			let text = part.value && String(part.value).replace(/ /g, '\u00A0');
			if(typeof text === 'string' && text.length > 0) {
				puzzleAdd(puzzle, 'overlays', {
					color: part.fontC,
					textStroke: ['#fff', '#ffffff'].includes((part.fontC || '').toLowerCase())
						? '#000' : '#fff',
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
	const fixFPuzzleSlashes = data => {
		const LIMIT = 3000;
		let uriDecoded = decodeURIComponent(data), reSlash = /(\/)/g, segs = [], matches = [], pats = [];
		let fixed, combs, pos, seg, bits, m;
		if(uriDecoded.length < data.length) data = uriDecoded;
		if(base64Codec.decompress(data) !== null) return data;
		while((m = reSlash.exec(data)) !== null) matches.push(m.index);
		matches.length = Math.min(16, matches.length); // Sane limit
		combs = Math.pow(2, matches.length);
		for(var i = 0; i < combs; i++) pats.push(i.toString(2).padStart(matches.length, '0'));
		pats.sort((a, b) => a.replace(/0/g, '').length - b.replace(/0/g, '').length); // Sort by number of replacements
		if(pats.length > LIMIT) pats.length = LIMIT;
		for(var i = 0, len = pats.length; i < len; i++) {
			pos = 0;
			segs.length = 0;
			bits = pats[i];
			for(var i2 = 0, len2 = bits.length; i2 < len2; i2++) {
				if(bits[i2] === '1') {
					seg = data.slice(pos, matches[i2]);
					segs.push(seg, '//');
					pos += seg.length + 1;
				}
			}
			segs.push(data.slice(pos, data.length));
			fixed = segs.join('');
			if(base64Codec.decompress(fixed) !== null) return fixed;
		}
		return null;
	};
	const saveDecodeURIComponent = (str, dec) => (dec = decodeURIComponent(str), dec.length < str.length ? dec : str);
	const parseFPuzzle = fpuzzleRaw => {
		let fpuzzle = saveDecodeURIComponent(fpuzzleRaw);
		if(typeof fpuzzle === 'string') fpuzzle = JSON.parse(base64Codec.decompress(fpuzzle));
		let puzzle = {id: `fpuzzle${md5Digest(fpuzzleRaw)}`};
		createBlankPuzzle(fpuzzle, puzzle);
		parseMetaData(fpuzzle, puzzle);
		[...layerOrder, ...Object.keys(fpuzzle).filter(feature => !layerOrder.includes(feature))]
			.filter(feature => fpuzzle[feature] !== undefined)
			.forEach(feature => {
				if(typeof parse[feature] !== 'function') return console.error('Unsupported feature:', feature, fpuzzle[feature]);
				parse[feature](fpuzzle, puzzle);
			});
		applyDefaultMeta(fpuzzle, puzzle, 'title', loadPuzzle.getDefaultTitle);
		applyDefaultMeta(fpuzzle, puzzle, 'author', loadPuzzle.getDefaultAuthor);
		applyDefaultMeta(fpuzzle, puzzle, 'rules', loadPuzzle.getDefaultRules);
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

	const cleanPuzzlePackage = puzzlePackage => {
		if(puzzlePackage.match(/^fpuzzles/)) {
			try {
				let fpuzzle = JSON.parse(loadFPuzzle.decompressPuzzle(saveDecodeURIComponent(puzzlePackage.replace(/^fpuzzles/, ''))));
				// Remove cells from "customstyle" cages
				(fpuzzle.cage || []).forEach(cage => {
					if((cage.value || '').match(/^customstyle: /)) cage.cells.length = 0;
				});
				puzzlePackage = 'fpuzzles' + saveDecodeURIComponent(loadFPuzzle.compressPuzzle(JSON.stringify(fpuzzle)));
			}
			catch(err) {
				console.error(err);
			}
		}
		return puzzlePackage;
	};
	
	const decodeFPuzzleData = fpuzzleData => JSON.parse(base64Codec.decompress(fixFPuzzleSlashes(saveDecodeURIComponent(fpuzzleData))));
	const encodeFPuzzleData = fpuzzle => base64Codec.compress(JSON.stringify(fpuzzle));
	const fpuzzleAddSolution = (fpuzzleData, solution) => encodeFPuzzleData(Object.assign(decodeFPuzzleData(fpuzzleData), {solution}));


	loadPuzzle.fetchRawId = fetchRawId;
	loadPuzzle.parseFPuzzle = parseFPuzzle;
	loadPuzzle.decompressPuzzle = base64Codec.decompress;
	loadPuzzle.compressPuzzle = base64Codec.compress;
	loadPuzzle.fixFPuzzleSlashes = fixFPuzzleSlashes;
	loadPuzzle.saveDecodeURIComponent = saveDecodeURIComponent;
	loadPuzzle.getRegionShape = getRegionShape;
	loadPuzzle.getDefaultTitle = getDefaultTitle;
	loadPuzzle.getDefaultAuthor = getDefaultAuthor;
	loadPuzzle.getDefaultRules = getDefaultRules;
	loadPuzzle.cleanPuzzlePackage = cleanPuzzlePackage;
	loadPuzzle.decodeFPuzzleData = decodeFPuzzleData;
	loadPuzzle.encodeFPuzzleData = encodeFPuzzleData;
	loadPuzzle.fpuzzleAddSolution = fpuzzleAddSolution;
	return loadPuzzle;
})();

if(typeof module != 'undefined') module.exports = loadFPuzzle;