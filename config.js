const mysqlDatabase = process.env.DATABASE || 'whatsapp-db' // 'FBP_Whatsapp'
const mysqlHost = process.env.DB_HOST || '9.30.230.198' // '146.88.27.110'
const mysqlUser = process.env.DB_USER || 'admin' // 'rnd'
const mysqlPassword = process.env.DB_PASS || 'Admin@123' // 'rnd@321456'
const mysqlPort = process.env.DB_PORT || '3306' // '1433'
const dialect = 'mysql' // 'mssql'
const elasticsearchHost = process.env.ELASTIC_HOST || ['http://9.30.43.28:8200']
const elasticUser = process.env.ELASTIC_USER || 'admin'
const elasticPass = process.env.ELASTIC_PASS || null

const config = {
  mysql_database: mysqlDatabase,
  mysql_host: mysqlHost,
  mysql_user: mysqlUser,
  mysql_password: mysqlPassword,
  mysql_port: mysqlPort,
  dialect: dialect,
  elastic_hosts: elasticsearchHost,
  elastic_user: elasticUser,
  elastic_pass: elasticPass
}

module.exports = config
