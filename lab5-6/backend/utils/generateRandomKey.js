const cryptoRandomString = require('crypto-random-string');

const generateRandomKey = (length, type = 'hex') => {
  return cryptoRandomString({length, type});
};

module.exports = {
  generateRandomKey
}