
// RC
/*
*/

const noop = () => {};


const toRC = ([r, c]) => ([Math.floor(r), Math.floor(c)]);
const equals = (rc0 = [], rc1 = []) => rc0[0] === rc1[0] && rc0[1] === rc1[1];
const rcEquals = (rc0 = [], rc1 = []) => Math.floor(rc0[0]) === Math.floor(rc1[0]) && Math.floor(rc0[1]) === Math.floor(rc1[1]);
const rcCenter = ([r, c]) => ([Math.floor(r) + 0.5, Math.floor(c) + 0.5]);
const rcLine = ([r0, c0], [r1, c1]) => {
	let dc = Math.abs(c1 - c0), dr = Math.abs(r1 - r0);
	let sc = (c0 < c1) ? 1 : -1, sr = (r0 < r1) ? 1 : -1;
	let err = dc - dr;
	let rc = [r0, c0];
	let rcCount = Math.max(dr, dc) + 1;
	let rcList = new Array(rcCount);
	for(let i = 0; i < rcCount; i++) {
		rcList[i] = [rc[0], rc[1]];
		if((rc[0] === r1) && (rc[1] === c1)) break;
		let e2 = 2 * err;
		if(e2 < dc) { err += dc; rc[0] += sr; }
		if(e2 > -dr) { err -= dr; rc[1] += sc; }
	}
	return rcList;
};
const rcStep = ([r0, c0], [r1, c1], handler = noop) => {
	let dc = Math.abs(c1 - c0), dr = Math.abs(r1 - r0);
	let sc = (c0 < c1) ? 1 : -1, sr = (r0 < r1) ? 1 : -1;
	let err = dc - dr;
	let rcCount = Math.max(dr, dc) + 1;
	let rc = [r0, c0];
	while(rcCount-- > 0) {
		handler(rc);
		if((rc[0] === r1) && (rc[1] === c1)) break;
		let e2 = 2 * err;
		if(e2 < dc) { err += dc; rc[0] += sr; }
		if(e2 > -dr) { err -= dr; rc[1] += sc; }
	}
};
const reRC = /^[Rr](.*)[Cc](.*)$/;
const parseRC = rcStr => {
	let [_, r, c] = (rcStr.match(reRC) || []);
	return [parseFloat(r), parseFloat(c)];
};
const stringifyRC = rc => `R${rc[0]}C${rc[1]}`;

export const RC = {
	toRC,
	equals,
	rcEquals,
	rcLine,
	rcStep,
	parse: parseRC,
	stringify: stringifyRC,
};