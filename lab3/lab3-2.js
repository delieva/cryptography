const { betAndPlay, createAccount } = require('./requests')
const MersenneTwister = require('mersenne-twister');
const { Mt } = require('./RNGModes');

// Using "random" id from timestamp to break casino with "random" numbers from timestamp | ha-ha
const playerId = Math.floor(Date.now() / 1000);

const hackMt = async () => {
  try {
    let mainGenerator;

    const timeStampBeforeReq = Math.floor(Date.now() / 1000) - 1

    await createAccount(playerId);
    console.log(`Player: ${playerId} created`)
    const betResponse = await betAndPlay(Mt, playerId, 1, 1)

    const timestampAfterReq = Math.floor(Date.now() / 1000) + 1

    for (let i = timeStampBeforeReq; i < timestampAfterReq; i++) {
      const generator = new MersenneTwister(i);
      const int = generator.random_int();

      console.log(`${int} === ${betResponse.realNumber}, seed: ${i}`)

      if (int === betResponse.realNumber) {
        mainGenerator = generator
      }
    }

    let money = betResponse.account.money;

    if (!mainGenerator) {
      throw Error('Main generator was not guessed')
    }

    while (money < 1e6) {
      const betNumber = mainGenerator.random_int();
      const winResponse = await betAndPlay(Mt, playerId, Math.round(money / 2), betNumber);
      money += winResponse.account.money;

      console.log(`Is victory: ${betNumber === winResponse.realNumber}`)
      console.log(winResponse.message);
      console.log('Currenct money state: ' + money, '\n\n')
    }
  } catch (e) {
    console.log(e.message)
    // console.log(e.message, e.response && e.response.data)
  }
}

hackMt();