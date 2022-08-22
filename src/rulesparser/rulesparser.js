
const RulesParser = (() => {
// Rules Helpers
	const reCannot = '(must not|cannot|can\'t)';
	const reCells = '((identical )?digits|(two )?cells)';
	const reCannotAppear = `${reCannot} (be( either)?|appear|repeat)( within| in cells)?`;
	const reSeparated = 'separated by';
	const reThatAre = 'that are';
	const reAnti = '(standard )?anti-?';
	const reConstraint = ' ?(rules?|constraint)?( appl(y|ies))?';
	const reApart = '(apart|of each other|\\(touching each other diagonally\\))';
	const reCannotContain = `${reCannot} (contain|have) the same (digit|value)`;
	const reMustNot = `apart ${reCannot} contain the same digit`;
	const reChess = '(.+? or )?(that are )?(a( chess)? )?';
	const reSMove = '(\'?s)?( move)?( or .+?)?( \\(?in chess\\)?)?';
	const reRuleAntiChess = move => new RegExp(`(${[
		`${reAnti}${reChess}${move}${reSMove}${reConstraint}`,
		`${reCells} ${reCannotAppear} ${reChess}${move}${reSMove} ${reApart}`,
		`${reCells} ${reSeparated} ${reChess}${move}${reSMove} ${reCannotContain}`,
		`${reCells} ${reThatAre} ${reChess}${move}${reSMove} ${reMustNot}`,
	].join('|')})`, 'i');

// Rules Checks
	const reRuleAntiKnight = reRuleAntiChess('knight');
	const isAntiKnight = rules => rules.replace(/\n/g, ' ').match(reRuleAntiKnight);
	const reRuleAntiKing = reRuleAntiChess('king');
	const isAntiKing = rules => rules.replace(/\n/g, ' ').match(reRuleAntiKing);

	return {
		reCells,
		reCannotAppear,
		reSeparated,
		reThatAre,
		reAnti,
		reConstraint,
		reApart,
		reCannotContain,
		reMustNot,
		reRuleAntiChess,
		reRuleAntiKnight, isAntiKnight,
		reRuleAntiKing, isAntiKing
	};
})();

if(typeof module != 'undefined') module.exports = RulesParser;