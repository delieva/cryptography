require('dotenv').config({path: '../.env'});
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_PATH,
});

module.exports = sequelize;