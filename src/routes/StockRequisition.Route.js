'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')
const StockRequisitionController = require('../controller/StockRequisition.Controller')

router.get('/search', AuthenticationMiddleware.Permission('invgr.v'), StockRequisitionController.Search)
router.get('/:stockRequisitionId/detail', AuthenticationMiddleware.Permission('invgr.v'), StockRequisitionController.SearchDetail)
router.get('/:stockRequisitionId/products', AuthenticationMiddleware.Permission('invgr.v'), StockRequisitionController.SearchProduct)
router.post('/create', AuthenticationMiddleware.Permission('invgr.c'), StockRequisitionController.CreateStockRequisition)
router.put('/:stockRequisitionId/update', AuthenticationMiddleware.Permission('invgr.u'), StockRequisitionController.UpdateStockRequisition)
router.put('/:stockRequisitionId/update-document-status', AuthenticationMiddleware.Permission('invgr.u'), StockRequisitionController.UpdateStockRequisitionDocumentStatus)
router.delete('/:stockRequisitionId/delete', AuthenticationMiddleware.Permission('invgr.d'), StockRequisitionController.DeleteStockRequisition)

module.exports = router
