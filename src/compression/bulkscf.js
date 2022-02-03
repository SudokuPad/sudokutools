const util = require('util');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const exec = util.promisify(require('child_process').exec);
const readline = require('readline');
const {
	puzToStr,
	puzToLines,
} = require('../puzdebug');
const PT = require('../puzzletools_lib');


//const codoku=p=>p.replace(/.0{0,5}/g,d=>String.fromCharCode((d=+d[0]+10*d.length)+(d<20?38:d<46?45:51)));
const dedoku=p=>p.replace(/./g,d=>(d=d.charCodeAt()-(d>'Z'?61:d>'9'?55:48),d%10+'0'.repeat(d/10)));
const minizip=p=>{for(var r='',d=+p[0],i=1;i<=81;i++)i>=81||+p[i]||d>=50?(r+=d<10?d+'':String.fromCharCode(65+(d-10)%26+(d>35)*32),d=+p[i]):d+=10;return r};
const codoku = minizip;

const dataDir = '../../../sudokudata/';

const dataToPuzzles = data => {
	let puzzles = data.split(/[\n\r]+/);
	if(puzzles[puzzles.length - 1] === '') puzzles.length--;
	return puzzles;
};

const compact = (key = '', puz = '') => {
	let diff = new Array(81);
	for(var i = 0, len = puz.length; i < len; i++) diff[i] = puz[i] === key[i] ? '0' : puz[i];
	return codoku(diff.join(''));
};
const expand = (key = '', diff = '') => {
	diff = dedoku(diff);
	let puz = new Array(81);
	for(var i = 0, len = diff.length; i < len; i++) puz[i] = diff[i] === '0' ? key[i] : diff[i];
	return puz.join('');
};

let textEncoder = new TextEncoder();
let textDecoder = new TextDecoder();
const bitEncode = (key = '', puz = '') => {
	let pdigs = textEncoder.encode(puz);
	let out = new Uint8Array(81), o =0;
	let k, p, i, n;
	n = key[0] === puz[0] ? 0 : (pdigs[0] - 48);
	for(i = 1; i < 81; i++) {
		k = key[i];
		p = puz[i];
		if(k === p) {
			if(n > 245) {
				out[o++] = n;
				n = 0;
			}
			else n += 10;
		}
		else {
			out[o++] = n;
			n = pdigs[i] - 48;
		}
	}
	out[o++] = n;
	return out.slice(0, o);
};
const bitDecode = (key = '', data = []) => {
	let kdigs = textEncoder.encode(key);
	let out = new Uint8Array(81), o = 0;
	for(let i = 0, len = data.length; i < len; i++) {
		let d = data[i];
		out[o] = d % 10 === 0 ? kdigs[o] : d % 10 + 48;
		o++;
		while((d -= 10) >= 0) {
			out[o] = kdigs[o];
			o++;
		}
	}
	return textDecoder.decode(out);
};

const bulkEncoder = puzzles => {
	let textEncoder = new TextEncoder();
	let textDecoder = new TextDecoder();
};

		//let spaceEncodings = {}
		/*
		1000 8  1 0 
		1001 9  2 00
		1010 a  3 000
		1011 b  4 0000
		1100 c  8 00000000
		1101 d 16 0000000000000000
		1110 e 32 00000000000000000000000000000000
		1111 f 64 0000000000000000000000000000000000000000000000000000000000000000
		*/
