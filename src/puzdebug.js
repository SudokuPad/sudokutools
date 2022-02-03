const ROWS = 9, COLS = 9, R1 = ROWS - 1, C1 = COLS - 1;

const rePuzToRows = new RegExp(`(.{${COLS}})`, 'g');
const puzToStr = puz => Array.isArray(puz) ? puz.join('') : puz.toString();
const puzToLines = puz => (puzToStr(puz).match(rePuzToRows) || []).join('\n');

Object.assign(module.exports, {
	puzToStr,
	puzToLines,
});