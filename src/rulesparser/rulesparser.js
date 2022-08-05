
const RulesParser = (() => {
// Rules Helpers
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

// Rules Checks
	const reRuleAntiKnight = reRuleAntiChess(reKnights);
	const isAntiKnight = rules => rules.replace(/\n/g, ' ').match(reRuleAntiKnight);
	const reRuleAntiKing = reRuleAntiChess(reKings);
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
		reKnights,
		reKings,
		reRuleAntiChess,
		reRuleAntiKnight, isAntiKnight,
		reRuleAntiKing, isAntiKing
	};
})();

if(module) module.exports = RulesParser;