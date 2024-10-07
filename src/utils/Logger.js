'use strict'

const utils = require('./Utils')
const dayjs = require('dayjs')
const { createLogger, format, transports } = require('winston')
const nodeENV = process.env.NODE_ENV || 'development'
const fs = require('fs')

if (nodeENV === 'development') {
  fs.rmSync('logs', { recursive: true, force: true })
}

const loggerControl = createLogger({
  transports: [
    new transports.Console({
      level: process.env.LOG_LEVEL,
      eol: '\n',
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
      )
    }),
    new transports.File({
      filename: `logs/system/${dayjs().format('YYYY-MM-DD')}.log`,
      level: process.env.LOG_LEVEL,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
      )
    })
  ],
  silent: process.env.LOG_ENABLED === 'true' ? false : true
})

const loggerControlHttp = createLogger({
  transports: [
    new transports.File({
      filename: `logs/request/${dayjs().format('YYYY-MM-DD')}.log`,
      level: process.env.LOG_LEVEL,
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf((info) => `${info.timestamp} ${info.level} ${info.message}`)
      )
    })
  ],
  silent: process.env.LOG_ENABLED === 'true' ? false : true
})

/**
 * Function to display debug console
 * @param req The request from client
 * @param message debug console message
 * @returns Null
 */
const debug = (req, message) => {
  if (req) {
    const url = req.originalUrl.split('?')[0]
    loggerControl.debug(`${utils.getClientIp(req)} ${req.method} ${url} ${message}`)
  } else {
    loggerControl.debug(`${message}`)
  }
}

/**
 * Function to display info console
 * @param message debug console message
 * @returns Null
 */
const info = (message) => {
  loggerControl.info(`${message}`)
}

/**
 * Function to display debug console
 * @param req The request from client
 * @param status The response status code (200, 401, 403, 412, 419, 500, 502)
 * @param message debug console message
 * @returns Null
 */
const http = (req) => {
  loggerControlHttp.http(` ${req.ip} ${req.method} ${req.originalUrl} ${req.headers['user-agent']}`)
}

/**
 * Function to display warning console
 * @param message debug console message
 * @returns Null
 */
const warn = (message) => {
  loggerControl.warn(`${message}`)
}

/**
 * Function to display error console
 * @param message debug console message
 * @returns Null
 */
const error = (message) => {
  console.error(message)
  loggerControl.error(`${message}`)
}

const logger = { debug, info, warn, http, error }

module.exports = logger
