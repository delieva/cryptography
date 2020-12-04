const sequelize = require('./sequelize');
const {hashPassword} = require('../utils/hash');
const User = require('./models/user');
const { encryptData } = require('../utils/encryption');

const honeyUsers = [
  {
    login: 'super',
    password: 'qwerty@1',
    phone: '+380653312875',
    address: 'Marka Cheremshyny 22',
  },
  {
    login: 'user',
    password: 'password11',
    phone: '+380653312875',
    address: 'Marka Cheremshyny 22',
  }
]

const reset = async () => {
  try {
    await sequelize.sync({force: true})
    const users = await Promise.all(honeyUsers.map(async (u) => ({
        ...u,
        password: await hashPassword(u.password),
        // phone: await encryptData(u.phone),
        // address: await encryptData(u.address),
      })
    ))

    await User.bulkCreate(users)
  } catch (e) {
    console.log(e)
  }
}

reset();