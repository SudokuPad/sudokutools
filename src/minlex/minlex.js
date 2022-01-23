const ROWS = 9, COLS = 9, R1 = ROWS - 1, C1 = COLS - 1;

const rePuzToRows = new RegExp(`(.{${COLS}})`, 'g');
const puzToStr = puz => Array.isArray(puz) ? puz.join('') : puz.toString();
const puzToLines = puz => (puzToStr(puz).match(rePuzToRows) || []).join('\n');
const puzToArr = puz => Array.isArray(puz) ? puz : puz.split('');

const idxToRC = i => [Math.floor(i / COLS), c = i % COLS];
const rcToIdx = (r, c) => Array.isArray(r) ? [r[0] * COLS + r[1]] : [r * COLS + c];

const puzMapRC = (puz, mapper) => puzToArr(puz).map((d, i, a) => a[rcToIdx(mapper(idxToRC(i)))]);

const rotFuncs = [
	([r, c]) => [r, c],
	([r, c]) => [r, C1 - c],
	([r, c]) => [R1 - r, c],
	([r, c]) => [R1 - r, C1 - c],
	([r, c]) => [c, r],
	([r, c]) => [c, R1 - r],
	([r, c]) => [C1 - c, r],
	([r, c]) => [C1 - c, R1 - r]
];
const puzRot = (puz, rot) => puzMapRC(puz, rotFuncs[rot]);

const puzSort = puzList => puzList.sort((a, b) => {
	a = puzToStr(a).replaceAll('.', '');
	b = puzToStr(b).replaceAll('.', '');
	if(a < b) return -1;
	if(a > b) return 1;
	return 0;
});

const mapInvert = (n, i, a) => a.indexOf(i);

const permsThree = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

const sortRowsInBlocks = puz => {
	const getRowOrder = puz => {
		const calcRowScore = r => {
			let {1: n, index: i} = puz.slice(r * COLS, (r + 1) * COLS).match(/([^\.]|$)/) || {};
			return [i, n];
		};
		const rowScoreSort = (a, b) => {
			let [ai, an] = calcRowScore(a), [bi, bn] = calcRowScore(b);
			if(ai === bi) return an - bn;
			return bi - ai;
		};
		return [0,1,2,3,4,5,6,7,8].sort(rowScoreSort).map(mapInvert);
	};
	let rowOrder;
	const rowOrderSort = (a, b) => rowOrder[a] - rowOrder[b];
	const blockSort = (a, b) => {
		let a0 = rowOrder[a + 0], b0 = rowOrder[b + 0];
		if(a0 !== b0) return a0 - b0;
		let a1 = rowOrder[a + 1], b1 = rowOrder[b + 1];
		if(a1 !== b1) return a1 - b1;
		let a2 = rowOrder[a + 2], b2 = rowOrder[b + 2];
		return a2 - b2;
	};
	rowOrder = getRowOrder(puz);
	let blockSorted = [
		...[0, 1, 2].sort(rowOrderSort),
		...[3, 4, 5].sort(rowOrderSort),
		...[6, 7, 8].sort(rowOrderSort)
		];
	rowOrder = getRowOrder(blockSorted.map(r => puz.slice(r * COLS, r * COLS + COLS)).join(''));
	console.log(puzToLines(
		[0, 3, 6]
		.sort(blockSort)
		.map(b => blockSorted.slice(b, b + 3).map(r => puz.slice(r * COLS, r * COLS + COLS)).join(''))
		.join('')
	));
	
};

let puz = '.....6.8..5....1.37.....45.2....7..8......23.....4..7..48.7.9..5..8.1...9..2...6.';

console.log('puz:', puz);
console.log('\n\n');
console.log(puzToLines(puz));
console.log('\n');
sortRowsInBlocks(puz);