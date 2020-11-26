const axios = require('axios');

const casinoInstance = axios.create({
  baseURL: 'http://95.217.177.249/casino',
})

const createAccount = async (playerId) => {
  const { data } = await casinoInstance.get(`/createacc?id=${playerId}`)
  return data
}

const betAndPlay = async (mode, playerId, amountOfMoney, theBetNumber) => {
  const { data } = await casinoInstance.get(`/play${mode}?id=${playerId}&bet=${amountOfMoney}&number=${theBetNumber}`)
  return data
}

module.exports = {
  createAccount,
  betAndPlay
}