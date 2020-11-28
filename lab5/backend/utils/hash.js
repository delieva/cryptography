const argon2 = require('argon2');
const { SHA3 } = require('sha3');

const hashWithSha3 = (password) => {
  const sha3 = new SHA3(512);
  sha3.update(password);
  return sha3.digest('hex');
}

const hashPassword = async (password) => {
  return await argon2.hash(
    hashWithSha3(password)
  );
}

const comparePassword = async (hash, password) => {
  try {
    return await argon2.verify(hash, hashWithSha3(password))
  } catch (e) {
    return false
  }
}

module.exports = {
  hashPassword,
  comparePassword
}