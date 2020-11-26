const { Router } = require('express');
const AuthController = require('./authController');

const router = new Router();

router.get('/', (req, res) => {
  res.status(200).send('Backend for crypto lab 5')
})

router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body;
    const data = AuthController.login(login, password)

    return res.status(200);
  } catch (e) {
    res.status(500).send();
  }
})

router.post('/register', (req, res) => {
  try {
    const { login, password, passwordRepeat } = req.body;
    const data = AuthController.register(login, password, passwordRepeat)

    return res.status(200);
  } catch (e) {
    res.status(500).send();
  }
})



module.exports = router;