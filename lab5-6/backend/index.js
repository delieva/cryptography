require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./router');

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(router)

const start = async () => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
}

start();
