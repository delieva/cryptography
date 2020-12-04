require('dotenv').config({path: './../.env'});
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const { encryptData, decryptData } = require('../../utils/encryption')

const fieldsForEncrypt = ['phone', 'address'];

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
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordVersion: {
    type: DataTypes.NUMBER,
    allowNull: false,
    defaultValue: process.env.PASSWORD_VERSION
  },
  storeVersion: {
    type: DataTypes.NUMBER,
    allowNull: false,
    defaultValue: process.env.PASSWORD_VERSION,
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
  },
  hooks: {
    async beforeCreate(model) {
      for (let f of fieldsForEncrypt) {
        model[f] = await encryptData(model[f])
      }
    },
    async beforeBulkCreate(models) {
      for (let v of models) {
        for (let f of fieldsForEncrypt) {
          v[f] = await encryptData(v[f])
        }
      }
    },
    async afterFind(model) {
      const models = Array.isArray(model) ? model : [model];
      for (let v of models) {
        for (let f of fieldsForEncrypt) {
          v.dataValues[f] = await decryptData(v.dataValues[f])
        }
      }
    }
  }
});

module.exports = User;
