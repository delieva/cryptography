const arrToMap = require('../../utils/arrayToMap');
const MersenneTwister = require('mersenne-twister');

class MtRecover {
  unshiftRight = (x, shift) => {
    return arrToMap(32).reduce((res) => {
      return x ^ res >>> shift
    }, x)
  }

  unShiftLeft = (x, shift, mask) => {
    return arrToMap(32).reduce((res) => {
      return x ^ (res << shift & mask)
    }, x)
  }

  untemper = (v) => {
    // Reverses the tempering which is applied to outputs of MT19937

    v = this.unshiftRight(v, 18);
    v = this.unShiftLeft(v, 15, 0xefc60000);
    v = this.unShiftLeft(v, 7, 0x9d2c5680);
    v = this.unshiftRight(v, 11);

    return v
  }

  reverse = (values) => {
    if (values.length !== 624) {
      throw Error(`624 values needed at least`)
    }

    const recoveredState = values.map((randomValue) => {
      return this.untemper(randomValue);
    })

    const randGenerator = new MersenneTwister();

    randGenerator.mt = recoveredState;
    randGenerator.mti = 624;

    return randGenerator
  }
}

module.exports = MtRecover;