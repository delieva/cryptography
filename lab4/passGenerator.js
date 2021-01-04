const fs = require('fs');

const symbols = '0123456789012345678901234567890123456789!@#$%^&*().,/?|-_=+<>'.split('');

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const readCommon = (filename) => {
	const pass = fs.readFileSync(filename, "utf8");
	let a = pass.split('\n');
	a.pop();
	return a;
};

const generatePseudoRandPass = (raw) => {
	let words =  raw.map((item) => {
		return item.split(' ')[0];
	});
	let lenBefore = getRandomInt(0, 3);
	let lenAfter = getRandomInt(1, 4);
	let password = '';
	for(let i = 0; i < lenBefore; i++) {
		password += symbols[getRandomInt(0, symbols.length-1)]
	}
	password += words[getRandomInt(0, words.length-1)];
	for(let i = 0; i < lenAfter; i++) {
		password += symbols[getRandomInt(0, symbols.length-1)]
	}
	return password;
};



const generatePasswords = (mostCommon, common) => {
	const commonPass = readCommon('commonPasswords/common.csv');
	const mostCommonPass = readCommon('commonPasswords/mostCommon.csv');
	const raw = fs.readFileSync('../lab1/1.3/enwiki-20150602-words-frequency.txt', "utf8").split('\n');
	let passwords = [];
	for(let i = 0; i < 100000; i++) {
		let type = getRandomInt(0, 100);
		if (type <= mostCommon) {
			passwords.push(mostCommonPass[getRandomInt(0, mostCommonPass.length - 1)]);
		} else if (type > mostCommon && type <= mostCommon+common) {
			passwords.push(commonPass[getRandomInt(0, commonPass.length-1)]);
		} else {
			passwords.push(generatePseudoRandPass(raw));
		}
		console.log(i)
	}
	let file = fs.createWriteStream('./passwords2.csv');
	file.on('error', function(err) {});
	passwords.forEach(function(v) { file.write(v + '\n'); });
	file.end();
	return passwords
	// fs.writeFileSync('')passwords;
};
console.log(generatePasswords(5, 90));


