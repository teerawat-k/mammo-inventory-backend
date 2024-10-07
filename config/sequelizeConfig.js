'use strict'

require('dotenv').config()

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  timezone: '+07:00',
  logging: false,
  query: {
    raw: true
  },
  migrationStorageTableSchema: 'public',
  migrationStorageTableName: '_migration_meta_inventory'
}
