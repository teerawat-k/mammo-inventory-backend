'use strict'

const express = require('express')
const router = express.Router()

const AuthenticationMiddleware = require('../middleware/Authentication.Middleware')
const WarehouseManagement = require('../controller/WarehouseManagement.Controller')

router.get('/search', AuthenticationMiddleware.Permission('invwh.v'), WarehouseManagement.Search)
router.get('/:warehouseId/detail', AuthenticationMiddleware.Permission('invwh.v'), WarehouseManagement.SearchDetail)
router.get('/:warehouseId/storage', AuthenticationMiddleware.Permission('invwh.v'), WarehouseManagement.SearchStorage)
router.post('/create-warehouse', AuthenticationMiddleware.Permission('invwh.c'), WarehouseManagement.CreateWarehouse)
router.put('/:warehouseId/update-warehouse', AuthenticationMiddleware.Permission('invwh.u'), WarehouseManagement.UpdateWarehouse)
router.delete('/:warehouseId/delete-warehouse', AuthenticationMiddleware.Permission('invwh.d'), WarehouseManagement.DeleteWarehouse)

module.exports = router
