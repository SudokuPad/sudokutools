const sudokupacking = require('./sudokupacking');

// Test data
	const TestData = {
		puzzle: {
			s81: '379281654164975283285643719937452168658317492412896375723568941546139827891724536',
			p81: '000001000064000280080003010907400000000010000000006305020500040046000820000700000'
		},
		withCages: {
			s81: '168957324529438167347216598851369472492785631673124985985642713734891256216573849',
			cages: [[[0,0],[0,1]],[[0,2],[1,2]],[[0,3],[0,4]],[[0,5],[1,4],[1,5],[1,6]],[[0,6],[0,7]],[[0,8],[1,7],[1,8]],[[1,0],[1,1]],[[1,3],[2,3]],[[2,0],[3,0]],[[2,1],[3,1]],[[2,2],[3,2]],[[2,4],[3,3],[3,4]],[[2,5],[2,6],[3,6]],[[2,7],[3,7]],[[2,8],[3,8],[4,8]],[[3,5],[4,5],[4,6]],[[4,0],[5,0],[6,0]],[[4,1],[5,1],[5,2]],[[4,2],[4,3],[5,3]],[[4,4],[5,4]],[[4,7],[5,7]],[[5,5],[6,5],[7,3],[7,4],[7,5]],[[5,6],[6,6]],[[5,8],[6,7],[6,8]],[[6,1],[6,2]],[[6,3],[6,4]],[[7,0],[7,1]],[[7,2],[8,2]],[[7,6],[7,7],[8,5],[8,6],[8,7]],[[7,8],[8,8]],[[8,0],[8,1]],[[8,3],[8,4]]]
		},
	};


const testS81Encoding = s81 => {
	const {encb64S81, decb64S81} = sudokupacking;
	console.log('  s81:', s81);
	let encodedS81 = encb64S81(s81);
	console.log('  encodedS81:', encodedS81.length, encodedS81);
	let decodedS81 = decb64S81(encodedS81);
	console.log('  decodedS81 === s81:', decodedS81 === s81);
};

const testP81Encoding = (p81, s81) => {
	const {encb64P81, decb64P81} = sudokupacking;
	console.log('  p81:', p81);
	let encodedP81 = encb64P81(p81);
	console.log('  encodedP81:', encodedP81.length, encodedP81);
	let decodedP81 = decb64P81(encodedP81, s81);
	console.log('  decodedP81 === p81:', decodedP81 === p81);
};

const testSp81Encoding = (testData) => {
	console.log('testSp81Encoding(testData);');
	const {s81, p81} = testData;
	testS81Encoding(s81);
	testP81Encoding(p81, s81);
};

const testCageEncoding = (testData) => {
	const {encb64Cages, decb64Cages} = sudokupacking;
	console.log('testCageEncoding(testData);');
	const {s81, cages} = testData;
	console.log('  s81:', s81);
	console.log('  cages:', cages);
	testS81Encoding(s81);
	let encodedCages = encb64Cages(cages);
	console.log('  encodedCages:', encodedCages.length, encodedCages);
	let decodedCages = decb64Cages(encodedCages);
	console.log('  decodedCages === cages:', JSON.stringify(decodedCages) === JSON.stringify(cages));
};

(async () => {
	testSp81Encoding(TestData.puzzle);
	testCageEncoding(TestData.withCages);
})();