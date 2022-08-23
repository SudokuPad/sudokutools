
const RulesParser = (() => {
	/*
	2022-08-23:
		- "Cells a knight's move (in chess) apart may not contain the same digit."
	*/

// Rules Helpers
	const reCannot = '((may |must |can)not|can\'t)';
	const reCells = '((identical )?digits|(two )?cells)';
	const reCannotAppear = `${reCannot} (be( either)?|appear|repeat)( within| in cells)?`;
	const reSeparated = 'separated by';
	const reThatAre = '(that are|a)';
	const reAnti = '(standard )?anti-?';
	const reConstraint = ' ?(rules?|constraint)?( appl(y|ies))?';
	const reApart = '(apart|of each other|\\(touching each other diagonally\\))';
	const reContain = `(contain|have) the same (digit|value)`;
	const reChess = '(.+? or )?(that are )?(a( chess)? )?';
	const reSMove = '(\'?s)?( move)?( or .+?)?( \\(?in chess\\)?)?';
	const reRuleAntiChess = move => new RegExp(`(${[
		`${reAnti}${reChess}${move}${reSMove}${reConstraint}`,
		`${reCells} ${reCannotAppear} ${reChess}${move}${reSMove} ${reApart}`,
		`${reCells} ${reSeparated} ${reChess}${move}${reSMove} ${reCannot} ${reContain}`,
		`${reCells} ${reThatAre} ${reChess}${move}${reSMove} ${reApart} ${reCannot} ${reContain}`,
	].join('|')})`, 'i');

// Rules Checks
	const reRuleAntiKnight = reRuleAntiChess('knight');
	const isAntiKnight = rules => rules.replace(/\n/g, ' ').match(reRuleAntiKnight);
	const reRuleAntiKing = reRuleAntiChess('king');
	const isAntiKing = rules => rules.replace(/\n/g, ' ').match(reRuleAntiKing);

	return {
		reRuleAntiChess,
		reRuleAntiKnight, isAntiKnight,
		reRuleAntiKing, isAntiKing
	};
})();

if(typeof module != 'undefined') module.exports = RulesParser;