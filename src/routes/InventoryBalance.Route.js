'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')
const InventoryBalanceController = require('../controller/InventoryBalance.Controller')

router.get('/:productId/search-detail', AuthenticationMiddleware.Permission('invib.v'), InventoryBalanceController.SearchDetail)
router.get('/:productId/search-storage', AuthenticationMiddleware.Permission('invib.v'), InventoryBalanceController.SearchStorage)
router.get('/:productId/search-transaction', AuthenticationMiddleware.Permission('invib.v'), InventoryBalanceController.SearchTransaction)
// router.get('/:goodsReceiptId/detail', AuthenticationMiddleware.Permission('invib.v'), GoodsReceiptController.SearchDetail)
// router.get('/:goodsReceiptId/product', AuthenticationMiddleware.Permission('invib.v'), GoodsReceiptController.SearchProduct)
// router.post('/create', AuthenticationMiddleware.Permission('invib.c'), GoodsReceiptController.CreateGoodsReceipt)
// router.put('/:goodsReceiptId/update', AuthenticationMiddleware.Permission('invib.u'), GoodsReceiptController.UpdateGoodsReceipt)
// router.put('/:goodsReceiptId/update-document-status', AuthenticationMiddleware.Permission('invib.u'), GoodsReceiptController.UpdateGoodsReceiptDocumentStatus)
// router.delete('/:goodsReceiptId/delete', AuthenticationMiddleware.Permission('invib.d'), GoodsReceiptController.DeleteGoodsReceipt)

module.exports = router
