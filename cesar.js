const { ALPHABET, FREQUENCY_TABLE } = require('./constants');

const KEY_LENGTH = 256;

const string = 'Yx`7cen7v7ergrvc~yp:|rn7OXE7t~g.re97R9p97~c7d.xb{s7cv|r7v7dce~yp75.r{{x7`xe{s57vys;7p~ary7c.r7|rn7~d75|rn5;7oxe7c.r7q~edc7{rccre75.57`~c.75|5;7c.ry7oxe75r57`~c.75r5;7c.ry75{57`~c.75n5;7vys7c.ry7oxe7yroc7t.ve75{57`~c.75|57vpv~y;7c.ry75x57`~c.75r57vys7dx7xy97Nxb7zvn7bdr7vy7~ysro7xq7tx~yt~srytr;7_vzz~yp7s~dcvytr;7\\vd~d|~7rovz~yvc~xy;7dcvc~dc~tv{7crdcd7xe7`.vcrare7zrc.xs7nxb7qrr{7`xb{s7d.x`7c.r7urdc7erdb{c9'
const countFreq = (string) => {
	const charFreq = {}

	string.split('').forEach((char) => {
		if (!charFreq[char]) {
			charFreq[char] = 0;
		}

		charFreq[char] += 1;
	})

	return charFreq
}

function encryptXor(text, key) {
	let result = '';
	for (let i = 0; i < text.length; i++) {
		result += String.fromCharCode(text[i].charCodeAt(0) ^ key)
	}
	return result;
}

const getCipherKey = () => {
	const smallest = { freqDiff: 1, key: '' }
	for (let key = 1; key < KEY_LENGTH; key++) {
		const decoded = encryptXor(string, key);
		const freqCount = countFreq(decoded);
		const freqDiff = ALPHABET.reduce((sum, char) => {
			const freq = freqCount[char] / decoded.length || 0
			return sum + Math.abs(freq - FREQUENCY_TABLE[char])
		}, 0)

		if (freqDiff < smallest.freqDiff) {
			smallest.freqDiff = freqDiff;
			smallest.key = key;
		}
	}

	return smallest.key
}

const key = getCipherKey(string);
console.log(encryptXor(string, key));

// console.log(encryptXor(string, 23).length);
