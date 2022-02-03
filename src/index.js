import {RC} from './format/primitives.mjs';


console.log('Demos:');

console.log('RC.rcStep([1,1], [2,7]:');
RC.rcStep([1,1], [2,7], rc => console.log(rc));

console.log('RC.rcLine([1,1], [2,7]):', RC.rcLine([1,1], [2,7]));

let rcTestData = [
	'r2c7',
	'r2.5c7.5',
	'r12c3',
	'r12c03',
	'r12.2c03.4',
];
console.log('rcTestData:', rcTestData);
rcTestData.forEach(rcStr => {
		console.log('RC.parse(%s):', JSON.stringify(rcStr), RC.parse(rcStr));
	});

rcTestData.forEach(rcStr => {
		console.log('RC.stringify(%s):', JSON.stringify(RC.parse(rcStr)), RC.stringify(RC.parse(rcStr)));
	});

console.log('rcTestData.map(RC.parse):', rcTestData.map(RC.parse));
console.log('rcTestData.map(RC.parse).map(RC.toRC):', rcTestData.map(RC.parse).map(RC.toRC));