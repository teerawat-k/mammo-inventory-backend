'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')

//Master
const MasterRoute = require('./Master.Route')
const WarehouseRouteManagementRoute = require('./WarehouseManagement.Route')
const GoodsReceiptRoute = require('./GoodsReceipt.Route')
const StockRequisitionRoute = require('./StockRequisition.Route')

router.use('/master', AuthenticationMiddleware.AccessSession, MasterRoute)
router.use('/warehouse-management', AuthenticationMiddleware.AccessSession, WarehouseRouteManagementRoute)
router.use('/goods-receipts', AuthenticationMiddleware.AccessSession, GoodsReceiptRoute)
router.use('/stock-requisition', AuthenticationMiddleware.AccessSession, StockRequisitionRoute)

module.exports = router