'use strict'

const express = require('express')
const router = express.Router()

const MasterController = require('../controller/Master.Controller')

router.get('/warehouse', MasterController.Warehouse)
router.get('/warehouse-storage', MasterController.WarehouseStorage)

module.exports = router
