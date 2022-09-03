const fsp = require('fs').promises;
const PuzzleTools = require('../puzzletools_lib.js');
const PuzzleZipper = require('../puzzlezipper_lib.js');
global.md5Digest = require('../md5digest.js');
const {decodeFPuzzleData, parseFPuzzle} = require('../fpuzzlesdecoder.js');
const {normalizeRules, isAntiKnight, isAntiKing, hasKillerCages} = require('./rulesparser.js');


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
	const loadFPuzzlesRules = async puzzleFn => {
		let fpuzzles = await loadJson(puzzleFn);
		return fpuzzles.map(([title, fpuzzleData, solution]) => {
			let fpuzzle = decodeFPuzzleData(fpuzzleData);
			let puzzle = parseFPuzzle(fpuzzleData);
			let metaData = extractPuzzleMeta(puzzle);
			let rules = (metaData.rules || []).join('\n');
			let hasRule = [];
			if(fpuzzle.antiknight) hasRule.push('antiknight');
			if(fpuzzle.antiking) hasRule.push('antiking');
			if(Array.isArray(fpuzzle.killercage) && fpuzzle.killercage.length > 0) hasRule.push('killercages');
			return {id: title, hasRule, rulestext: rules, fpuzzle};
		});
	};
	//const decodeFPuzzles = fpuzzleData => PuzzleZipper.zip(JSON.stringify(parseFPuzzle(fpuzzleData)));

// Testing
	const testRuleCheck = (checkFunc, puzzles, expected) => {
		let passed = 0;
		puzzles.forEach(({id, rulestext}, idx) => {
			let m = checkFunc(rulestext);
			let ruleMatch = m !== null && m !== false;
			if(ruleMatch !== expected[idx]) {
				console.log('\x1b[31m  FAIL: "%s"\x1b[0m [%s] ', id, JSON.stringify((m || [])[0]));
				return;
			}
			passed++;
			if(ruleMatch) console.log('  \x1b[32mPASS\x1b[0m [%s] match:', id, JSON.stringify(m[0]));
		});
		return passed;
	};

// Tests
	let tests = [
		{label: 'anti-knight', checkFunc: isAntiKnight, isExpected: ({hasRule = []}) => hasRule.includes('antiknight')},
		{label: 'anti-king', checkFunc: isAntiKing, isExpected: ({hasRule = []}) => hasRule.includes('antiking')},
		{label: 'killercages', checkFunc: hasKillerCages, isExpected: ({hasRule = []}) => hasRule.includes('killercages')},
	];

(async () => {

	let testData = [
		...await loadJson('./src/rulesparser/puzzlerules.json'),
		...await loadFPuzzlesRules('./src/rulesparser/testfpuzzles.json')
	];

	tests
		.forEach(({label, checkFunc, isExpected}) => {
			console.log('Testing %s rule (Expected pass %s of %s)', label,
				testData.map(isExpected).filter(Boolean).length,
				testData.length
			);
			let passed = testRuleCheck(checkFunc, testData, testData.map(isExpected));
			console.log('\n  Passed %s of %s\n', passed, testData.length);
		});
	
})();