
// Helpers
	const F = [1,1,2,6,24,120,720,5040,40320,362880];
	const factorial = n => (n <= 9) ? F[n] : n * factorial(n - 1);
	const numsToBits = nums => [...(nums||[])].map(d=>d==0?0:1);
	
// Lehmer code and bit packing
	const packBits = (bits, scales) => bits.reduce((acc, cur, i) => (acc + BigInt(cur)) * (BigInt(scales[i + 1] || 1n)), 0n);
	const unpackBits = (dat, scales) => {
		let len = scales.length, res = [];
		dat = BigInt(dat);
		for(let i = len - 1; i >= 0; i--) {
			res[i] = Number(dat % BigInt(scales[i]));
			dat = dat / BigInt(scales[i]);
		}
		return res;
	};
	const createLehmerCode = arr => {
		const lc = [], len = arr.length, symbs = [...arr.values()].sort();
		for(let i = 0; i < len; i++) {
			let idx = symbs.indexOf(arr[i]);
			lc.push(idx);
			symbs.splice(idx, 1);
		}
		return lc;
	};
	const parseLehmerCode = lc => {
		const res = [], len = lc.length, symbs = [...lc.keys()];
		for(let i = 0; i < len; i++) {
			let idx = lc[i];
			res.push(symbs[idx]);
			symbs.splice(idx, 1);
		}
		return res;
	};

// Sudoku Row/box/Col
	const
		N9 = [...Array(9).keys()],
		B = N9.map(b=>N9.map(n=>(~~(b/3)*27+b*3%9)+~~(n/3)*9+n%3)),
		R = N9.map(r=>N9.map(c=>r*9+c)),
		C = N9.map(c=>N9.map(r=>r*9+c)),
		row = n=>~~(n/9), col = n=>n%9, box = n=>~~(n/27)*3+(~~(n/3)%3),
		getBox = (n, p81) => N9.map(i=>p81[B[n][i]]),
		getRow = (n, p81) => N9.map(i=>p81[R[n][i]]),
		getCol = (n, p81) => N9.map(i=>p81[C[n][i]]);

// Box fill
	const fillBoxFromBox = (b, p81) => { // Complete box when enough digits are given within the box
		let sees = getBox(b, p81).join('');
		B[b].forEach((bi, i) => {
			if(sees[i] !== '_') return;
			for(let d = 1; d < 10; d++) {
				if(sees.indexOf(d) === -1) {
					p81[bi] = String(d);
					break;
				}
			}
		});
	};
	const fillBoxFromRC = (b, p81) => { // Complete box when enough digits are givein in rows/cols
		B[b].forEach((bi, i) => {
			let sees = [...getRow(row(bi), p81), ...getCol(col(bi), p81)].join('');
			//console.log(bi, sees);
			for(let n = 1; n < 10; n++) {
				//if(b === 2) console.log(b, i, bi, n, String(n), sees);
				if(sees.indexOf(n) === -1) {
					p81[bi] = String(n);
					break;
				}
			}
		});
	};

// Box codec
	const encBoxFull = (b, p81) => createLehmerCode(getBox(b, p81));
	const decBoxFull = (b, lc, p81) => parseLehmerCode(lc).forEach((n, i) => p81[B[b][i]] = String(n+1));
	const BoxMap = [[1,0,4],[5,4,8],[6,8,0]];
	const BoxSeen = [[[4,5,7,8],[3,5,6,8],[3,4,6,7]],[[1,2,7,8],[0,2,6,8],[0,1,6,7]],[[1,2,4,5],[0,2,3,5],[0,1,3,4]]];
	const encBox = (b, p81) => {
		const B0 = B[0], [bt, br, bc] = BoxMap[b], pt = getBox(bt, p81), pr = getBox(br, p81), pc = getBox(bc, p81);
		let res = pr.slice(0, 8).map((digit, ri) => {
			let lut = BoxSeen[row(B0[ri])][col(B0[pc.indexOf(digit)])], opts = lut.map(i => pt[i]);
			pt[lut[opts.indexOf(digit)]] = '_';
			return opts.filter(d => d !== '_').indexOf(digit);
		});
		return res;
	};
	const decBox = (b, codes, p81) => {
		const B0 = B[0], [bt, br, bc] = BoxMap[b], pt = getBox(bt, p81), pr = getBox(br, p81), pc = getBox(bc, p81);
		codes.map((idx, ri) => {
			let digit = pr[ri], lut = BoxSeen[row(B0[ri])][col(B0[pc.indexOf(digit)])];
			p81[lut.map(i => B[bt][i]).filter(d => p81[d] === '_')[idx]] = digit;
		});
		fillBoxFromBox(bt, p81); // Fill last digit
	};

// SCF codec
	const codoku = p=>p.replace(/.0{0,5}/g,d=>String.fromCharCode((d=+d[0]+10*d.length)+(d<20?38:d<46?45:51)));
	const dedoku = p=>p.replace(/./g,d=>(d=d.charCodeAt()-(d>'Z'?61:d>'9'?55:48),d%10+'0'.repeat(d/10)));	

