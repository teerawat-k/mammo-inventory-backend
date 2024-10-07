'use strict'

const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const routers = require('../routes')

app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))

app.use('/api', routers)
app.use((_, res) => {
  res.status(404).json({ code: '404', message: 'Service not found' })
})

module.exports = app