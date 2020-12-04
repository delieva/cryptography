const axios = require('axios').default;
const fs = require('fs');
const cryptoJs = require('crypto-js');
const path = require('path');

const getKEKSecretKey = async () => {
  // This methods should take secret key from aws;
  const filePath = path.join(__dirname, '..', 'keys-mock-demo-only/kek.txt');
  return fs.readFileSync(filePath, 'utf-8');
};

const getDEKSecretKey = async () => {
  // This methods should take secret key from A physical Hardware Security Module
  const filePath = path.join(__dirname, '..', 'keys-mock-demo-only/dek-encrypted.txt');
  return fs.readFileSync(filePath, 'utf-8');
}

const getSecretKey = async () => {
  const kek = getKEKSecretKey();
  const dek = getDEKSecretKey();

  return decrypt(dek, kek)
};

const encrypt = (data, key) => {
  const encryptedData = cryptoJs.AES.encrypt(data, key).toString()
  return encryptedData
}

const decrypt = (encryptedData, key) => {
  const decryptedData = cryptoJs.AES.decrypt(encryptedData, key)
  return decryptedData.toString(cryptoJs.enc.Utf8);
}

const dek = getSecretKey();

const encryptData = async (data) => {
  const key = await dek;
  return encrypt(data, key).toString()
}

const decryptData = async (data) => {
  const key = await dek;
  return decrypt(data, key)
}

module.exports = {
  encrypt,
  decrypt,
  encryptData,
  decryptData
}