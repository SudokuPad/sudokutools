
const HuffmanCode = (() => {
	let codeTable = ['00','11','010','1001','011','1010','1000','1011'];
	function Node(props) {
		Object.assign(this, {val: null, freq: 0, hi: null, lo: null}, props);
	}
	const sortByFreq = (a, b) => a.freq - b.freq;
	const toSym = (str, size) => str.match(new RegExp(`.{${size}}`, 'g'));
	const buildFreqTable = syms => syms.reduce((res, sym) => (res[parseInt(sym, 2)]++, res), Array(2**syms[0].length).fill(0));
	const buildTree = freq => {
		let queue = freq.map((freq, val) => new Node({val, freq}));
		/*
		Greedily build the tree bottom-up
		by continuously connecting the two trees with the minimum frequencies
		until there is only a single tree in the forest
		*/
		while(queue.length > 1) {
			queue.sort(sortByFreq);
			let lo = queue.shift(), hi = queue.shift();
			queue.push(new Node({freq: lo.freq + hi.freq, hi, lo}));
		}
		queue.sort(sortByFreq);
		let root = queue[0];
		if(!(root.hi || root.lo)) return new Node({...root, hi: root});
		return root;
	};
	const treeToCodeTable = root => {
		let res = [];
		const dfs = (node, code) => {
			if(!(node.hi || node.lo)) {
				res[node.val] = code;
				return;
			};
			if(node.hi !== null) dfs(node.hi, code + '0');
			if(node.lo !== null) dfs(node.lo, code + '1');
		}
		dfs(root, '');
		return res;
	};
	const buildCodeTable = (dat, size) => treeToCodeTable(buildTree(buildFreqTable(toSym(dat, size))));
	const setCodeTable = t => codeTable = t;
	const getCodeTable = () => codeTable;
	const encode1 = (dat, t = codeTable) => toSym(dat, Math.log2(t.length)).map(d => t[parseInt(d,2)]).join('');
	const encode = (dat, t = codeTable) => {
		console.log('  dat:', dat);
		console.log('  t:', t);
		console.log('  Math.log2(t.length):', Math.log2(t.length));
		console.log('  toSym:', toSym(dat, Math.log2(t.length)));
		return toSym(dat, Math.log2(t.length)).map(d => t[parseInt(d,2)]).join('');
	};

	const decode = (dat, t = codeTable) => {
		let res = '';
		while(dat.length > 0) for(let i=0;i<8;i++) if(t[i] === dat.slice(0, t[i].length)) {
			res += i.toString(2).padStart(3,0);
			dat = dat.slice(t[i].length);
			break;
		}
		return res;
	};
	return {
		Node, sortByFreq,
		toSym,
		buildFreqTable,
		buildTree, treeToCodeTable,
		buildCodeTable, setCodeTable, getCodeTable,
		encode, decode,
	};
})();

if(typeof module != 'undefined') module.exports = HuffmanCode;