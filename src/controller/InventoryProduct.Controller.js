'use strict'

const entity = require('../entity')
const { logger, validation, utils } = require('../utils')
const serviceName = 'invp'

const createOrUpdateInventoryProductValidator = {
  isAlert: 'boolean',
  alertQty: 'integer',
  warehouseRemark: 'string'
}

module.exports.Search = async (req, res) => {
  try {
    // Validate input
    const validate = validation(req.query, {
      pageNo: 'required|integer',
      pageSize: 'required|integer',
      ordering: 'string'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    // search by condition
    const body = req.query
    const displayColumn = [
      'id',
      'image',
      'code',
      'name',
      'barcode',
      'description',
      'remark',
      'categoryId',
      'categoryCode',
      'categoryName',
      'unitId',
      'unitName',
      'isAlert',
      'alertQty',
      'warehouseRemark'
    ]
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })
    whereCondition.isDeleted = false

    if(body.categoryId){
        whereCondition.categoryId = body.categoryId
    }

    const result = await entity.ViewInvProduct.findAndCountAll({
      attributes: displayColumn,
      where: whereCondition,
      offset: (body.pageNo - 1) * body.pageSize,
      limit: body.pageSize,
      order: sortCondition
    })

    return res.json({ isError: false, totalRow: result.count, body: result.rows })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchDetail = async (req, res) => {
  try {
    const targetId = req.params.productId
    const displayColumn = [
      'id',
      'image',
      'code',
      'name',
      'barcode',
      'description',
      'remark',
      'categoryId',
      'categoryCode',
      'categoryName',
      'unitId',
      'unitName',
      'isAlert',
      'alertQty',
      'warehouseRemark'
    ]

    const result = await entity.ViewInvProduct.findOne({
      attributes: displayColumn,
      where: { id: targetId }
    })

    if (!result) return res.json({ isError: true, message: `ไม่พบข้อมูลสินค้า` })
    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateProduct = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateInventoryProductValidator)
    if (!validate.status) {
      transaction.rollback()
      return res.json({ isError: true, message: validate.message })
    }

    const userId = req.user.id
    const targetId = req.params.productId

    // check exists inventory product record record
    const record = await entity.InvProduct.findOne({ where: { productId: targetId } })
    if (record) {
      // filter allow key
      const queryBodyProduct = {}
      Object.keys(body).map((key) => (createOrUpdateInventoryProductValidator[key] ? (queryBodyProduct[key] = body[key]) : null))
      queryBodyProduct.updatedBy = userId
      queryBodyProduct.alertQty = queryBodyProduct.alertQty || 0
      queryBodyProduct.updatedAt = new Date()
      const updatedInventoryProductResult = await entity.InvProduct.update(queryBodyProduct, {
        where: { id: record.id },
        transaction: transaction,
        returning: true
      })
      if (updatedInventoryProductResult[0] === 0) {
        transaction.rollback()
        return res.json({ isError: true, message: 'แก้ไขข้อมูลลินค้าล้มเหลว' })
      }
      // log user activity
      await entity.LogsUserActivity.create(
        utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขข้อมูสินค้า', true, record, updatedInventoryProductResult[1][0]),
        { transaction }
      )
    } else {
      const queryBodyProduct = {}
      Object.keys(body).map((key) => (createOrUpdateInventoryProductValidator[key] ? (queryBodyProduct[key] = body[key]) : null))
      queryBodyProduct.productId = targetId
      queryBodyProduct.alertQty = queryBodyProduct.alertQty || 0
      queryBodyProduct.createdBy = userId
      const createInventoryProductResult = await entity.InvProduct.create(queryBodyProduct, { transaction })
      if (!createInventoryProductResult) {
        transaction.rollback()
        return res.json({ isError: true, message: 'แก้ไขข้อมูลสินค้าล้มเหลว' })
      }
      // log user activity
      await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'create', 'สร้างข้อมูลสินค้า', false, {}, queryBodyProduct), {
        transaction
      })
    }

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'แก้ไขข้อมูลสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
