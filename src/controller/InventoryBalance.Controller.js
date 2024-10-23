'use strict'

const { attributes } = require('../../config/validation')
const entity = require('../entity')
const { axios } = require('../utils')
const { logger, validation, utils } = require('../utils')
const { Op } = require('sequelize')
const serviceName = 'invib'

module.exports.SearchDetail = async (req, res) => {
  try {
    // validate input
    const targetId = req.params.productId

    const product = await axios.GET(req, `/api/company/master/product/${targetId}`, {})
    if (!product) return res.json({ isError: true, message: 'ไม่พบข้อมูลสินค้าที่ต้องการ' })

    const sumInventoryBalance = await entity.InventoryBalance.sum('qty', { where: { productId: targetId } })

    const payload = {
      id: targetId,
      image: product.image,
      code: product.code,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      unitId: product.unitId,
      unitName: product.unitName,
      remark: product.remark,
      totalQty: sumInventoryBalance
    }

    return res.json({ isError: false, body: payload })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchStorage = async (req, res) => {
  try {
    // validate input

    const body = req.query
    const displayColumn = ['id', 'warehouseId', 'warehouseCode', 'warehouseName', 'warehouseStorageId', 'warehouseStorageCode', 'warehouseStorageName', 'qty']
    const targetId = req.params.productId
    const whereCondition = utils.FilterSearchString(displayColumn, body)

    const result = await entity.ViewInventoryBalance.findAll({
      attributes: displayColumn,
      where: { ...whereCondition, productId: targetId }
    })

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}


module.exports.SearchTransaction = async (req, res) => {
  try {
    // validate input

    const body = req.query
    const displayColumn = ['id', 'createdAt', 'type', 'refNumber', 'qty', 'balanceQty', 'warehouseId', 'warehouseCode', 'warehouseName', 'warehouseStorageId', 'warehouseStorageCode', 'warehouseStorageName']
    const targetId = req.params.productId
    const whereCondition = utils.FilterSearchString(displayColumn, body)

    const result = await entity.ViewInventoryBalanceTransaction.findAll({
      attributes: displayColumn,
      where: { ...whereCondition, productId: targetId }
    })

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}