// Sudoku packing
	const CodecRadixS81 = [9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1,9,8,7,6,5,4,3,2,1,4,4,4,4,4,4,3,2,4,4,4,4,4,4,3,2,4,4,4,4,4,4,3,2];
	const CodecRadixP81 = Array(81).fill(2);
	const CodecRadixCages = Array(144).fill(2);
	const encodeS81 = p81 => [
		...[0,4,8].map(b => encBoxFull(b, p81)),
		...[0,1,2].map(b => encBox(b, p81))
	].flat();
	const decodeS81 = encoded => {
		let p81 = [...Array(81)].map(_=>'_');
		[0,4,8].map((b, i) => decBoxFull(b, encoded.splice(0, 9), p81));
		[0,1,2].map((b, i) => decBox(b, encoded.splice(0, 8), p81));
		[2,3,7].map((b, i) => fillBoxFromRC(b, p81));
		return p81;
	};
	const packSudokuRaw = (s81, p81) => packBits(
		[...encodeS81(s81),...numsToBits(p81)],
		[...CodecRadixS81, ...(p81?CodecRadixP81:[])]
	);
	const unpackSudokuRaw = dat => {
		const radix = [...CodecRadixS81, ...(dat>2n**100n?CodecRadixP81:[])];
		let unpacked = unpackBits(dat, radix);
		let s81 = decodeS81(unpacked.slice(0, 51)).join(''),
				p81 = unpacked.slice(51,132).map((n,i)=>n?s81[i]:n).join(''),
				res = [s81];
		if(p81) res.push(p81);
		return res;
	};

// Cage codec
	const encodeCages = cages => {
		const h = Array(81).fill(0), v = [...h];
		for(let cells of cages) {
			cells = cells.map(([r,c]) => r * 9 + c);
			for(const idx of cells) {
				h[idx] = cells.includes(idx + 1) ? 0 : 1;
				v[idx] = cells.includes(idx + 9) ? 0 : 1;
			}
		}
		return h.join('').replace(/(.{8})./g, '$1') + v.slice(0, 72).join('');
	};
	const decodeCages = dat => {
		let h = dat.slice(0, 72).replace(/(.{8})/g, '$11'),
				v = dat.slice(72, 144) + '111111111';
		let cells = Array(81).fill(0), next = 0, c = next;
		for(let i = 0; i < 81; i++) {
			if(v[i - 9] == 0) {
				let c0 = c; c = cells[i - 9];
				for(let j = i; j >= 0; j--) if(cells[j] === c0) cells[j] = c;
			}
			cells[i] = c;
			if(h[i] == 1) c = ++next;
		}
		let cages = {};
		for(let i = 0; i < 81; i++) {
			cages[cells[i]] = cages[cells[i]] || [];
			cages[cells[i]].push([(i / 9) | 0, i % 9]);
		}
		return Object.values(cages);
	};

// B64 encoding
	const b64Codec = {
		charmap: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_~',
		encode: (n, size) => n.toString(8).padStart(size * 2, 0).match(/../g).map(n => b64Codec.charmap[parseInt(n, 8)]).join(''),
		decode: dat => BigInt('0b' + [...dat].map(c => b64Codec.charmap.indexOf(c).toString(2).padStart(6, 0)).join('')),
	};
	const encode64 = b64Codec.encode;
	const decode64 = b64Codec.decode;
	const encb64Bits = b => encode64(packBits(numsToBits(b), Array(b.length).fill(2)), ((b.length + 5) / 6) | 0);
	const decb64Bits = (dat, size = dat.length * 6) => unpackBits(decode64(dat), Array(size).fill(2)).join('');

	const encb64S81 = s81 => encode64(packBits(encodeS81(s81), CodecRadixS81), 17);
	const decb64S81 = dat => decodeS81(unpackBits(decode64(dat), CodecRadixS81)).join('');

	const encb64P81 = p81 => encb64Bits(numsToBits(p81));
	const decb64P81 = (dat, s81) => [...decb64Bits(dat, 81)].map((b, i) => b==1?s81[i]:0).join('');

	const encb64Cages = cages => encb64Bits(numsToBits(encodeCages(cages)));
	const decb64Cages = dat => decodeCages(decb64Bits(dat, 144));
	
	const packSudoku = (s81, p81) => encode64(packSudokuRaw(s81, p81), p81 ? 31 : 17);
	const unpackSudoku = dat => unpackSudokuRaw(decode64(dat));

const BitPacking = {
	F, factorial, numsToBits,
	packBits, unpackBits,
	createLehmerCode, parseLehmerCode,
	codoku, dedoku,
	CodecRadixS81, CodecRadixP81, CodecRadixCages,
	encodeS81, decodeS81,
	encodeCages, decodeCages,
	packSudokuRaw, unpackSudokuRaw,
	b64Codec, encode64, decode64,
	encb64Bits, decb64Bits,
	encb64S81, decb64S81,
	encb64P81, decb64P81,
	encb64Cages, decb64Cages,
	packSudoku, unpackSudoku,
};

if(typeof module != 'undefined') module.exports = BitPacking;