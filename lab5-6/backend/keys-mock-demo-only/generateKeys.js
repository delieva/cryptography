const { generateRandomKey } = require('../utils/generateRandomKey')
const { encrypt } = require('../utils/encryption');
const fs = require('fs');

const generateKeys = async () => {
  const kek = generateRandomKey(32);
  const dek = generateRandomKey(32);

  const encryptDek = encrypt(dek, kek);

  fs.writeFileSync('./dek-encrypted.txt', encryptDek);
  fs.writeFileSync('./kek.txt', kek);
}

generateKeys();