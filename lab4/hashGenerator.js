const generateRandomKey =require( "../lab5-6/backend/utils/generateRandomKey");

const argon2 = require('argon2');
const fs = require('fs');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');;


const readCommon = (filename) => {
	const pass = fs.readFileSync(filename, "utf8");
	let a = pass.split('\n');
	a.pop();
	return a;
};

const writeToFile = (values, filename) => {
	let file = fs.createWriteStream(filename);
	file.on('error', function(err) {});
	values.forEach(function(v) { file.write(v + '\n'); });
	file.end();
};

const hashPasswordArgon = async (password) => {
	return await argon2.hash(password);
};

const hashPasswordSHA = async (password, salt) => {
	let hash = crypto.createHmac('sha256', salt);
	hash.update(password);
	let value = hash.digest('hex');
	return {
		salt:salt,
		passwordHash:value
	};
};

const hashPasswordsSHA = async () => {
	// console.log(hashPasswordSHA('hello', generateRandomKey.generateRandomKey(12)))
	const passwords = readCommon('passwords2.csv');
	let hashes = [];
	for (const item of passwords) {
		let hash = await hashPasswordSHA(item, generateRandomKey.generateRandomKey(64));
		hashes.push(`${hash.passwordHash}, ${hash.salt}`);
		console.log(item)
	}
	writeToFile(hashes, './medium.csv');
};

const hashPasswordsMD5 = async () => {
	const passwords = readCommon('passwords.csv');
	let hashes = [];
	for (const item of passwords) {
		let hash = await hashPasswordMD5(item);
		hashes.push(hash);
	}
	writeToFile(hashes, './easy.csv');
};

const hashPasswordsArgon = async () => {
	const passwords = readCommon('passwords.csv');
	let hashes = [];
	for (const item of passwords) {
		let hash = await hashPasswordArgon(item);
		hashes.push(hash);
	}
	writeToFile(hashes, './hard.csv');
};

const hashPasswordMD5 = (password) => {
	return CryptoJS.MD5(password).toString()
	// return md5(password);
};
const f = async () => {
	let res = await hashPasswordArgon('hello')
	console.log(res);
	return await hashPasswordArgon('hello');
}

hashPasswordsMD5();


