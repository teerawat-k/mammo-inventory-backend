'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')
const GoodsReceiptController = require('../controller/GoodsReceipt.Controller')

router.get('/search', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptController.Search)
router.get('/:goodsReceiptId/detail', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptController.SearchDetail)
router.get('/:goodsReceiptId/product', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptController.SearchProduct)
router.post('/create', AuthenticationMiddleware.Permission('invgr.c'), GoodsReceiptController.CreateGoodsReceipt)
router.put('/:goodsReceiptId/update', AuthenticationMiddleware.Permission('invgr.u'), GoodsReceiptController.UpdateGoodsReceipt)
router.put('/:goodsReceiptId/update-document-status', AuthenticationMiddleware.Permission('invgr.u'), GoodsReceiptController.UpdateGoodsReceiptDocumentStatus)
router.delete('/:goodsReceiptId/delete', AuthenticationMiddleware.Permission('invgr.d'), GoodsReceiptController.DeleteGoodsReceipt)

module.exports = router
