const fsp = require('fs').promises;
const PuzzleTools = require('../puzzletools_lib.js');
const PuzzleZipper = require('../puzzlezipper_lib.js');
global.md5Digest = require('../md5digest.js');
const {decodeFPuzzleData, parseFPuzzle} = require('../fpuzzlesdecoder.js');

const decodeFPuzzles = fpuzzleData => PuzzleZipper.zip(JSON.stringify(parseFPuzzle(fpuzzleData)));

// Load puzzle data
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
	const writePuzzleRulesFile = async (puzzleRules, filename) => await fsp.writeFile(filename, `[\n${puzzleRules.map(row => JSON.stringify(row)).join(',\n')}\n]`, 'utf8');
	const createPuzzleRulesFile = async (puzzleDbFn, rulesFn) => {
		let puzzleRules = await extractPuzzleRules(puzzleDbFn);
		writePuzzleRulesFile(puzzleRules, rulesFn);
	};
	const loadFPuzzlesRules = async puzzleFn => {
		let fpuzzles = await loadJson(puzzleFn);
		return fpuzzles.map(([title, fpuzzleData, solution], id) => {
			let fpuzzle = decodeFPuzzleData(fpuzzleData);
			let puzzle = parseFPuzzle(fpuzzleData);
			let metaData = extractPuzzleMeta(puzzle);
			let rules = (metaData.rules || []).join('\n');
			return {id, rules, fpuzzle};
		});
	};

// Rules
	const reCells = '((identical )?digits|(two )?cells)';
	const reCannotAppear = 'cannot (be( either)?|appear)( within)?';
	const reSeparated = 'separated by';
	const reThatAre = 'that are';
	const reAnti = '(standard )?anti-?';
	const reConstraint = ' ?(rules?|constraint)?( appl(y|ies))?';
	const reApart = '(apart|of each other|\\(touching each other diagonally\\))';
	const reCannotContain = '(cannot|can\'t) (contain|have) the same (digit|value)';
	const reMustNot = 'apart (must not|cannot) contain the same digit';
	const reKnights = '(.+? or )?(a( chess)? )?knight(\'s)?( move)?( or .+?)?( \\(?in chess\\)?)?';
	const reKings = '(.+? or )?(a( chess)? )?king(\'s)?( move)?( or .+?)?( \\(?in chess\\)?)?';
	const reRuleAntiChess = reChessMove => new RegExp(`(${[
		`${reAnti}${reChessMove}${reConstraint}`,
		`${reCells} ${reCannotAppear} ${reChessMove} ${reApart}`,
		`${reCells} ${reSeparated} ${reChessMove} ${reCannotContain}`,
		`${reCells} ${reThatAre} ${reChessMove} ${reMustNot}`,
	].join('|')})`, 'i');
	const reRuleAntiKnight = reRuleAntiChess(reKnights);
	const reRuleAntiKing = reRuleAntiChess(reKings);

// Testing
	const testRuleCheck = (checkRe, puzzles) => {
		console.log('testRuleCheck:', puzzles.length);
		puzzles.forEach(({id, rules}) => {
			let text = rules.replace(/\n/g, ' ');
			let m = text.match(checkRe);
			if(m !== null) {
				console.log('    [%s] pass: "%s"', id, m[0]);
			}
			else {
				console.log('[%s] \x1b[31m  FAIL: "%s"\x1b[0m', id, text);
			}
		});
	};
	const testAntiKnight = puzzleRules => {
		const excludedIds = ['DLFMNqR3H9', 'FjNPfrp29T', 'MF3rQB3Tgr', 'jGj4Gf36nb'];
		testRuleCheck(
			reRuleAntiKnight,
			puzzleRules.filter(({id, rules, fpuzzle}) => {
				let isAntiKnight = (fpuzzle && fpuzzle.antiknight) || rules.match(/knight/im);
				return isAntiKnight && !excludedIds.includes(id);
			})
		);
	}
	const testAntiKing = puzzleRules => {
		const excludedIds = ['6nb6Ndf63L', 'ndM7Hr7PQm'];
		testRuleCheck(
			reRuleAntiKing,
			puzzleRules.filter(({id, rules, fpuzzle}) => {
				let isAntiKing = (fpuzzle && fpuzzle.antiking) || rules.match(/[\s\-]king(\s|\')/im);
				return isAntiKing && !excludedIds.includes(id);
			})
		);
	}

(async () => {
	let puzzleRules = [
		...await loadJson('./src/rulesparser/puzzlerules.json'),
		...await loadFPuzzlesRules('./src/rulesparser/testfpuzzles.json')
	];

	console.log('Testing anti-knight rule:');
	testAntiKnight(puzzleRules);
	console.log('Testing anti-king rule:');
	testAntiKing(puzzleRules);
	
})();