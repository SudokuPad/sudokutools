
const RulesParser = (() => {
	/*
	2022-08-23:
		- "Cells a knight's move (in chess) apart may not contain the same digit."
	*/

// Helpers
	const normalizeRules = rules => rules.replace(/[\n ]+/g, ' ').replace(/^ +| +$/, '');

// Helper RegExs
	const reCannot = '((may |must |can ?)not|can\'t)';
	const reShortRule = '(normal sudoku|killer cages?|little killers?|odds?|evens?)';
	const reRuleEnd = `([.]|$| - )`;

// anti-king, anti-knight
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
	const reRuleAntiKnight = reRuleAntiChess('knight');
	const isAntiKnight = rules => normalizeRules(rules).match(reRuleAntiKnight);
	const reRuleAntiKing = reRuleAntiChess('king');
	const isAntiKing = rules => normalizeRules(rules).match(reRuleAntiKing);

// killer cages
	const reOptional = '\\(if (given|provided)\\)';
	const reKillerRule = '(standard )?killer( rule applies)?';
	const reKillerCage = '((a|the|each) )?(killer )?cages?';
	const reDigits = `(the )?digits`;
	const reDigitsInCage = `(${reDigits} in ${reKillerCage}|in ${reKillerCage}, ${reDigits})`;
	const reMustSum = '(and )?(must )?sum';
	const reNumber = 'to the (small )?(clue|number|value)';
	const reIndicated = `(written|indicated)( ${reOptional})?`;
	const reCageCorner = `((written|indicated)? )?in the top left( corner)?( of the cage)?( ${reOptional})?`;
	const reNoRepeat = `${reCannot} repeat`;
	const reInCage = `(in|within) ${reKillerCage}`;
	const reNoRepeatInCage = `(. ${reDigits}|, and) ${reNoRepeat} ${reInCage}`;
	const reHasKillerCages = new RegExp(`(${[
		`${reShortRule}, ${reKillerCage}|${reKillerCage}, ${reShortRule}(, [^,]+)*`,
		`${reDigitsInCage} ${reMustSum} ${reNumber} given`,
		`${reDigitsInCage} ${reMustSum} ${reNumber} ${reCageCorner}(${reNoRepeatInCage})?`,
		`${reDigitsInCage} ${reNoRepeat},? and ${reMustSum} ${reNumber}( (${reIndicated}|${reCageCorner}))?`,
		`${reDigits} ${reNoRepeat} ${reInCage}(, which show their sums?)?`,
		].join('|')})${reRuleEnd}`, 'i');
	const hasKillerCages = rules => normalizeRules(rules).match(reHasKillerCages);

	return {
		normalizeRules,
		isAntiKnight,
		isAntiKing,
		hasKillerCages,
	};
})();

if(typeof module != 'undefined') module.exports = RulesParser;