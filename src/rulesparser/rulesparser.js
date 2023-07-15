
const RulesParser = (() => {
	/*
	2022-08-23:
		- "Cells a knight's move (in chess) apart may not contain the same digit."
	*/

	// Helpers
		const normalizeRules = (rules = '') => (
				Array.isArray(rules)
				? rules.join('\n')
				: rules
			)
			.replace(/\s*[.]*\s*([\n]\s*)+([\-*]+\s*)*/gm, '. ')
			.replace(/ +/gm, ' ')
			.replace(/:\./gm, ':')
			.replace(/^\s*[-*]*\s*|\s*$/, '');
		const makeReHasRuleTester = reHasRule => rules => (normalizeRules(rules).match(reHasRule) || [])[1];

	// Helper RegExs
		const reRuleStart = `(?:^|[.]|,|,?\\s*and)\\s*(?:[-*1-9❶-❾+]+\.?)?\\s*`;
		const reRuleEnd = `([.]|$| - )`;
		const reCan = '(may|must|can)';
		const reCannot = `(((${reCan}) ?)not|can\'t)`;
		const reShortRule = '(normal sudoku|killer cages?|little killers?|odds?|evens?)';
		const reValue = `(the )?(clue|digit|value|number|cell|square|total)s?`;
		const reCells = `(the )?(((any|no) )?two )?((identical|neighboring|adjacent|pairs of) )?(${reValue}s|those)( in ((adjacent|a) )?cells?)?`;
		const reSeeValue = `see (the same ${reValue}|each other)`;
		const reSeparated = `(which )?(always )?(sep[ae]rated|connected|joined|that share an edge|marked|${reSeeValue})(\\.? (by|with))?`;
		const reThatAre = '(that are|a|within)';
		const reNormal = `(standard|normal|regular|usual)`;
		const reDifferent = `(be )?different`;
		const reContain = `((contain|have|be) the same ${reValue}|repeat)`;
		const reMustBeDifferent = `(${reCan} ${reDifferent}|${reCannot} ${reContain})`;

	// anti-king, anti-knight
		const reCannotAppear = `${reCannot} (be( either)?|appear|repeat|${reSeeValue})( (${reThatAre}|in (any )?cells))?`;
		const reAnti = `((${reNormal} )?anti-?)?`;
		const reConstraint = ' ?(rules?|constraint)?( appl(y|ies))?';
		const reInChess = `\\(?in chess\\)?`;
		const reApart = `(apart|away|((apart|away) )?(of|from) each other|\\(touching each other diagonally\\))( ${reInChess})?`;
		const reChess = `(.+? or )?(${reThatAre} )?(a )?([(]?chess[)]? )?`;
		const reSMove = `(\'?s)?([- ]move)?( or [^.]+?)?( ${reInChess})?`;
		const reKingCannotTouch = `[(]i[.]e[.] cannot touch diagonally[)]`;
		const reChessShortRule = move => `${reAnti}${reChess}${move}(?<![a-z])${reSMove}( and [^.:]+ )?${reConstraint}`;
		const reRuleAntiChess = move => new RegExp(`${reRuleStart}(${[
			`${reChessShortRule(move)}`,
			`${reChessShortRule(move)}: ${reCells} ${reSeparated} ${reChess}${move}${reSMove} ${reCan} ${reContain}`,
			`${reChessShortRule(move)}: ${reCells} ${reSeparated} ${reChess}${move}${reSMove} ${reMustBeDifferent}`,
			`${reChessShortRule(move)}: ${reCells} ${reThatAre} ${reChess}${move}${reSMove} ${reApart} ${reMustBeDifferent}`,
			`${reCells} ${reCannotAppear} ${reChess}${move}${reSMove} ${reApart}( ${reKingCannotTouch})?`,
			`${reCells} ${reSeparated} ${reChess}${move}${reSMove} ${reCannot} ${reContain}`,
			`${reCells} ${reThatAre} ${reChess}${move}${reSMove} ${reApart} ${reCannot} ${reContain}`,
		].join('|')})${reRuleEnd}`, 'i');
		const reRuleAntiKnight = reRuleAntiChess('knight');
		const reRuleAntiKing = reRuleAntiChess('king');
		const hasAntiKnight = makeReHasRuleTester(reRuleAntiKnight);
		const hasAntiKing = makeReHasRuleTester(reRuleAntiKing);

	// killer cages
		const reGiven = '(small|given|provided)';
		const reOptional = `\\(if ${reGiven}\\)`;
		const reKillerRule = '(standard )?killer( rule applies)?';
		const reKillerCage = '((a|the|each) )?(killer )?cages?';
		const reDigitsInCage = `(${reValue} in ${reKillerCage}|in ${reKillerCage}, ${reValue})`;
		const reMustSum = '(and )?(must )?sum';
		const reGivenValue = `to the (${reGiven} )?${reValue}`;
		const reIndicated = `(written|indicated)( ${reOptional})?`;
		const reCageCorner = `((written|indicated)? )?in the top left( corner)?( of the cage)?( ${reOptional})?`;
		const reNoRepeat = `${reCannot} repeat`;
		const reInCage = `(in|within) ${reKillerCage}`;
		const reNoRepeatInCage = `((\. )?${reValue}|, and) ${reNoRepeat} ${reInCage}`;
		const reHasKillerCage = new RegExp(`(${[
			`${reShortRule}, ${reKillerCage}|${reKillerCage}, ${reShortRule}(, [^,]+)*`,
			`${reDigitsInCage} ${reMustSum} ${reGivenValue} ${reGiven}`,
			`(${reNoRepeatInCage}\. )?${reDigitsInCage} ${reMustSum} ${reGivenValue} ${reCageCorner}(${reNoRepeatInCage})?`,
			`${reDigitsInCage} ${reNoRepeat},? and ${reMustSum} ${reGivenValue}( (${reIndicated}|${reCageCorner}))?`,
			`${reNoRepeatInCage}(, which show their sums?)?`,
			].join('|')})${reRuleEnd}`, 'i');
		const hasKillerCage = makeReHasRuleTester(reHasKillerCage);

	// XV
		const reStandardXV = `((standard|normal) )?(V|X|XV|X\\/V|XVXV)( pairs)?( rules apply)?`;
		const reAnThe = `((an?|the|each) )?`;
		const reXV = `${reAnThe}["']*(V|X|XV)('?s)?["']*`;
		const reXVList = `${reXV}( (or|and) ${reXV})+`;
		const re510 = `${reAnThe}(5|10|15|five|ten|fifteen)`;
		const re510List = `${re510}( (or|and) ${re510})+`;
		const reXVSumTo_a = `${reXV} (must )?((contain|sep[ae]rates|joins?) (a pair of )?digits ((that|which) )?)?(sum(ming)?|add) to ${re510}(,? respectively)?`;
		const reXVSumTo_b = `${reXVList} (must )?((contain|sep[ae]rates|joins?) (a pair of )?digits ((that|which) )?)?(sum(ming)?|add) to ${re510List}(,? respectively)?`;
		const reXVSumTo_c = `${reCells} that sum to ${re510} are ${reSeparated} ${reXV}`;
		const reXVSumTo = `(${reXVSumTo_a}|${reXVSumTo_b}|${reXVSumTo_c})`;
		const reXVSumToList = `${reXVSumTo}(( (and|or) (by )?|[;,.] )${reXVSumTo})*([;,.]\s*)??`;
		const reXVPhrase = `${reCells} ${reSeparated} ${reXVSumToList}`;
		const reXVPhrases = `${reXVPhrase}(([;,.]|( (and|or))) ${reXVPhrase})*( respectively)?([;,.]\s*)??`;
		const reXVNoNeg = `\\(?(Not (all|every) (such )?(possibles? )?(${reXV}|${reXVList}) (are|is) (necessarily )?(given|shown)|(there is )?(no )?negative constraints?( do not apply)?)\\)?`;
		const reXVNeg = `All possible (${reXV}|${reXVList}) are given`;
		const reHasXV = new RegExp(`(${[
			`Cells separated by X must sum to 10\\. Not all Xs are necessarily given`,
			`${reXVPhrases} ${reXVNoNeg}`,
			`${reXVPhrases}`,
			`${reStandardXV} ${reXVNoNeg}`,
			`${reXVSumToList} ${reXVNoNeg}`,
			`${reXVSumToList}`,
			`(${reStandardXV}: )?${reXVPhrases} ${reXVNoNeg}`,
			`Standard rules apply for each variant`,
			`${reXV} joins are pair of digits which sum to 10\\. ${reXVNeg}`,
			`${reCells} with ${reXV} between them sum to ${re510}`,
			`${reXVPhrases} by ${reXVSumToList}\\. ${reXVNeg}`,
			`${reStandardXV} - ${reXVPhrases} digits ${reSeparated} ${reXVSumToList}\\. While all V's are given; not all X's are necessarily given`,
			`${reStandardXV}: An X between cells means they sum to 10, and a V between cells means they sum to 5\\. Not all Xs and Vs are necessarily given`,
			`Along a clued diagonal, all contiguous pairs of digits that sum to 5 \\(V\\) or 10 \\(X\\) are indicated, in the order that they appear`,
			`An X separates ${reCells} that add up to 10, a V separates ${reCells} that add up to 5\\. A white dot separates ${reCells} that are consecutive\\. Not all X,V and white dots are necessarily given`,
			`An X indicates that the digits must sum to 10 \\(no negative constraint\\)`,
			`${reCells} marked with ${reXVSumToList}\\. ${reCells} marked with ${reXVSumToList}\\. Not all Vs or Xs are given`,
			`${reXVPhrases} Cells NOT separated by an X or V must NOT sum to 10 or 5`,
			`${reXVPhrases} AND belong to two separate pentominoes\\. ${reXVNoNeg}`, // NOT 100%
			].join('|')})${reRuleEnd}`, 'im');
		const hasXV = makeReHasRuleTester(reHasXV);

	return {
		normalizeRules,
		hasAntiKnight,
		hasAntiKing,
		hasKillerCage,
		hasXV,
	};
})();

if(typeof module != 'undefined') module.exports = RulesParser;