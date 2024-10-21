'use strict'

const entity = require('../entity')
const DocumentStatusService = require('../service/DocumentStatus.Service')
const GoodsReceiptService = require('../service/GoodsReceipt.Service')
const { logger, validation, utils, axios } = require('../utils')
const { Op, Sequelize, where } = require('sequelize')
const serviceName = 'invgr'

const createOrUpdateGRValidator = {
  vendorId: 'required|integer',
  createdStaffId: 'integer',
  documentStatusId: 'integer',
  refNumber: 'string',
  importDate: 'date',
  documentDate: 'date',
  dueDate: 'date',
  receiveStaffId: 'integer',
  receiveDate: 'date',
  remark: 'string'
}

const createOrUpdateProductValidator = {
  id: 'integer',
  goodsReceiptId: 'required|integer',
  productId: 'required|integer',
  qty: 'required|integer',
  actualQty: 'integer',
  warehouseStorageId: 'integer',
  remark: 'string'
}

module.exports.Search = async (req, res) => {
  try {
    // validate input
    const validate = validation(req.query, {
      pageNo: 'required|integer',
      pageSize: 'required|integer',
      ordering: 'string',
      grNumber: 'string'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    // where and ordering
    const body = req.query
    const displayColumn = [
      'id',
      'grNumber',
      'documentStatusId',
      'documentStatusName',
      'documentDate',
      'vendorCode',
      'vendorName',
      'dueDate',
      'refNumber',
      'receiveStaffDisplayName',
      'receiveStaffFirstNameTH',
      'receiveStaffLastNameTH',
      'receiveStaffFirstNameEN',
      'receiveStaffLastNameEN',
      'receiveDate'
    ]
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })

    let result = await entity.ViewGoodsReceipt.findAndCountAll({
      attributes: displayColumn,
      where: whereCondition,
      offset: (body.pageNo - 1) * body.pageSize,
      limit: body.pageSize,
      order: sortCondition
    })

    result.rows = await DocumentStatusService.GenerateNextStatus(result.rows)

    return res.json({ isError: false, totalRow: result.count, body: result.rows })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchDetail = async (req, res) => {
  try {
    // validate input
    const validate = validation(req.params, {
      goodsReceiptId: 'required|integer'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const targetId = req.params.goodsReceiptId
    const displayColumn = [
      'id',
      'grNumber',
      'documentStatusId',
      'documentStatusName',
      'documentDate',
      'vendorId',
      'vendorName',
      'vendorCode',
      'vendorTel',
      'vendorEmail',
      'vendorAddress',
      'dueDate',
      'refNumber',
      'createdStaffId',
      'createdStaffDisplayName',
      'createdStaffFirstNameTH',
      'createdStaffLastNameTH',
      'createdStaffFirstNameEN',
      'createdStaffLastNameEN',
      'receiveStaffId',
      'receiveStaffDisplayName',
      'receiveStaffFirstNameTH',
      'receiveStaffLastNameTH',
      'receiveStaffFirstNameEN',
      'receiveStaffLastNameEN',
      'receiveDate'
    ]

    let result = await entity.ViewGoodsReceipt.findOne({
      attributes: displayColumn,
      where: { id: targetId }
    })
    if (!result) return res.json({ isError: true, message: `ไม่พบข้อมูลใบรับเข้าสินค้า` })

    result = await DocumentStatusService.GenerateNextStatus(result)

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchProduct = async (req, res) => {
  try {
    const targetId = req.params.goodsReceiptId
    const displayColumn = [
      'id',
      'productImage',
      'productId',
      'productCode',
      'productName',
      'unitName',
      'warehouseId',
      'warehouseName',
      'warehouseStorageId',
      'warehouseStorageName',
      'qty',
      'actualQty',
      'remark'
    ]

    // check record exists
    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId } })
    if (!record) return res.json({ isError: true, message: 'ไม่พบข้อมูลใบรับเข้าสินค้าที่ต้องการดูรายการสินค้า' })

    const result = await entity.ViewGoodsReceiptProduct.findAll({
      attributes: displayColumn,
      where: { goodsReceiptId: targetId },
      order: [['id', 'DESC']]
    })

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.CreateGoodsReceipt = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateGRValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id

    // ==============================================================================
    //                                  Goods Receipts
    // ==============================================================================
    // check vendor record exists
    if (body.vendorId) {
      const vendorRecord = await entity.Vendor.findOne({ where: { id: body.vendorId } })
      if (!vendorRecord) {
        transaction.rollback()
        return res.json({ isError: true, message: `ไม่พบข้อมูลผู้ขายในระบบ` })
      }
    }

    // // check receiver record exists
    if (body.receiveStaffId) {
      const receiveStaffRecord = await entity.Employee.findOne({ where: { id: body.receiveStaffId } })
      if (!receiveStaffRecord) {
        return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงานผู้รับสินค้า' })
      }
    }

    const resultNextGrNumber = await GoodsReceiptService.GenerateGRNumber(req)
    if (resultNextGrNumber.isError) {
      transaction.rollback()
      return res.json(resultNextGrNumber)
    }
    const nextGrNumber = resultNextGrNumber.data

    // create goods receipts
    body.createdStaffId = body.createdStaffId ? body.createdStaffId : userId
    body.documentDate = body.documentDate ? body.documentDate : new Date()
    // find jsonb document status in jsonb array
    const documentStatus = await entity.DocumentStatus.findOne({
      where: { exten: { [Op.contains]: ['gr_default'] }, service: 'invgr', module: 'inventory.module' }
    })
    if (!documentStatus) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารรับเข้าเข้าที่ถูกตั้งเป็นค่าเริ่มต้น' })
    }

    // filter allow key
    const queryBodyGoodsReceipt = {}
    Object.keys(body).map((key) => (createOrUpdateGRValidator[key] ? (queryBodyGoodsReceipt[key] = body[key]) : null))
    queryBodyGoodsReceipt.documentStatusId = documentStatus.id
    queryBodyGoodsReceipt.grNumber = nextGrNumber
    queryBodyGoodsReceipt.createdBy = userId
    queryBodyGoodsReceipt.createdAt = new Date()

    const createdGoodsReceiptResult = await entity.GoodsReceipt.create(queryBodyGoodsReceipt, { transaction })
    if (!createdGoodsReceiptResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างข้อมูลใบรับเข้าเข้าสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Goods Receipts Product
    // ==============================================================================
    let GoodsReceiptProductUserActivityBody = []
    for (const product of body.createGoodsReceiptProduct) {
      product.goodsReceiptId = createdGoodsReceiptResult.id
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) return res.json({ isError: true, message: `(CreateGoodsReceiptProduct) : ` + validateResult.message })
    }

    // add goodsReceiptId and createdBy to goodsReceipt storage body
    const productsQueryBody = body.createGoodsReceiptProduct.map((_product) => {
      return {
        goodsReceiptId: createdGoodsReceiptResult.id,
        productId: _product.productId,
        qty: _product.qty,
        actualQty: _product.actualQty,
        remark: _product.remark,
        warehouseStorageId: _product.warehouseStorageId,
        remark: _product.remark,
        createdBy: userId
      }
    })

    // create product in goodsReceipt
    const createdGoodsReceiptProductResult = await entity.GoodsReceiptProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdGoodsReceiptProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบรับเข้าเข้าสินค้าล้มเหลว' })
    }
    for (const product of createdGoodsReceiptProductResult) {
      GoodsReceiptProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบรับเข้าเข้าสินค้า', false, {}, product.dataValues)
      )
    }

    // // log user activity goods receipts
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, createdGoodsReceiptResult.id, 'create', 'สร้างข้อมูลใบรับเข้าเข้าสินค้า', false, {}, queryBodyGoodsReceipt),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(GoodsReceiptProductUserActivityBody, { transaction })

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'สร้างข้อมูลใบรับเข้าเข้าสินค้าสำเร็จ', body: { id: createdGoodsReceiptResult.id } })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateGoodsReceipt = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateGRValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.goodsReceiptId

    // ==============================================================================
    //                                  Goods Receipts
    // ==============================================================================

    // check exists goods receipts record
    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: `ไม่พบข้อมูลใบรับเข้าสินค้าที่ต้องการแก้ไข` })
    }

    // check vendor record exists
    if (body.vendorId) {
      const vendorRecord = await entity.Vendor.findOne({ where: { id: body.vendorId } })
      if (!vendorRecord) {
        transaction.rollback()
        return res.json({ isError: true, message: `ไม่พบข้อมูลผู้ขายในระบบ` })
      }
    }

    // check receiver record exists
    if (body.receiveStaffId) {
      const receiveStaffRecord = await entity.Employee.findOne({ where: { id: body.receiveStaffId } })
      if (!receiveStaffRecord) {
        transaction.rollback()
        return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงานผู้รับสินค้า' })
      }
    }

    // update goods receipts
    // filter allow key
    const queryBodyGoodsReceipt = {}
    Object.keys(body).map((key) => (createOrUpdateGRValidator[key] ? (queryBodyGoodsReceipt[key] = body[key]) : null))
    delete queryBodyGoodsReceipt.documentStatusId
    queryBodyGoodsReceipt.updatedBy = userId
    queryBodyGoodsReceipt.updatedAt = new Date()
    const updatedGoodsReceiptResult = await entity.GoodsReceipt.update(queryBodyGoodsReceipt, {
      where: { id: targetId },
      transaction: transaction,
      returning: true
    })
    if (updatedGoodsReceiptResult[0] === 0) {
      transaction.rollback()
      return res.json({ isError: true, message: 'แก้ไขข้อมูลใบรับเข้าเข้าสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Goods Receipts Product
    // ==============================================================================
    let GoodsReceiptProductUserActivityBody = []

    // ----------------- delete goods receipts product -----------------
    // ----------------- delete goods receipts product -----------------
    // validate delete goods receipts product
    for (const product of body.deleteGoodsReceiptProduct) {
      const validateProduct = validation(product, { id: 'required|integer' })
      if (!validateProduct.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(deleteGoodsReceiptProduct) : ` + validateProduct.message })
      }
    }
    const preDeletedRecord = await entity.GoodsReceiptProduct.findAll({
      where: { goodsReceiptId: targetId, id: { [Op.in]: body.deleteGoodsReceiptProduct.map((item) => item.id) } }
    })
    await entity.GoodsReceiptProduct.destroy({
      where: { goodsReceiptId: targetId, id: { [Op.in]: body.deleteGoodsReceiptProduct.map((item) => item.id) } },
      transaction: transaction
    })
    for (const product of body.deleteGoodsReceiptProduct) {
      const preRecord = preDeletedRecord.find((item) => item.id === product.id)
      if (preRecord) {
        GoodsReceiptProductUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, product.id, 'delete', 'ลบรายการสินค้าภายในใบรับเข้าเข้าสินค้า', false, preRecord, {})
        )
      }
    }
    const deletedRecord = body.deleteGoodsReceiptProduct.map((item) => item.id)

    // ----------------- create goods receipts product -----------------
    // ----------------- create goods receipts product -----------------
    // validate create goods receipts product
    for (const product of body.createGoodsReceiptProduct) {
      product.goodsReceiptId = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(CreateGoodsReceiptProduct) : ` + validateResult.message })
      }
    }

    // create product in goodsReceipt
    const productsQueryBody = body.createGoodsReceiptProduct.map((_product) => {
      return {
        goodsReceiptId: targetId,
        productId: _product.productId,
        warehouseStorageId: _product.warehouseStorageId,
        qty: _product.qty,
        actualQty: _product.actualQty,
        remark: _product.remark,
        createdBy: userId
      }
    })
    const createdGoodsReceiptProductResult = await entity.GoodsReceiptProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdGoodsReceiptProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบรับเข้าเข้าสินค้าล้มเหลว' })
    }
    for (const product of createdGoodsReceiptProductResult) {
      GoodsReceiptProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบรับเข้าเข้าสินค้า', false, {}, product.dataValues)
      )
    }

    // ----------------- update goods receipts product -----------------
    // ----------------- update goods receipts product -----------------
    // validate update goods receipts product
    for (const product of body.updateGoodsReceiptProduct) {
      product.goodsReceiptId = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(UpdateGoodsReceiptProduct) : ` + validateResult.message })
      }
    }

    // update product in goodsReceipt
    for (const product of body.updateGoodsReceiptProduct) {
      // skip if product id not exists
      if (deletedRecord.includes(product.id)) continue

      const productQueryBody = {
        goodsReceiptId: targetId,
        productId: product.productId,
        warehouseStorageId: product.warehouseStorageId,
        qty: product.qty,
        actualQty: product.actualQty,
        remark: product.remark,
        updatedBy: userId,
        updatedAt: new Date()
      }
      const record = await entity.GoodsReceiptProduct.findOne({ where: { id: product.id, goodsReceiptId: targetId } })
      if (!record) {
        transaction.rollback()
        return res.json({ isError: true, message: `ไม่พบข้อมูลรายการสินค้าภายในใบรับเข้าสินค้ารหัส ${product.id}` })
      }
      const updatedProductResult = await entity.GoodsReceiptProduct.update(productQueryBody, {
        where: { id: product.id },
        transaction: transaction,
        returning: true
      })
      if (updatedProductResult[0] === 0) {
        transaction.rollback()
        return res.json({ isError: true, message: `แก้ไขข้อมูลรายการสินค้าภายในใบรับเข้าสินค้ารหัส ${product.id} ล้มเหลว` })
      }

      GoodsReceiptProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'update', 'แก้ไขรายการสินค้าภายในใบรับเข้าสินค้า', true, record, updatedProductResult[1][0])
      )
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขข้อมูลใบรับเข้าสินค้า', true, record, updatedGoodsReceiptResult[1][0]),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(GoodsReceiptProductUserActivityBody, { transaction })

    // commit transaction
    await transaction.commit()

    if (body.documentStatusId !== record.documentStatusId) {
      const _transaction = await entity.seq.transaction()
      const result = await GoodsReceiptService.UpdateDocumentStatus(targetId, body.documentStatusId, userId, _transaction)
      if (result.isError) {
        transaction.rollback()
        return res.json(result)
      } else {
        await _transaction.commit()
      }
    }

    return res.json({ isError: false, message: 'แก้ไขข้อมูลใบรับเข้าเข้าสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateGoodsReceiptDocumentStatus = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body
    // validate input
    const validate = validation(body, { documentStatusId: 'required|integer' })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.goodsReceiptId

    const result = await GoodsReceiptService.UpdateDocumentStatus(targetId, body.documentStatusId, userId, transaction)
    if (result.isError) {
      transaction.rollback()
      return res.json(result)
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขสถานะเอกสารใบรับเข้าสินค้า', true, result.record, result.data)
    )

    transaction.commit()
    return res.json({ isError: false, message: 'แก้ไขสถานะเอกสารใบรับเข้าสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.DeleteGoodsReceipt = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const targetId = req.params.goodsReceiptId
    const userId = req.user.id

    // check is target record exists
    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลรับเข้าเข้าสินค้าที่ต้องการลบ' })
    }

    // delete goods receipts products
    let goodsReceiptProductsUserActivityBody = []
    const preDeletedRecord = await entity.GoodsReceiptProduct.findAll({ where: { goodsReceiptId: targetId } })
    await entity.GoodsReceiptProduct.destroy({ where: { goodsReceiptId: targetId }, transaction: transaction })
    for (const deletedRecord of preDeletedRecord) {
      const preRecord = preDeletedRecord.find((item) => item.id === deletedRecord.id)
      if (preRecord) {
        goodsReceiptProductsUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, deletedRecord.id, 'delete', 'ลบข้อมูลสินค้าในใบรับเข้าเข้าสินค้า', false, preRecord, {})
        )
      }
    }

    // delete goods receipts
    await entity.GoodsReceipt.destroy({ where: { id: targetId }, transaction: transaction })

    // // log user activity
    await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'delete', 'ลบข้อมูลใบรับเข้าเข้าสินค้า', false, record, {}), {
      transaction
    })
    await entity.LogsUserActivity.bulkCreate(goodsReceiptProductsUserActivityBody, { transaction })

    transaction.commit()
    return res.json({ isError: false, message: 'ลบข้อมูลใบรับเข้าเข้าสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
