'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')
const GoodsReceiptsController = require('../controller/GoodsReceipts.Controller')

router.get('/search', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptsController.Search)
router.get('/:goodsReceiptsId/detail', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptsController.SearchDetail)
router.get('/:goodsReceiptsId/products', AuthenticationMiddleware.Permission('invgr.v'), GoodsReceiptsController.SearchProduct)
router.post('/create', AuthenticationMiddleware.Permission('invgr.c'), GoodsReceiptsController.CreateGoodsReceipts)
router.put('/:goodsReceiptsId/update', AuthenticationMiddleware.Permission('invgr.u'), GoodsReceiptsController.UpdateGoodsReceipts)
router.put('/:goodsReceiptsId/update-document-status', AuthenticationMiddleware.Permission('invgr.u'), GoodsReceiptsController.UpdateGoodsReceiptsDocumentStatus)
router.delete('/:goodsReceiptsId/delete', AuthenticationMiddleware.Permission('invgr.d'), GoodsReceiptsController.DeleteGoodsReceipts)

module.exports = router
