'use strict'

const express = require('express')
const router = express.Router()

const InventoryProductController = require('../controller/InventoryProduct.Controller')

router.get('/search', InventoryProductController.Search)
router.get('/:productId/detail', InventoryProductController.SearchDetail)
router.put('/:productId/update', InventoryProductController.UpdateProduct)

module.exports = router
