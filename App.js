'use strict'

require('dotenv').config()
require('./src/entity')
const express = require('express')
const app = express()
const nodeENV = process.env.NODE_ENV || 'development'
const port = process.env.PORT || 3000
const routers = require('./src/routes')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { logger } = require('./src/utils')
const path = require('path')
const fs = require('fs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

app.listen(port, () => {
  logger.info(`Server is running in ${nodeENV} mode on port ${port}`)
})

app.set('trust proxy', 1)
app.use('/images', express.static(path.join(__dirname, 'public/images')))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true)
    },
    credentials: true
  })
)
app.use(helmet())
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // limit each IP to 200 requests per windowMs
    handler: (_, res) => {
      res.status(429).json({
        isError: true,
        message: 'มีการเรียกใช้งานบ่อยเกินไป, กรุณาลองใหม่ภายหลัง'
      })
    }
  })
)

app.use(
  '/api',
  (req, res, next) => {
    logger.http(req)
    next()
  },
  routers
)
app.use((_, res) => {
  return res.status(404).json({ code: '404', message: 'Service not found' })
})
