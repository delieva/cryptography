const hexToString = require('./utils/hexToString');
const {xorChar} = require('./utils/xorChar');
const arrToMap = require('./utils/arrayToMap');
const {getCipherKey} = require('./cesar');

const string = '1c41023f564b2a130824570e6b47046b521f3f5208201318245e0e6b40022643072e13183e51183f5a1f3e4702245d4b285a1b23561965133f2413192e571e28564b3f5b0e6b50042643072e4b023f4a4b24554b3f5b0238130425564b3c564b3c5a0727131e38564b245d0732131e3b430e39500a38564b27561f3f5619381f4b385c4b3f5b0e6b580e32401b2a500e6b5a186b5c05274a4b79054a6b67046b540e3f131f235a186b5c052e13192254033f130a3e470426521f22500a275f126b4a043e131c225f076b431924510a295f126b5d0e2e574b3f5c4b3e400e6b400426564b385c193f13042d130c2e5d0e3f5a086b52072c5c192247032613433c5b02285b4b3c5c1920560f6b47032e13092e401f6b5f0a38474b32560a391a476b40022646072a470e2f130a255d0e2a5f0225544b24414b2c410a2f5a0e25474b2f56182856053f1d4b185619225c1e385f1267131c395a1f2e13023f13192254033f13052444476b4a043e131c225f076b5d0e2e574b22474b3f5c4b2f56082243032e414b3f5b0e6b5d0e33474b245d0e6b52186b440e275f456b710e2a414b225d4b265a052f1f4b3f5b0e395689cbaa186b5d046b401b2a500e381d4b23471f3b4051641c0f2450186554042454072e1d08245e442f5c083e5e0e2547442f1c5a0a64123c503e027e040c413428592406521a21420e184a2a32492072000228622e7f64467d512f0e7f0d1a';

function shiftText(input, shift) {
  const inputLength = input.length;

  return input.substring(inputLength - shift, inputLength) + input.substring(0, inputLength - shift);
}

function getCoincidenceFreq(input, shift) {
  const shiftedText = shiftText(input, shift);
  let coincidenceCount = 0;
  shiftedText.split('').forEach((char, index) => {
    if (input[index] === char) {
      coincidenceCount++
    }
  })
  return coincidenceCount / input.length
}

const getKeyLength = (input) => {
  let sum = 0;
  const coincidences = arrToMap(input.length - 1)
    .map((item, shift) => {
      const freq = getCoincidenceFreq(input, shift + 1)
      sum += freq;
      return freq
    })

  return coincidences.findIndex((index) => index > sum / coincidences.length) + 1
}

function getSubstringByKeyIndex({input, keyLength, keyCharIndex}) {
  const getSubstring = (charIndex, counter, resultString) => {
    if (charIndex >= input.length - 1) {
      return resultString
    }

    return getSubstring(
      charIndex + keyLength,
      counter + 1,
      resultString + input[charIndex]
    )
  }

  return getSubstring(keyCharIndex, 1, '')
}

function getVigenereRepeatingKey(input) {
  const keyLength = getKeyLength(input);

  // Take every char index of key, find appropriate coincidences by indexes in input and decrypt it with cesar decrypt algorithm

  return arrToMap(keyLength).map((_, index) => (
    String.fromCharCode(
      getCipherKey(
        getSubstringByKeyIndex({input, keyLength, keyCharIndex: index})
      )
    )
)).join('')
}

function decrypt(input) {
  const key = getVigenereRepeatingKey(hexToString(string));
  return input
    .split('')
    .map((char, i) => {
      return xorChar(char, key[i % key.length].charCodeAt(0))
    })
    .join('')
}

console.log(decrypt(hexToString(string)))