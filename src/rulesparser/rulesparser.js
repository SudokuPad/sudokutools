const fsp = require('fs').promises;
const PuzzleTools = require('../puzzletools_lib.js');
const PuzzleZipper = require('../puzzlezipper_lib.js');

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

// Rules
	const reRuleAntiKnight = (() => {
		let reCells = '((identical )?digits|(two )?cells)';

		let reCannotAppear = 'cannot (be( either)?|appear within)';
		let reSeparated = 'separated by';
		let reThatAre = 'that are';

		let reKnights = '(.+? or )?(a( chess)? )?knight\'s( move)?( or .+?)?( \\(?in chess\\)?)?';

		let reApart = '(apart|of each other)';
		let reCannotContain = '(cannot|can\'t) (contain|have) the same (digit|value)';
		let reMustNot = 'apart (must not|cannot) contain the same digit';

		let phrases = [
			`${reCells} ${reCannotAppear} ${reKnights} ${reApart}`,
			`${reCells} ${reSeparated} ${reKnights} ${reCannotContain}`,
			`${reCells} ${reThatAre} ${reKnights} ${reMustNot}`,
		];

		return new RegExp(`(${phrases.join('|')})`, 'i');
	})();
	const reRuleAntiKing = (() => {
		let reCells = '((identical )?digits|(two )?cells)';

		let reCannotAppear = 'cannot (be( either)?|appear)( within)?';
		let reSeparated = 'separated by';
		let reThatAre = 'that are';

		let reKnights = '(.+? or )?(a( chess)? )?king\'s( move)?( or .+?)?( \\(?in chess\\)?)?';

		let reApart = '(apart|of each other|\\(touching each other diagonally\\))';
		let reCannotContain = '(cannot|can\'t) (contain|have) the same (digit|value)';
		let reMustNot = 'apart (must not|cannot) contain the same digit';

		let phrases = [
			`${reCells} ${reCannotAppear} ${reKnights} ${reApart}`,
			`${reCells} ${reSeparated} ${reKnights} ${reCannotContain}`,
			`${reCells} ${reThatAre} ${reKnights} ${reMustNot}`,
		];

		return new RegExp(`(${phrases.join('|')})`, 'i');
	})();

// Testing
	const testRuleCheck = (checkRe, puzzles) => {
		console.log('testRuleCheck:', puzzles.length);
		puzzles.forEach(({id, rules}) => {
			console.log('  %s', id);
			let text = rules.replace(/\n/g, ' ');
			let m = text.match(checkRe);
			if(m !== null) {
				console.log('    pass: "%s"', m[0]);
			}
			else {
				console.log('\x1b[31m  FAIL: "%s"\x1b[0m', text);
			}
		});
	};
	const testAntiKnight = puzzleRules => {
		const excludedIds = ['DLFMNqR3H9', 'FjNPfrp29T', 'MF3rQB3Tgr', 'jGj4Gf36nb'];
		testRuleCheck(
			reRuleAntiKnight,
			puzzleRules.filter(({id, rules}) => rules.match(/knight/im) && !excludedIds.includes(id))
		);
	}
	const testAntiKing = puzzleRules => {
		const excludedIds = ['6nb6Ndf63L', 'ndM7Hr7PQm'];
		testRuleCheck(
			reRuleAntiKing,
			puzzleRules.filter(({id, rules}) => rules.match(/\sking(\s|\')/im) && !excludedIds.includes(id))
		);
	}

(async () => {
	let puzzleRules = await loadJson('./src/rulesparser/puzzlerules.json');

	console.log('Testing anti-knight rule:');
	testAntiKnight(puzzleRules);
	console.log('Testing anti-king rule:');
	testAntiKing(puzzleRules);
})();