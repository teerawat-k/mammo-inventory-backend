'use strict'

const express = require('express')
const router = express.Router()

const MasterController = require('../controller/Master.Controller')

router.get('/product-category', MasterController.ProductCategory)

module.exports = router
