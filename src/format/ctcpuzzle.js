/*

Notes on the CTC puzzle format of Sam Cappleman-Lynes Legacy CtC puzzle tool.
Used internally by Sven's SudokuPad
fpuzzles data can be converted to CTC data, which can then be processed by SudokuPad

These likely will only work in the console of a sudokupad page, as they depend on various libraries.

For testing, a blank grid: https://sudokupad.app/scfoooooooooooook

*/

// Constants
	const UrlSudokuPadWebProduction = 'https://app.crackingthecryptic.com/sudoku/';
	const UrlSudokuPadWebTest = 'https://test.crackingthecryptic.com/sudoku/';
	const UrlSudokuPadWebNew = 'https://sudokupad.app/';

// Helpers
	const checkSudokuPadEnvironment = () => (typeof Framework === 'undefined') || (typeof loadFPuzzle === 'undefined')
		? (() => {throw new Error('SudokuPad components "Framework" and "loadFPuzzle" not found.')})()
		: true;
	const getFramework = () => (typeof Framework !== 'undefined') ? Framework : undefined;
	const getSourcePuzzle = () => getFramework()?.app?.sourcePuzzle;
	const ctcPuzzleStripFeatureData = ctcPuzzle => JSON.stringify(ctcPuzzle, (k, v) => (delete v.feature, v));
	const ctcPuzzleToCtcData = ctcPuzzle => `ctc${loadFPuzzle.compressPuzzle(ctcPuzzleStripFeatureData(ctcPuzzle))}`;
	const ctcPuzzleToSudokuPadUrl = (ctcPuzzle, rootpath = UrlSudokuPadWebNew) => checkSudokuPadEnvironment() && `${rootpath}${ctcPuzzleToCtcData(ctcPuzzle)}`;

// Tests & Demos
	const testCtcPuzzleToUrl = () => console.log('testCtcPuzzleToUrl:', ctcPuzzleToSudokuPadUrl(getSourcePuzzle()));
	const testNewPuzzleToUrl = () => {
		let ctcPuzzleData = {
			cells: [
				[{value: '9'}, {}, {}, {}, {}, {}, {}, {}, {}], // Given 9 at R1C1
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}],
				[{}, {}, {}, {}, {}, {}, {}, {}, {}]
			],
			regions: [
				[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]] // 3x3 region from R1C1 to R3C3
			]
		};
		console.log('ctcPuzzleData:', ctcPuzzleData);
		console.log('ctcPuzzleData to URL:', ctcPuzzleToSudokuPadUrl(ctcPuzzleData));
	};
testCtcPuzzleToUrl();