const testCodec = (() => {
	const digToBit = {
		'1': '0000',
		'2': '0001',
		'3': '0010',
		'4': '0011',
		'5': '0100',
		'6': '0101',
		'7': '0110',
		'8': '0111',
	};
	const digToHex = {
		'1': '0',
		'2': '1',
		'3': '2',
		'4': '3',
		'5': '4',
		'6': '5',
		'7': '6',
		'8': '7',
		'9': '8',
	};
	const encodeSpaces = (enc, spaces) => {
		while(spaces >= 64) { enc.push('f'); spaces -= 64; }
		while(spaces >= 32) { enc.push('e'); spaces -= 32; }
		while(spaces >= 16) { enc.push('d'); spaces -= 16; }
		while(spaces >=  5) { enc.push('c'); spaces -=  4; }
		while(spaces >=  3) { enc.push('b'); spaces -=  3; }
		while(spaces >=  2) { enc.push('a'); spaces -=  2; }
		while(spaces >=  1) { enc.push('9'); spaces -=  1; }
	};
	const createEncoder = () => {
		let key;
		let digitCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		const encode = puz => {
			let firstDigit;
			//console.log(puz.split('').map((d, i) => d === (key || [])[i] ? ' ' : d).join(''));
			puz = puz.split('');
			let enc = [], spaces = 0;
			puz.forEach((d, i, a) => {
				if(key === undefined || d !== key[i]) {
					if(spaces > 0) {
						encodeSpaces(enc, spaces);
						//console.log('encodeSpaces:', spaces, puz.slice(i - spaces, i).join(''), puz.slice(i - spaces, i).join('').length, enc.join(''));
					}
					enc.push(digToHex[d]);
					//console.log(' encodeDigit:', i, d, digToHex[d], enc.join(''));
					spaces = 0;
				}
				else {
					spaces++;
				}
			});
			encodeSpaces(enc, spaces);
			//console.log('enc:', enc.join(''));
			//console.log(enc.length, enc.length >>> 1, (enc.length + 1) >>> 1);
			let outBuf = new Uint8Array((enc.length + 1) >>> 1);
			for(var i = 0; i < enc.length; i += 2) {
				//console.log(i, enc[i+0], enc[i+1]||0, parseInt(enc[i+0]+(enc[i+1]||0), 16), parseInt(enc[i+0]+(enc[i+1]||0), 16).toString(16));
				outBuf[i >>> 1] = parseInt(enc[i+0]+(enc[i+1]||0), 16);
			}
			//console.log('outBuf:', outBuf.length, outBuf);
			//enc = enc.join('');
			key = puz;
			return outBuf;
		};
		return encode;
	};
	const createDecoder = () => {
		let key;
		const decode = enc => {
			//console.log('decode:', enc);
			let j;
			let row = [];
			let dec = [];
			//if(key) console.log('key:', key.join(''));
			//console.log('enc:', enc);
			//enc = enc.split('');
			const processSymb = symb => {
				switch(symb) {
					case '0': dec.push('1'); break;
					case '1': dec.push('2'); break;
					case '2': dec.push('3'); break;
					case '3': dec.push('4'); break;
					case '4': dec.push('5'); break;
					case '5': dec.push('6'); break;
					case '6': dec.push('7'); break;
					case '7': dec.push('8'); break;
					case '8': dec.push('9'); break;
					case '9': for(var j = 0; j <  1; j++) dec.push(key[dec.length]); break;
					case 'a': for(var j = 0; j <  2; j++) dec.push(key[dec.length]); break;
					case 'b': for(var j = 0; j <  3; j++) dec.push(key[dec.length]); break;
					case 'c': for(var j = 0; j <  4; j++) dec.push(key[dec.length]); break;
					case 'd': for(var j = 0; j <  8; j++) dec.push(key[dec.length]); break;
					case 'e': for(var j = 0; j < 16; j++) dec.push(key[dec.length]); break;
					case 'f': for(var j = 0; j < 32; j++) dec.push(key[dec.length]); break;
				}
			};
			enc.forEach((d, i) => {
				//console.log(i, d, d.toString(16), ((d >>> 4) & 0b1111).toString(16), (d & 0b1111).toString(16));
				processSymb(((d >>> 4) & 0b1111).toString(16));
				processSymb(((d >>> 0) & 0b1111).toString(16));
				//console.log('  ', d, dec.join(''), dec.length);
			});
			dec.length = 81;
			key = dec;
			dec = dec.join('');
			return dec;
		};
		decode.getDigitCounts = () => digitCounts;
		return decode;
	};
	return {createEncoder, createDecoder};
})();

