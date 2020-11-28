require('dotenv').config({path: './../.env'});
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordVersion: {
    type: DataTypes.NUMBER,
    allowNull: false,
    defaultValue: process.env.PASSWORD_VERSION
  },
  compromised: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'user',
  tableName: 'user',
  defaultScope: {
    attributes: { exclude: ['password'] },
  }
});

module.exports = User;
