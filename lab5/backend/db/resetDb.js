const sequelize = require('./sequelize');
const {hashPassword} = require('../utils/hash');
const User = require('./models/user');

const honeyUsers = [
  {
    login: 'super',
    password: 'qwerty@1',
  },
  {
    login: 'user',
    password: 'password11',
  }
]

const reset = async () => {
  try {
    await sequelize.sync({force: true})
    const users = await Promise.all(honeyUsers.map(async (u) => ({
        ...u,
        password: await hashPassword(u.password)
      })
    ))

    await User.bulkCreate(users)
  } catch (e) {
    console.log(e)
  }
}

reset();