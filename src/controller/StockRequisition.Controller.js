const entity = require('../entity')
const { logger, validation, utils, axios } = require('../utils')
const { Op, Sequelize, where } = require('sequelize')
const serviceName = 'invsr'

const createOrUpdateSRValidator = {
  documentStatusId: 'integer',
  stockRequisitionTypeId: 'integer',
  refNumber: 'string',
  documentDate: 'date',
  createdStaffId: 'integer',
  requestStaffId: 'required|integer',
  approverStaffId: 'integer',
  approverDate: 'date',
  prepareStaffId: 'integer',
  prepareDate: 'date',
  deliveryStaffId: 'integer',
  deliveryDate: 'date',
  remark: 'string'
}

const createOrUpdateProductValidator = {
  id: 'integer',
  stockRequisitionId: 'required|integer',
  productId: 'required|integer',
  qty: 'required|integer',
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
      srNumber: 'string'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    // where and ordering
    const body = req.query
    const displayColumn = [
      'id',
      'srNumber',
      'documentStatusId',
      'documentStatusName',
      'deliveryDate',
      'stockRequisitionTypeId',
      'stockRequisitionTypeName',
      'requestStaffId',
      'requestStaffEmployeeNo',
      'requestStaffDisplayName',
      'requestStaffFirstNameTH',
      'requestStaffLastNameTH',
      'requestStaffFirstNameEN',
      'requestStaffLastNameEN',
      'documentDate'
    ]
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })

    const result = await entity.ViewStockRequisition.findAndCountAll({
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
      stockRequisitionId: 'required|integer'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const targetId = req.params.stockRequisitionId
    const displayColumn = [
      'id',
      'srNumber',
      'documentStatusId',
      'documentStatusName',
      'documentDate',
      'stockRequisitionTypeId',
      'stockRequisitionTypeName',
      'createdBy',
      'requestStaffId',
      'requestStaffEmployeeNo',
      'requestStaffDisplayName',
      'requestStaffFirstNameTH',
      'requestStaffLastNameTH',
      'requestStaffFirstNameEN',
      'requestStaffLastNameEN',
      'approverStaffId',
      'approverStaffEmployeeNo',
      'approverStaffDisplayName',
      'approverStaffFirstNameTH',
      'approverStaffLastNameTH',
      'approverStaffFirstNameEN',
      'approverStaffLastNameEN',
      'approverDate',
      'prepareStaffId',
      'prepareStaffEmpNo',
      'prepareStaffDisplayName',
      'prepareStaffFirstNameTH',
      'prepareStaffLastNameTH',
      'prepareStaffFirstNameEN',
      'prepareStaffLastNameEN',
      'prepareDate',
      'deliveryStaffId',
      'deliveryStaffEmpNo',
      'deliveryStaffDisplayName',
      'deliveryStaffFirstNameTH',
      'deliveryStaffLastNameTH',
      'deliveryStaffFirstNameEN',
      'deliveryStaffLastNameEN',
      'deliveryDate',
      'refNumber',
      'remark'
    ]

    const result = await entity.ViewStockRequisition.findOne({
      attributes: displayColumn,
      where: { id: targetId }
    })
    if (!result) return res.json({ isError: true, message: `ไม่พบข้อมูลใบเบิกสินค้า` })

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
    const targetId = req.params.stockRequisitionId
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
      'remark'
    ]

    // check record exists
    const record = await entity.StockRequisition.findOne({ where: { id: targetId } })
    if (!record) return res.json({ isError: true, message: 'ไม่พบข้อมูลใบเบิกสินค้าที่ต้องการดูรายการสินค้า' })

    const result = await entity.ViewStockRequisitionProduct.findAll({
      attributes: displayColumn,
      where: { stockRequisitionId: targetId },
      order: [['id', 'DESC']]
    })

    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.CreateStockRequisition = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateSRValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id

    // ==============================================================================
    //                                  STOCK REQUISITION
    // ==============================================================================

    // check stockRequisitionType record exists
    if (body.stockRequisitionTypeId) {
      const recordStockRequisitionTypeId = await entity.StockRequisitionType.findOne({ where: { id: body.stockRequisitionTypeId } })
      if (!recordStockRequisitionTypeId) return res.json({ isError: true, message: 'ไม่พบข้อมูลประเภทการเบิกสินค้า' })
    }

    if (body.createdStaffId) {
      const recordCreatedStaffId = await entity.Employee.findOne({ where: { id: body.createdStaffId } })
      if (!recordCreatedStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (สร้างเอกสาร)' })
    }

    const recordRequestStaffId = await entity.Employee.findOne({ where: { id: body.requestStaffId } })
    if (!recordRequestStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (ผู้ร้องขอ)' })

    if (body.approverStaffId) {
      const recordApproverStaffId = await entity.Employee.findOne({ where: { id: body.approverStaffId } })
      if (!recordApproverStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าที่อนุมัติ)' })
    }

    if (body.prepareStaffId) {
      const recordPrepareStaffId = await entity.Employee.findOne({ where: { id: body.prepareStaffId } })
      if (!recordPrepareStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าที่จัดเตรียม)' })
    }

    if (body.deliveryStaffId) {
      const recordDeliveryStaffId = await entity.Employee.findOne({ where: { id: body.deliveryStaffId } })
      if (!recordDeliveryStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าทส่งมอบ)' })
    }

    const codePattern = await axios.GET(req, '/api/company/master/code-pattern', {})
    if (!codePattern | !codePattern.stockRequisitionNo) {
      return res.json({ isError: true, message: 'ไม่พบรูปแบบรหัสเอกสารเบิก' })
    }

    const noPattern = codePattern.stockRequisitionNo
    const numberLength = noPattern.numberLength
    let pattern = noPattern.pattern
      .replace(/{service}/g, 'SR')
      .replace(/{year}/g, new Date().getFullYear())
      .replace(/{month}/g, new Date().getMonth() + 1 < 10 ? '0' + (new Date().getMonth() + 1) : new Date().getMonth() + 1)
      .replace(/{day}/g, new Date().getDate() < 10 ? '0' + new Date().getDate() : new Date().getDate())
      .replace(/{timestamp}/g, new Date().getTime())

    const latestStockRequisition = await entity.StockRequisition.findOne({
      attributes: ['srNumber'],
      where: {
        srNumber: {
          [Op.and]: [{ [Op.like]: pattern + '%' }, where(Sequelize.fn('LENGTH', Sequelize.col('srNumber')), pattern.length + numberLength)]
        }
      },
      order: [['id', 'DESC']]
    })

    let nextSrNumber = null
    if (latestStockRequisition) {
      const runningNumber = parseInt(latestStockRequisition.srNumber.slice(-numberLength)) + 1
      nextSrNumber = pattern + runningNumber.toString().padStart(numberLength, '0')
    } else {
      nextSrNumber = pattern + '1'.padStart(numberLength, '0')
    }

    // create stock requisition
    body.createdStaffId = body.createdStaffId ? body.createdStaffId : userId
    body.documentDate = body.documentDate ? body.documentDate : new Date()
    // find jsonb document status in jsonb array
    const documentStatus = await entity.DocumentStatus.findOne({
      where: { exten: { [Op.contains]: ['sr_default'] }, service: 'invsr', module: 'inventory.module' }
    })
    if (!documentStatus) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารเบิกสินค้าที่ถูกตั้งเป็นค่าเริ่มต้น' })
    }

    // filter allow key
    const queryBodyStockRequisition = {}
    Object.keys(body).map((key) => (createOrUpdateSRValidator[key] ? (queryBodyStockRequisition[key] = body[key]) : null))
    queryBodyStockRequisition.documentStatusId = documentStatus.id
    queryBodyStockRequisition.srNumber = nextSrNumber
    queryBodyStockRequisition.createdBy = userId
    queryBodyStockRequisition.createdAt = new Date()
    const createdStockRequisitionResult = await entity.StockRequisition.create(queryBodyStockRequisition, { transaction })
    if (!createdStockRequisitionResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างข้อมูลใบเบิกสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Stock Requisition Product
    // ==============================================================================
    let StockRequisitionProductUserActivityBody = []
    for (const product of body.createStockRequisitionProduct) {
      product.stockRequisitionId = createdStockRequisitionResult.id
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) return res.json({ isError: true, message: `(CreateStockRequisitionProduct) : ` + validateResult.message })
    }

    // add stockRequisitionId and createdBy to stockRequisition storage body
    const productsQueryBody = body.createStockRequisitionProduct.map((_product) => {
      return {
        stockRequisitionId: createdStockRequisitionResult.id,
        productId: _product.productId,
        qty: _product.qty,
        remark: _product.remark,
        warehouseStorageId: _product.warehouseStorageId,
        remark: _product.remark,
        createdBy: userId
      }
    })

    // create product in stockRequisition
    const createdStockRequisitionProductResult = await entity.StockRequisitionProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdStockRequisitionProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบเบิกสินค้าล้มเหลว' })
    }
    for (const product of createdStockRequisitionProductResult) {
      StockRequisitionProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบเบิกสินค้า', false, {}, product.dataValues)
      )
    }

    //log user activity stock requisition
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, createdStockRequisitionResult.id, 'create', 'สร้างข้อมูลใบเบิกสินค้า', false, {}, queryBodyStockRequisition),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(StockRequisitionProductUserActivityBody, { transaction })
    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'สร้างข้อมูลใบเบิกสินค้าสำเร็จ', body: { id: createdStockRequisitionResult.id } })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateStockRequisition = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateSRValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.stockRequisitionId

    // ==============================================================================
    //                                  Stock Requisition
    // ==============================================================================

    // check exists stock requisition record
    const record = await entity.StockRequisition.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: `ไม่พบข้อมูลใบเบิกสินค้าที่ต้องการแก้ไข` })
    }

    // check stockRequisitionType record exists
    if (body.stockRequisitionTypeId) {
      const recordStockRequisitionTypeId = await entity.StockRequisitionType.findOne({ where: { id: body.stockRequisitionTypeId } })
      if (!recordStockRequisitionTypeId) return res.json({ isError: true, message: 'ไม่พบข้อมูลประเภทการเบิกสินค้า' })
    }

    if (body.createdStaffId) {
      const recordCreatedStaffId = await entity.Employee.findOne({ where: { id: body.createdStaffId } })
      if (!recordCreatedStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (สร้างเอกสาร)' })
    }

    const recordRequestStaffId = await entity.Employee.findOne({ where: { id: body.requestStaffId } })
    if (!recordRequestStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (ผู้ร้องขอ)' })

    if (body.approverStaffId) {
      const recordApproverStaffId = await entity.Employee.findOne({ where: { id: body.approverStaffId } })
      if (!recordApproverStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าที่อนุมัติ)' })
    }

    if (body.prepareStaffId) {
      const recordPrepareStaffId = await entity.Employee.findOne({ where: { id: body.prepareStaffId } })
      if (!recordPrepareStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าที่จัดเตรียม)' })
    }

    if (body.deliveryStaffId) {
      const recordDeliveryStaffId = await entity.Employee.findOne({ where: { id: body.deliveryStaffId } })
      if (!recordDeliveryStaffId) return res.json({ isError: true, message: 'ไม่พบข้อมูลพนักงาน (เจ้าหน้าทส่งมอบ)' })
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
        return res.json({ isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบเบิกสินค้าได้' })
      }

      changedDocumentStatusActivity = utils.GenerateUserActivity(
        userId,
        serviceName,
        targetId,
        'update',
        'แก้ไขสถานะเอกสารใบเบิกสินค้า',
        true,
        record,
        updatedResult[1][0]
      )
    }

    // update stock requisition
    // filter allow key
    const queryBodyStockRequisition = {}
    Object.keys(body).map((key) => (createOrUpdateSRValidator[key] ? (queryBodyStockRequisition[key] = body[key]) : null))
    queryBodyStockRequisition.updatedBy = userId
    queryBodyStockRequisition.updatedAt = new Date()
    const updatedStockRequisitionResult = await entity.StockRequisition.update(queryBodyStockRequisition, {
      where: { id: targetId },
      transaction: transaction,
      returning: true
    })
    if (!updatedStockRequisitionResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'แก้ไขข้อมูลใบเบิกสินค้าล้มเหลว' })
    }

    // ==============================================================================
    //                                 Stock Requisition Product
    // ==============================================================================
    let StockRequisitionProductUserActivityBody = []

    // ----------------- delete stock requisition product -----------------
    // ----------------- delete stock requisition product -----------------
    // validate delete stock requisition product
    for (const product of body.deleteStockRequisitionProduct) {
      const validateProduct = validation(product, { id: 'required|integer' })
      if (!validateProduct.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(deleteStockRequisitionProduct) : ` + validateProduct.message })
      }
    }
    const preDeletedRecord = await entity.StockRequisitionProduct.findAll({
      where: { stockRequisition: targetId, id: { [Op.in]: body.deleteStockRequisitionProduct.map((item) => item.id) } }
    })
    await entity.StockRequisitionProduct.destroy({
      where: { stockRequisition: targetId, id: { [Op.in]: body.deleteStockRequisitionProduct.map((item) => item.id) } },
      transaction: transaction
    })
    for (const product of body.deleteStockRequisitionProduct) {
      const preRecord = preDeletedRecord.find((item) => item.id === product.id)
      if (preRecord) {
        StockRequisitionProductUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, product.id, 'delete', 'ลบรายการสินค้าภายในใบเบิกสินค้า', false, preRecord, {})
        )
      }
    }

    // ----------------- create stock requisition product -----------------
    // ----------------- create stock requisition product -----------------
    // validate create stock requisition product
    for (const product of body.createStockRequisitionProduct) {
      product.stockRequisition = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(CreateStockRequisitionProduct) : ` + validateResult.message })
      }
    }

    // create product in stockRequisition
    const productsQueryBody = body.createStockRequisitionProduct.map((_product) => {
      return {
        stockRequisition: targetId,
        productId: _product.productId,
        warehouseStorageId: _product.warehouseStorageId,
        qty: _product.qty,
        remark: _product.remark,
        createdBy: userId
      }
    })

    const createdStockRequisitionProductResult = await entity.StockRequisitionProduct.bulkCreate(productsQueryBody, { transaction })
    if (!createdStockRequisitionProductResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างรายการสินค้าภายในใบเบิกสินค้าล้มเหลว' })
    }
    for (const product of createdStockRequisitionProductResult) {
      StockRequisitionProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'create', 'สร้างรายการสินค้าภายในใบเบิกสินค้า', false, {}, product.dataValues)
      )
    }

    // ----------------- update stock requisition product -----------------
    // ----------------- update stock requisition product -----------------
    // validate update stock requisition product
    for (const product of body.updateStockRequisitionProduct) {
      product.stockRequisition = targetId
      const validateResult = validation(product, createOrUpdateProductValidator)
      if (!validateResult.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(UpdateStockRequisitionProduct) : ` + validateResult.message })
      }
    }

    // update product in stockRequisition
    for (const product of body.updateStockRequisitionProduct) {
      const productQueryBody = {
        stockRequisition: targetId,
        productId: product.productId,
        warehouseStorageId: product.warehouseStorageId,
        qty: product.qty,
        remark: product.remark,
        updatedBy: userId,
        updatedAt: new Date()
      }
      const record = await entity.StockRequisitionProduct.findOne({ where: { id: product.id, stockRequisition: targetId } })
      if (!record) {
        transaction.rollback()
        return res.json({ isError: true, message: `ไม่พบข้อมูลรายการสินค้าภายในใบเบิกสินค้ารหัส ${product.id}` })
      }
      const updatedProductResult = await entity.StockRequisitionProduct.update(productQueryBody, {
        where: { id: product.id },
        transaction: transaction,
        returning: true
      })
      if (updatedProductResult[0] === 0) {
        transaction.rollback()
        return res.json({ isError: true, message: `แก้ไขข้อมูลรายการสินค้าภายในใบเบิกสินค้ารหัส ${product.id} ล้มเหลว` })
      }

      StockRequisitionProductUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, product.id, 'update', 'แก้ไขรายการสินค้าภายในใบเบิกสินค้า', true, record, updatedProductResult[1][0])
      )
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขข้อมูลใบเบิกสินค้า', true, record, updatedStockRequisitionResult[1][0]),
      {
        transaction
      }
    )
    await entity.LogsUserActivity.bulkCreate(StockRequisitionProductUserActivityBody, { transaction })
    if (changedDocumentStatusActivity) {
      await entity.LogsUserActivity.create(changedDocumentStatusActivity, { transaction })
    }

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'แก้ไขข้อมูลใบเบิกสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateStockRequisitionDocumentStatus = async (req, res) => {
  try {
    const body = req.body
    // validate input
    const validate = validation(body, { documentStatusId: 'required|integer' })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id
    const targetId = req.params.stockRequisitionId

    // check is record exists
    const record = await entity.StockRequisition.findOne({ where: { id: targetId } })
    if (!record) {
      return res.json({ isError: true, message: 'ไม่พบข้อมูลใบเบิกสินค้าที่ต้องการแก้ไขสถานะ' })
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
      return res.json({ isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบเบิกสินค้าได้' })
    }

    // update stock requisition document status
    const updatedResult = await entity.StockRequisition.update({ documentStatusId: body.documentStatusId }, { where: { id: targetId }, returning: true })
    if (!updatedResult) {
      return res.json({ isError: true, message: 'แก้ไขสถานะเอกสารใบเบิกสินค้าล้มเหลว' })
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขสถานะเอกสารใบเบิกสินค้า', true, record, updatedResult[1][0])
    )

    return res.json({ isError: false, message: 'แก้ไขสถานะเอกสารใบเบิกสินค้าสำเร็จ' })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.DeleteStockRequisition = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const targetId = req.params.stockRequisitionId
    const userId = req.user.id

    // check is target record exists
    const record = await entity.StockRequisition.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลเบิกสินค้าที่ต้องการลบ' })
    }

    // delete stock requisition products
    let stockRequisitionProductsUserActivityBody = []
    const preDeletedRecord = await entity.StockRequisitionProduct.findAll({ where: { stockRequisitionId: targetId } })
    await entity.StockRequisitionProduct.destroy({ where: { stockRequisitionId: targetId }, transaction: transaction })
    for (const deletedRecord of preDeletedRecord) {
      const preRecord = preDeletedRecord.find((item) => item.id === deletedRecord.id)
      if (preRecord) {
        stockRequisitionProductsUserActivityBody.push(
          utils.GenerateUserActivity(userId, serviceName, deletedRecord.id, 'delete', 'ลบข้อมูลสินค้าในใบเบิกสินค้า', false, preRecord, {})
        )
      }
    }

    // delete stock requisition
    await entity.StockRequisition.destroy({ where: { id: targetId }, transaction: transaction })

    // log user activity
    await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'delete', 'ลบข้อมูลใบเบิกสินค้า', false, record, {}), {
      transaction
    })
    await entity.LogsUserActivity.bulkCreate(stockRequisitionProductsUserActivityBody, { transaction })

    transaction.commit()
    return res.json({ isError: false, message: 'ลบข้อมูลใบเบิกสินค้าสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
