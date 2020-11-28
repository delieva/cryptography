const { hashPassword, comparePassword } = require('./utils/hash')
const topPasswords = require('./constants/topPasswords');
const throwBackendError = require('./utils/throwError');
const User = require('./db/models/user');

let linkToChangePassword = 'http://some_link_:_)'

class AuthController {
  static validatePassword = (password, passwordRepeat) => {
    if (password.length < 8) {
      throwBackendError('Password should have more than 8 characters', 400)
    }

    if (password !== passwordRepeat) {
      throwBackendError('Password and password repeat are not the same', 400)
    }

    if (topPasswords.includes(password)) {
      throwBackendError('Your password exists in top used passwords table and is easy to hack. Please choose another one!')
    }
  }

  static async login(login, password) {
    const user = await User.findOne({
      where: { login },
      attributes: {
        include: ['password']
      }
    });
    console.log(user, user.password)
    if (!user || !(await comparePassword(user.password, password))) {
      throwBackendError('Incorrect login or password', 400)
    }

    if (user.compromised) {
      throwBackendError(`Your password is compromised. Pleas, change it here ${linkToChangePassword}`, 409)
    }

    return {
      id: user.id,
      login: user.login,
      createdAt: user.createdAt
    }
  }

  static async register(login, password, passwordRepeat) {
    const userExist = await User.findOne({where: { login }});

    if (userExist) {
      throwBackendError('User already exist', 409)
    }

    AuthController.validatePassword(password, passwordRepeat);

    const hashedPassword = await hashPassword(password)

    const user = await User.create({
      login,
      password: hashedPassword,
    })

    return {
      id: user.id,
      login: user.login,
      createdAt: user.createdAt
    }
  }
}

module.exports = AuthController;