const BYTE_FF = new Uint8Array([0xff]);
const compactStream = async (input, output, codec) => await new Promise((resolve, reject) => {
	const lineReader = readline.createInterface({input, output});
	//let first, key;
	let count = 0;
	let encode = codec.createEncoder();
	let decode = codec.createDecoder();
	lineReader.on('line', function(puz) {
		//this.output.write(compact(key, puz) + '\n');
		//if(first === undefined) first = puz;
		count++;
		if(count >= 0 && count < 30) {
			//console.log(puz);
			//let enc = testEncoder()
			//let enc = encode(puz);
			//console.log('puz:', puz);
			//[...enc].forEach((d, i) => console.log(i, d, d.toString(16).padStart(2, '0')));
			//console.log('  e:', [...enc].map(d => d.toString(16).padStart(2, '0')).join(''));
			//let dec = decode(enc);
			//console.log('  d:', dec, dec === puz);
			//console.log('    ', dec.split('').map((d, i) => d === puz[i] ? ' ' : 'X').join(''));
			//console.log('dec === puz:', dec === puz);
			//console.log('vs fir:', puz.split('').map((d, i) => d === (first || [])[i] ? ' ' : d).join(''), 'k');
			//console.log('vs key:', puz.split('').map((d, i) => d === (key || [])[i] ? ' ' : d).join(''), 'f');
			//for(var i = 0; i < 81; i++)
		}
		//this.output.write(encode(puz));
		//this.output.write(BYTE_FF);
		let enc = encode(puz);
		this.output.write([...enc].map(d => d.toString(16).padStart(2, '0')).join(''));
		this.output.write('\n');
		//key = puz;
	});
	lineReader.on('close', () => {
		//console.log('digits:', decode.getDigitCounts());
		resolve();
	});
	lineReader.on('SIGTSTP', reject);
});

const expandStream = async (input, output, codec) => await new Promise((resolve, reject) => {
	const lineReader = readline.createInterface({input, output});
	let count = 0;
	let key;
	let encode = codec.createEncoder();
	let decode = codec.createDecoder();
	lineReader.on('line', function(diff) {
		//let puz = expand(key, diff)
		//let puz = bitDecode(key, diff)
		//console.log(diff.match(/[0-9a-f]/g).map(d => parseInt(d, 16)));
		let puz = decode(diff.match(/[0-9a-f]/g).map(d => parseInt(d, 16)))
		//if(count < 10)console.log(puz);
		this.output.write(puz.toString() + '\n');
		//this.output.write(encode(puz));
		//key = puz;
		count++;
	});
	lineReader.on('close', resolve);
	lineReader.on('SIGTSTP', reject);
});


(async () => {
	//let inFile = dataDir + 'ak_solutions_0-9999.txt';
	let inFile = dataDir + 'ak_solutions_0-999999999.txt';
	//let inFile = dataDir + 'ak_solutions.txt';
	let outFile = dataDir + 'test_out.txt';
	let outFile2 = dataDir + 'test_out2.txt';
	/*
	let testPuzzles = dataToPuzzles(`123456789456789123789123456231564897564897231897231564312645978645978312978312645
123456789456789123789123456231564897564897231897231564312645978648972315975318642
123456789456789123789123456231564897564897231897231564315648972648972315972315648
123456789456789123789123456231564897564897231897231564372615948615948372948372615
123456789456789123789123456231564897564897231897231564372615948618942375945378612`);
	console.log(testPuzzles);
	//bitEncode(undefined, testPuzzles[0]);
	//let key = testPuzzles[0];
	let key = undefined;
	let puz = testPuzzles[1];
	let bits = bitEncode(key, puz);
	console.log('bits:', bits);
	let decoded = bitDecode(key, bits);
	console.log('key:', key);
	console.log('puz:', puz);
	console.log('dec:', decoded);
	console.log('dec === puz:', decoded === puz);
	//bitEncode(testPuzzles[0].slice(60), testPuzzles[1].slice(60));
	*/
	console.time('time');
	await compactStream(fs.createReadStream(inFile), fs.createWriteStream(outFile), testCodec);
	//await expandStream(fs.createReadStream(outFile), fs.createWriteStream(outFile2), testCodec);
	console.timeEnd('time');

})();