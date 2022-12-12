const fsp = require('fs').promises;
const PuzzleTools = require('../puzzletools_lib.js');
const PuzzleZipper = require('../puzzlezipper_lib.js');
global.md5Digest = require('../md5digest.js');
const {
	normalizeRules,
	hasAntiKnight,
	hasAntiKing,
	hasKillerCage,
	hasXV
} = require('./rulesparser.js');
const loadFPuzzle = require('../fpuzzlesdecoder.js');
const {decodeFPuzzleData, encodeFPuzzleData, parseFPuzzle} = loadFPuzzle;


// Loading
	const loadJson = async fn => JSON.parse(await fsp.readFile(fn, 'utf8'));
	const puzzleDbUnzip = data => data === undefined ? data : JSON.parse(PuzzleZipper.unzip(data));
	const puzzleDbGet = (puzzleDb, puzzleId) => puzzleDbUnzip(puzzleDb.find(({id}) => id === puzzleId).data);
	const extractPuzzleMeta = function(puzzle = {}, tags = '[^: ]+') {
			const reMetaTags = new RegExp(`^(${tags.replace(',', '|')}):\\s*([\\s\\S]+)`, 'm');
			const metaData = puzzle.metaData || {};
			(puzzle.cages || []).forEach(cage => {
				if((cage.cells || []).length === 0) {
					let [_, metaName, metaVal] = (String(cage.value || '').match(reMetaTags) || []);
					if(metaName && metaVal) {
						if(metaName === 'rules') {
							metaData.rules = metaData.rules || [];
							metaData.rules.push(metaVal);
						}
						else {
							metaData[metaName] = metaVal;
						}
					}
					return;
				}
			});
			return metaData;
		};
	const puzzleDbExtractRules = puzzleDb => {
		let puzzleRules = [];
		puzzleDb.forEach(({id, data}) => {
			let metaData = extractPuzzleMeta(puzzleDbUnzip(data));
			let rules = (metaData.rules || []).join(' ');
			if(rules.length > 0) puzzleRules.push({id, rules});
		});
		return puzzleRules;
	};
	const extractPuzzleRules = async puzzleDbFn => puzzleDbExtractRules(await loadJson(puzzleDbFn));
	const writePuzzleRulesFile = async (puzzleRules, filename) => await fsp.writeFile(filename, `[\n ${puzzleRules.map(row => JSON.stringify(row)).join('\n,')}\n]`, 'utf8');
	const createPuzzleRulesFile = async (puzzleDbFn, rulesFn) => {
		let puzzleRules = await extractPuzzleRules(puzzleDbFn);
		writePuzzleRulesFile(puzzleRules, rulesFn);
	};
	const fpuzzleToTestData = fpuzzleData => {
		let fpuzzle = decodeFPuzzleData(fpuzzleData);
		let puzzle = parseFPuzzle(fpuzzleData);
		let metaData = extractPuzzleMeta(puzzle);
		let rules = (metaData.rules || []).join('\n');
		let hasRule = [];
		const {antiknight, antiking, killercage, xv} = fpuzzle;
		['antiknight', 'antiking', 'killercage', 'xv']
			.forEach(rule =>
				fpuzzle[rule] === true ||
				(Array.isArray(fpuzzle[rule]) && fpuzzle[rule].length > 0)
				? hasRule.push(rule)
				: null
			);
		return {id: `"${fpuzzle.title || ''}" by ${fpuzzle.author || ''}`, hasRule, rulestext: rules, fpuzzle};
	};
	const loadTestFPuzzles = async fn => (await loadJson(fn))
		.map(([title, puzzle, solution]) => puzzle)
		//.slice(-100)
		//.filter((p, i, arr) => [1, 14, 22, 25].includes(arr.length - i))
		.map(fpuzzleToTestData)
	const loadPuzzleList = async (fn, start = 0, end = Infinity, filterName) => (await loadJson(fn))
		.filter(({puzzle}) => puzzle !== undefined)
		.slice(start, end)
		.map(({puzzle}) => puzzle)
		.map(fpuzzleToTestData)
		.filter(p => ![
			'"Modifier Mystery" by mnasti2',
			'"Mystery Box" by Nahileon',
			'"Hot Whispers" by Man lvl 2',
			'"Oil and Water" by Will Power',
			'"6x6 wrogn CC" by lerroyy',
			'"Theseus" by Nordy',
			'"Chaos Construction : Wrogn" by lerroyy',
			'"Region Geometry X" by Emre Kolotoğlu',
			'"Kings and/or Knights" by Scruffamudda', // Missing global constraints
			].includes(p.id)
		)
		.filter(p => filterName === undefined || filterName === p.id);
	//const decodeFPuzzles = fpuzzleData => PuzzleZipper.zip(JSON.stringify(parseFPuzzle(fpuzzleData)));

