const { betAndPlay, createAccount } = require('./requests')
const bigInt = require("big-integer");
const { Lcg } = require('./RNGModes');
const M = Math.pow(2, 32);

// Using "random" id from timestamp to break casino with "random" numbers from timestamp | ha-ha
const playerId = Math.floor(Date.now() / 1000);

const modulus = (a, b) => ((a % b) + b) % b;

const getIsOutOfRange = (value) => Math.abs(value) > 2 ** 31;

const copyLcg = (a, c, prevN) => {
	const result = modulus((a * prevN + c), M);
	const isOutOfRange = getIsOutOfRange(result);
	if (!isOutOfRange) return result;
	return result > 0 && Math.abs(result) > 2 ** 31? result - M : result + M;
};
const extendedGcd = (a, b) => {
	let [oldR, r] = [a, b];
	let [oldS, s] = [1, 0];
	let [oldT, t] = [0, 1];
	
	while (r !== 0) {
		const quotient = Math.floor(oldR / r);
		[oldR, r] = [r, oldR - quotient * r];
		[oldS, s] = [s, oldS - quotient * s];
		[oldT, t] = [t, oldT - quotient * t];
	}
	
	return [oldR, oldS];
}

const moduleInverse = (b, n) => {
	const [gcd, s] = extendedGcd(b, n);
	return gcd === 1 ? modulus(s, n) : null;
};

const getA = (arr) => {
	const mod = moduleInverse(arr[1] - arr[0], M);
	if (!mod) return null;
	return Number(modulus( BigInt((arr[2] - arr[1])) * BigInt(mod), BigInt(M)));
};

const getС = (arr, a) => modulus(arr[1] - arr[0] * a, M);

const hackLCG = async () => {
	try {
		
		await createAccount(playerId);
		console.log(`Player: ${playerId} created`)
		
		const numbers = [];
		for(let i = 0; i < 2; i++) {
			const response = await betAndPlay(Lcg, playerId, 1, 2112);
			numbers.push(response.realNumber);
		}
		let a = null;
		let bet = null;
		let money = 1;
		
		while(!a) {
			const response = await betAndPlay(Lcg, playerId, 1, 2112);
			numbers.push(response.realNumber);
			money = response.account.money;
			a = Number(getA(numbers).toString());
		}
		const c = getС(numbers, a);
		while (money < 1e6) {
			let number = copyLcg(a, c, numbers[numbers.length-1]);
			console.log(number);
			bet = await betAndPlay(Lcg, playerId, Math.round(money / 2), number);
			console.log(bet.realNumber)
			numbers.push(bet.realNumber)
			money = bet.account.money;
		}
		console.log(`Congratulations! You won! Yor prize ${money}`)
	} catch (e) {
		console.log(e.message)
	}
};

hackLCG();
