'use strict'

const entity = require('../entity')
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
  description: 'string'
}

const createOrUpdateProductValidator = {
  id: 'integer',
  goodsReceiptsId: 'required|integer',
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

    const result = await entity.ViewGoodsReceipt.findAndCountAll({
      attributes: displayColumn,
      where: whereCondition,
      offset: (body.pageNo - 1) * body.pageSize,
      limit: body.pageSize,
      order: sortCondition
    })

    const documentStatus = await entity.DocumentStatus.findAll()
    const processResult = result.rows.map((item) => {
      const docStatus = documentStatus.find((status) => status.id == item.documentStatusId)

      item.nextDocumentStatus = []
      if (docStatus) {
        if (docStatus.next && docStatus.next.length > 0) {
          item.nextDocumentStatus = docStatus.next.map((next) => {
            const _nextStatus = documentStatus.find((status) => status.code == next)
            if (_nextStatus) {
              return { id: _nextStatus.id, code: _nextStatus.code, name: _nextStatus.name }
            }
          })
        }
      }

      item.nextDocumentStatus = item.nextDocumentStatus.filter((item) => item)
      return item
    })

    return res.json({ isError: false, totalRow: result.count, body: processResult })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchDetail = async (req, res) => {
  try {
    // validate input
    const validate = validation(req.params, {
      goodsReceiptsId: 'required|integer'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const targetId = req.params.goodsReceiptsId
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

    const result = await entity.ViewGoodsReceipt.findOne({
      attributes: displayColumn,
      where: { id: targetId }
    })
    if (!result) return res.json({ isError: true, message: `ไม่พบข้อมูลใบรับเข้าสินค้า` })

    const documentStatus = await entity.DocumentStatus.findAll()
    const docStatus = documentStatus.find((status) => status.id == result.documentStatusId)
    result.nextDocumentStatus = []
    if (docStatus) {
      if (docStatus.next && docStatus.next.length > 0) {
        result.nextDocumentStatus = docStatus.next.map((next) => {
          const _nextStatus = documentStatus.find((status) => status.code == next)
          if (_nextStatus) {
            return { id: _nextStatus.id, code: _nextStatus.code, name: _nextStatus.name }
          }
        })
      }
    }

    result.nextDocumentStatus = result.nextDocumentStatus.filter((item) => item)
    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchProduct = async (req, res) => {
  try {
    const targetId = req.params.goodsReceiptsId
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
      where: { goodsReceiptsId: targetId },
      order: [['id', 'DESC']]
    })

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.CreateGoodsReceipts = async (req, res) => {
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

    const codePattern = await axios.GET(req, '/api/company/master/code-pattern', {})
    if (!codePattern | !codePattern.goodsReceiptNo) {
      return res.json({ isError: true, message: 'ไม่พบรูปแบบรหัสเอกสารรับเข้า' })
    }
    const goodsReceiptNoPattern = codePattern.goodsReceiptNo
    const numberLength = goodsReceiptNoPattern.numberLength
    let pattern = goodsReceiptNoPattern.pattern
      .replace(/{service}/g, 'GR')
      .replace(/{year}/g, new Date().getFullYear())
      .replace(/{month}/g, new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1)
      .replace(/{day}/g, new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate())
      .replace(/{timestamp}/g, new Date().getTime())

    const latestGoodsReceipt = await entity.GoodsReceipt.findOne({
      attributes: ['grNumber'],
      where: {
        grNumber: {
          [Op.and]: [{ [Op.like]: pattern + '%' }, where(Sequelize.fn('LENGTH', Sequelize.col('grNumber')), pattern.length + numberLength)]
        }
      },
      order: [['id', 'DESC']]
    })

    let nextGrNumber = null
    if (latestGoodsReceipt) {
      const runningNumber = parseInt(latestGoodsReceipt.grNumber.slice(-numberLength)) + 1
      nextGrNumber = pattern + runningNumber.toString().padStart(numberLength, '0')
    } else {
      nextGrNumber = pattern + '1'.padStart(numberLength, '0')
    }

    // create goods receipts
    body.createdStaffId = body.createdStaffId ? body.createdStaffId : userId
    body.documentDate = body.documentDate ? body.documentDate : new Date()
    // find jsonb document status in jsonb array
    const documentStatus = await entity.DocumentStatus.findOne({
      where: { exten: { [Op.contains]: ['gr_default'] }, service: 'invgr', module: 'inventory.module' }
    })
    if (!documentStatus) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารนำเข้าที่ถูกตั้งเป็นค่าเริ่มต้น' })
    }

    // filter allow key
    const queryBodyGoodsReceipts = {}
    Object.keys(body).map((key) => (createOrUpdateGRValidator[key] ? (queryBodyGoodsReceipts[key] = body[key]) : null))
    queryBodyGoodsReceipts.documentStatusId = documentStatus.id
    queryBodyGoodsReceipts.grNumber = nextGrNumber
    queryBodyGoodsReceipts.createdBy = userId
    queryBodyGoodsReceipts.createdAt = new Date()
    console.log(queryBodyGoodsReceipts)

    const createdGoodsReceiptsResult = await entity.GoodsReceipt.create(queryBodyGoodsReceipts, { transaction })
    if (!createdGoodsReceiptsResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างข้อมูลใบนำเข้าสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Goods Receipts Product
    // ==============================================================================
    let GoodsReceiptsProductUserActivityBody = []
    for (const product of body.createGoodsReceiptsProduct) {
      product.goodsReceiptsId = createdGoodsReceiptsResult.id
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) return res.json({ isError: true, message: `(CreateGoodsReceiptsProduct) : ` + validateResult.message })
    }

    // add goodsReceiptsId and createdBy to goodsReceipts storage body
    const productsQueryBody = body.createGoodsReceiptsProduct.map((_product) => {
      return {
        goodsReceiptsId: createdGoodsReceiptsResult.id,
        productId: _product.productId,
        qty: _product.qty,
        actualQty: _product.actualQty,
        remark: _product.remark,
        warehouseStorageId: _product.warehouseStorageId,
        remark: _product.remark,
        createdBy: userId
      }
    })

    // create product in goodsReceipts
    const createdGoodsReceiptsProductResult = await entity.GoodsReceiptProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdGoodsReceiptsProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบนำเข้าสินค้าล้มเหลว' })
    }
    for (const product of createdGoodsReceiptsProductResult) {
      GoodsReceiptsProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบนำเข้าสินค้า', false, {}, product.dataValues)
      )
    }

    // // log user activity goods receipts
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, createdGoodsReceiptsResult.id, 'create', 'สร้างข้อมูลใบนำเข้าสินค้า', false, {}, queryBodyGoodsReceipts),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(GoodsReceiptsProductUserActivityBody, { transaction })

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'สร้างข้อมูลใบนำเข้าสินค้าสำเร็จ', body: { id: createdGoodsReceiptsResult.id } })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateGoodsReceipts = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateGRValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.goodsReceiptsId

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

    let changedDocumentStatusActivity = null
    if (body.documentStatusId !== record.documentStatusId) {
      // check is document status exists
      const recordDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: record.documentStatusId } })
      if (!recordDocumentStatus) {
        transaction.rollback()
        return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่เลือก' })
      }

      // check target document status exists
      const targetDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: body.documentStatusId } })
      if (!targetDocumentStatus) {
        transaction.rollback()
        return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่ต้องการเปลี่ยน' })
      }

      if (!recordDocumentStatus.next || recordDocumentStatus.next.length <= 0 || !recordDocumentStatus.next.includes(targetDocumentStatus.code)) {
        transaction.rollback()
        return res.json({ isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบรับเข้าสินค้าได้' })
      }

      changedDocumentStatusActivity = utils.GenerateUserActivity(
        userId,
        serviceName,
        targetId,
        'update',
        'แก้ไขสถานะเอกสารใบรับเข้าสินค้า',
        true,
        record,
        updatedResult[1][0]
      )
    }

    // update goods receipts
    // filter allow key
    const queryBodyGoodsReceipts = {}
    Object.keys(body).map((key) => (createOrUpdateGRValidator[key] ? (queryBodyGoodsReceipts[key] = body[key]) : null))
    queryBodyGoodsReceipts.updatedBy = userId
    queryBodyGoodsReceipts.updatedAt = new Date()
    const updatedGoodsReceiptsResult = await entity.GoodsReceipt.update(queryBodyGoodsReceipts, {
      where: { id: targetId },
      transaction: transaction,
      returning: true
    })
    if (!updatedGoodsReceiptsResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'แก้ไขข้อมูลใบนำเข้าสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Goods Receipts Product
    // ==============================================================================
    let GoodsReceiptsProductUserActivityBody = []

    // ----------------- delete goods receipts product -----------------
    // ----------------- delete goods receipts product -----------------
    // validate delete goods receipts product
    for (const product of body.deleteGoodsReceiptsProduct) {
      const validateProduct = validation(product, { id: 'required|integer' })
      if (!validateProduct.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(deleteGoodsReceiptsProduct) : ` + validateProduct.message })
      }
    }
    const preDeletedRecord = await entity.GoodsReceiptProduct.findAll({
      where: { goodsReceiptsId: targetId, id: { [Op.in]: body.deleteGoodsReceiptsProduct.map((item) => item.id) } }
    })
    await entity.GoodsReceiptProduct.destroy({
      where: { goodsReceiptsId: targetId, id: { [Op.in]: body.deleteGoodsReceiptsProduct.map((item) => item.id) } },
      transaction: transaction
    })
    for (const product of body.deleteGoodsReceiptsProduct) {
      const preRecord = preDeletedRecord.find((item) => item.id === product.id)
      if (preRecord) {
        GoodsReceiptsProductUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, product.id, 'delete', 'ลบรายการสินค้าภายในใบนำเข้าสินค้า', false, preRecord, {})
        )
      }
    }

    // ----------------- create goods receipts product -----------------
    // ----------------- create goods receipts product -----------------
    // validate create goods receipts product
    for (const product of body.createGoodsReceiptsProduct) {
      product.goodsReceiptsId = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(CreateGoodsReceiptsProduct) : ` + validateResult.message })
      }
    }

    // create product in goodsReceipts
    const productsQueryBody = body.createGoodsReceiptsProduct.map((_product) => {
      return {
        goodsReceiptsId: targetId,
        productId: _product.productId,
        warehouseStorageId: _product.warehouseStorageId,
        qty: _product.qty,
        actualQty: _product.actualQty,
        remark: _product.remark,
        createdBy: userId
      }
    })

    const createdGoodsReceiptsProductResult = await entity.GoodsReceiptProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdGoodsReceiptsProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบนำเข้าสินค้าล้มเหลว' })
    }
    for (const product of createdGoodsReceiptsProductResult) {
      GoodsReceiptsProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบนำเข้าสินค้า', false, {}, product.dataValues)
      )
    }

    // ----------------- update goods receipts product -----------------
    // ----------------- update goods receipts product -----------------
    // validate update goods receipts product
    for (const product of body.updateGoodsReceiptsProduct) {
      product.goodsReceiptsId = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(UpdateGoodsReceiptsProduct) : ` + validateResult.message })
      }
    }

    // update product in goodsReceipts
    for (const product of body.updateGoodsReceiptsProduct) {
      const productQueryBody = {
        goodsReceiptsId: targetId,
        productId: product.productId,
        warehouseStorageId: product.warehouseStorageId,
        qty: product.qty,
        actualQty: product.actualQty,
        remark: product.remark,
        updatedBy: userId,
        updatedAt: new Date()
      }
      const record = await entity.GoodsReceiptProduct.findOne({ where: { id: product.id, goodsReceiptsId: targetId } })
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

      GoodsReceiptsProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'update', 'แก้ไขรายการสินค้าภายในใบรับเข้าสินค้า', true, record, updatedProductResult[1][0])
      )
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขข้อมูลใบรับเข้าสินค้า', true, record, updatedGoodsReceiptsResult[1][0]),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(GoodsReceiptsProductUserActivityBody, { transaction })
    if (changedDocumentStatusActivity) {
      await entity.LogsUserActivity.create(changedDocumentStatusActivity, { transaction })
    }

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'แก้ไขข้อมูลใบนำเข้าสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateGoodsReceiptsDocumentStatus = async (req, res) => {
  try {
    const body = req.body
    // validate input
    const validate = validation(body, { documentStatusId: 'required|integer' })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.goodsReceiptsId

    // check is record exists
    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId } })
    if (!record) {
      return res.json({ isError: true, message: 'ไม่พบข้อมูลใบรับเข้าสินค้าที่ต้องการแก้ไขสถานะ' })
    }

    // check is document status exists
    const recordDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: record.documentStatusId } })
    if (!recordDocumentStatus) {
      return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่เลือก' })
    }

    // check target document status exists
    const targetDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: body.documentStatusId } })
    if (!targetDocumentStatus) {
      return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่ต้องการเปลี่ยน' })
    }

    if (!recordDocumentStatus.next || recordDocumentStatus.next.length <= 0 || !recordDocumentStatus.next.includes(targetDocumentStatus.code)) {
      return res.json({ isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบรับเข้าสินค้าได้' })
    }

    // update goods receipts document status
    const updatedResult = await entity.GoodsReceipt.update({ documentStatusId: body.documentStatusId }, { where: { id: targetId }, returning: true })
    if (!updatedResult) {
      return res.json({ isError: true, message: 'แก้ไขสถานะเอกสารใบรับเข้าสินค้าล้มเหลว' })
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขสถานะเอกสารใบรับเข้าสินค้า', true, record, updatedResult[1][0])
    )

    return res.json({ isError: false, message: 'แก้ไขสถานะเอกสารใบรับเข้าสินค้าสำเร็จ' })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.DeleteGoodsReceipts = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const targetId = req.params.goodsReceiptsId
    const userId = req.user.id

    // check is target record exists
    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลนำเข้าสินค้าที่ต้องการลบ' })
    }

    // delete goods receipts products
    let goodsReceiptsProductsUserActivityBody = []
    const preDeletedRecord = await entity.GoodsReceiptProduct.findAll({ where: { goodsReceiptsId: targetId } })
    await entity.GoodsReceiptProduct.destroy({ where: { goodsReceiptsId: targetId }, transaction: transaction })
    for (const deletedRecord of preDeletedRecord) {
      const preRecord = preDeletedRecord.find((item) => item.id === deletedRecord.id)
      if (preRecord) {
        goodsReceiptsProductsUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, deletedRecord.id, 'delete', 'ลบข้อมูลสินค้าในใบนำเข้าสินค้า', false, preRecord, {})
        )
      }
    }

    // delete goods receipts
    await entity.GoodsReceipt.destroy({ where: { id: targetId }, transaction: transaction })

    // // log user activity
    await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'delete', 'ลบข้อมูลใบนำเข้าสินค้า', false, record, {}), {
      transaction
    })
    await entity.LogsUserActivity.bulkCreate(goodsReceiptsProductsUserActivityBody, { transaction })

    transaction.commit()
    return res.json({ isError: false, message: 'ลบข้อมูลใบนำเข้าสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