// Testing
	const testRuleCheck = (checkFunc, puzzles, expected) => {
		let passed = 0;
		puzzles.forEach(({id, rulestext, fpuzzle}, idx) => {
			let m = checkFunc(rulestext);
			let ruleMatch = Array.isArray(m) && m.length > 0 || false;
			if(ruleMatch !== expected[idx]) {
				console.log('\x1b[31m  FAIL %s: "%s"\x1b[0m [%s] ', expected[idx] ? 'HAS' : 'NOT', id, JSON.stringify((m || [])[0]), idx);
				console.log(normalizeRules(rulestext));
				//console.log(encodeFPuzzleData(fpuzzle));
				return;
			}
			passed++;
			if(ruleMatch) {
				console.log('  \x1b[32mPASS\x1b[0m [%s] match:', id, JSON.stringify((m || [])[0]));
			}
		});
		return passed;
	};

// Tests
	let tests = [
		{label: 'anti-knight', checkFunc: hasAntiKnight, isExpected: ({hasRule = []}) => hasRule.includes('antiknight')},
		{label: 'anti-king', checkFunc: hasAntiKing, isExpected: ({hasRule = []}) => hasRule.includes('antiking')},
		{label: 'killercage', checkFunc: hasKillerCage, isExpected: ({hasRule = []}) => hasRule.includes('killercage')},
		{label: 'xv', checkFunc: hasXV, isExpected: ({hasRule = []}) => hasRule.includes('xv')},
	];

// Test Data
	const loadPuzzleRules_json = async testData => {
		fn = './src/rulesparser/puzzlerules.json';
		console.time(`loadJson(${JSON.stringify(fn)})`);
		testData.push(...await loadJson(fn));
		console.timeEnd(`loadJson(${JSON.stringify(fn)})`);
		console.log('testData.length:', testData.length);
	};
	const testfpuzzles_json = async testData => {
		fn = './src/rulesparser/testfpuzzles.json';
		console.time(`loadTestFPuzzles(${JSON.stringify(fn)})`);
		testData.push(...await loadTestFPuzzles(fn));
		console.timeEnd(`loadTestFPuzzles(${JSON.stringify(fn)})`);
		console.log('testData.length:', testData.length);
	};
	const puzzlelist_json = async testData => {
		fn = '../sudokudata/lmgfetch/puzzlelist.json';
		console.time(`loadPuzzleList(${JSON.stringify(fn)})`);
		testData.push(...await loadPuzzleList(fn, 0, 1000));
		console.timeEnd(`loadPuzzleList(${JSON.stringify(fn)})`);
		console.log('testData.length:', testData.length);
	};

(async () => {

	
	loadFPuzzle.logging = false;
	let testData = [], fn;

	let t0 = Date.now();
	console.time(`Load testData`);
	await loadPuzzleRules_json(testData);
	await testfpuzzles_json(testData);
	await puzzlelist_json(testData);
	console.timeEnd(`Load testData`);

	console.time(`Run tests`);
	tests
		.forEach(({label, checkFunc, isExpected}) => {
			console.log('Testing %s rule (Expected pass %s of %s)', label,
				testData.map(isExpected).filter(Boolean).length,
				testData.length
			);
			let passed = testRuleCheck(checkFunc, testData, testData.map(isExpected));
			console.log('\n  Passed %s of %s\n', passed, testData.length);
		});
	console.timeEnd(`Run tests`);

})();