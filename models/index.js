// Add Sequelize models to the project
// http://sequelizejs.com/articles/express

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const lodash = require('lodash')
const config = require('../config')
const db = {}

const DATABASE = config.mysql_database
const HOST = config.mysql_host
const USERNAME = config.mysql_user
const PASSWORD = config.mysql_password
const DIALECT = config.dialect
const PORT = config.mysql_port

const sequelize = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  dialect: DIALECT,
  host: HOST,
  port: PORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

fs
  .readdirSync(__dirname)
  .filter(function (file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js')
  }).forEach(function (file) {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach(function (modelName) {
  if (db[modelName].hasOwnProperty('associate')) {
    db[modelName].associate(db)
  }
})

module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: sequelize
}, db)
