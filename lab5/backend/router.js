const { Router } = require('express');
const AuthController = require('./authController');

const router = new Router();

router.get('/', (req, res) => {
  res.status(200).send('Backend for crypto lab 5')
})

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    const data = await AuthController.login(login, password)

    return res.status(200).send(data);
  } catch (e) {
    res.status(e.code || 500).send(e.message || e.toString());
  }
})

router.post('/register', async (req, res) => {
  try {
    const { login, password, repeatPassword } = req.body;
    const data = await AuthController.register(login, password, repeatPassword)

    return res.status(200).send(data);
  } catch (e) {
    res.status(e.code || 500).send(e.message || e.toString());
  }
})



module.exports = router;