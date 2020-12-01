import {ALPHABET} from "./constants";

const text = 'EFFPQLEKVTVPCPYFLMVHQLUEWCNVWFYGHYTCETHQEKLPVMSAKSPVPAPVYWMVHQLUSPQLYWLASLFVWPQLMVHQLUPLRPSQLULQESPBLWPCSVRVWFLHLWFLWPUEWFYOTCMQYSLWOYWYETHQEKLPVMSAKSPVPAPVYWHEPPLUWSGYULEMQTLPPLUGUYOLWDTVSQETHQEKLPVPVSMTLEUPQEPCYAMEWWYTYWDLUULTCYWPQLSEOLSVOHTLUYAPVWLYGDALSSVWDPQLNLCKCLRQEASPVILSLEUMQBQVMQCYAHUYKEKTCASLFPYFLMVHQLUPQLHULIVYASHEUEDUEHQBVTTPQLVWFLRYGMYVWMVFLWMLSPVTTBYUNESESADDLSPVYWCYAMEWPUCPYFVIVFLPQLOLSSEDLVWHEUPSKCPQLWAOKLUYGMQEUEMPLUSVWENLCEWFEHHTCGULXALWMCEWETCSVSPYLEMQYGPQLOMEWCYAGVWFEBECPYASLQVDQLUYUFLUGULXALWMCSPEPVSPVMSBVPQPQVSPCHLYGMVHQLUPQLWLRPOEDVMETBYUFBVTTPENLPYPQLWLRPTEKLWZYCKVPTCSTESQPQULLGYAUMEHVPETFWMEHVPETBZMEHVPETB'.toLowerCase()

const TOP_SYMBOLS = 7,
			N_GRAMS = [1, 2, 3, 4, 5, 6],
			PATIENCE=50,
			CROSS_FRACTION=0.75,
			ITERS=500;

function letterCount(array) {
	let count = {};
	array.forEach(val => count[val] = (count[val] || 0) + 1);
	return count;
}

const permutations = arr => {
	if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
	return arr.reduce(
		(acc, item, i) =>
			acc.concat(
				permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
					item,
					...val,
				])
			),
		[]
	);
};


const createDicts = () => {
	let letters = ALPHABET.split(''),
			keys = [...letters],
			dict = {};
	for (let letter of letters) {
		const index = Math.floor(Math.random() * keys.length)
		let key = keys[index];
		dict[letter] = key;
		keys.splice(index, 1);
	}
	return dict;
};
function swapValues(obj, sourceKey, targetKey) {
	let temp = obj[sourceKey];
	obj[sourceKey] = obj[targetKey];
	obj[targetKey] = temp;
}
// def update_mapping(mapping, key, new_value):
// value_key = [k for k, v in mapping.items() if v == new_value][0]
// mapping[key], mapping[value_key] = mapping[value_key], mapping[key]

// return mapping shaffle

const shuffleDict = (dict, key, newValue) => {
	let oldKey, newKey;
	for(let i in dict) {
		if(dict[i] === newValue) {
			oldKey = i
		} else if(dict[i] === newValue) {
			newKey = i
		}
	}
	swapValues(dict, oldKey, newKey)
};

const initPopolation = () => {
	const topLetters = 'etaoinsrhdluc';
	let top = topLetters.split('').slice(0, TOP_SYMBOLS);
	let topPermutations = permutations(top).map((item) => {
		return item.join('')
	});
	let encodedSymbols = letterCount(text.split(''));
	let encodedSymbolsSorted = [];
	for (let i in encodedSymbols) {
		encodedSymbolsSorted.push([i, encodedSymbols[i]]);
	}
	
	encodedSymbolsSorted.sort(function(a, b) {
		return  b[1]- a[1];
	});
	let topEncodedSymbols = encodedSymbolsSorted.slice(0, TOP_SYMBOLS);
	let population = [];
	for(let i = 0; i < topPermutations.length; i++) {
		population.push(createDicts())
	}
};

const softMax = (arr) => {
	const max = Math.max.apply(null, arr);
	let expArr = arr.map((item) => {
		return Math.exp(item - max);
	});
	const sum = expArr.reduce((a, b) => a + b, 0)
	return expArr.map((item) => {
		return item / sum;
	})
};

const genetic = () => {
	let population = getPopulation(),
	bestScore = -1,
	bestDict,
	patience = PATIENCE;
	for(let i = 0; i < ITERS; i++) {
		let scores = getScores(),
				indexes = sortScores();
		if(scores[indexes[0]] <= bestScore) {
			if(patience === 0) {
				break;
			} else {
				if(scores[indexes[0]] === bestScore) {
					bestDict = population[indexes[0]] //TODO set the index of population for the scores index
				}
				patience -= 1;
			}
		} else {
			patience = PATIENCE;
			bestScore = scores[indexes[0]];
			bestDict = population[indexes[0]] //TODO set the index of population for the scores index
			// indexes = indexes[int(len(scores) * crossover_popilation_fraction):]//AAAAAAAAA
		}
		// population = crossover([population[i] for i in indexes], [scores[i] for i in indexes], len(population))
		population = mutate(population);
	}
	// console.log(" ".join(wordninja.split(substitution_cipher_decoder(bestDict))))
};
