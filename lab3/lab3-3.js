const { betAndPlay, createAccount } = require('./requests')
const MtRecover = require('./rngs/mt');
const { BetterMt } = require('./RNGModes');

// Using "random" id from timestamp to break casino with "random" numbers from timestamp | ha-ha
const playerId = Math.floor(Date.now() / 1000);
const mtRecover = new MtRecover();

const hackBetterMt = async () => {
  try {
    let betResponse;
    const mtStates = [];
    await createAccount(playerId);

    console.log(`Player: ${playerId} created`)

    for (let i = 0; i < 624; i++) {
      betResponse = await betAndPlay(BetterMt, playerId, 1, 1)
      mtStates.push(betResponse.realNumber);
      console.log(`Added rand number: ${betResponse.realNumber}`)
    };

    const mainGenerator = mtRecover.reverse(mtStates);
    let money = betResponse.account.money;

    while (money < 1e6) {
      const betNumber = mainGenerator.random_int();
      const winResponse = await betAndPlay(BetterMt, playerId, Math.round(money / 2), betNumber);
      money += winResponse.account.money;

      console.log(`Is victory: ${betNumber === winResponse.realNumber}`)
      console.log(winResponse.message);
      console.log('Currenct money state: ' + money, '\n\n')
    }
  } catch (e) {
    console.log(e.message)
  }
}

hackBetterMt();