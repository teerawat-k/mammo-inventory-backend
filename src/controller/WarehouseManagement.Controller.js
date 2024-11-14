'use strict'

const entity = require('../entity')
const { logger, validation, utils } = require('../utils')
const { Op } = require('sequelize')
const serviceName = 'invwh'

const createOrUpdateWarehouseValidator = {
  isHeadquarter: 'boolean',
  code: 'required|string',
  name: 'required|string',
  tel: 'string',
  email: 'email',
  address: 'string',
  googleMap: 'string',
  createWarehouseStorage: 'array',
  updateWarehouseStorage: 'array',
  deleteWarehouseStorage: 'array'
}

const createOrUpdateWarehouseStorageValidator = {
  id: 'integer',
  warehouseId: 'required|integer',
  code: 'required|string',
  name: 'required|string',
  description: 'string'
}

module.exports.Search = async (req, res) => {
  try {
    // validate input
    const validate = validation(req.query, {
      pageNo: 'required|integer',
      pageSize: 'required|integer',
      ordering: 'string',
      code: 'string',
      name: 'string'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    // where and ordering
    const body = req.query
    const displayColumn = ['id', 'isHeadquarter', 'code', 'name', 'tel', 'email', 'address', 'googleMap']
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })

    const result = await entity.Warehouse.findAndCountAll({
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
    // validate input
    const validate = validation(req.params, {
      warehouseId: 'required|integer'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const targetId = req.params.warehouseId
    const displayColumn = ['id', 'code', 'name', 'tel', 'email', 'address', 'googleMap']

    const result = await entity.Warehouse.findOne({
      attributes: displayColumn,
      where: { id: targetId }
    })

    if (!result) return res.json({ isError: true, message: `ไม่พบข้อมูลโกดัง` })
    return res.json({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.SearchStorage = async (req, res) => {
  try {
    // validate input
    const validate = validation(req.params, {
      warehouseId: 'required|integer'
    })
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const targetId = req.params.warehouseId
    const displayColumn = ['id', 'warehouseId', 'code', 'name', 'description']
    const result = await entity.WarehouseStorage.findAndCountAll({
      attributes: displayColumn,
      where: { warehouseId: targetId },
      order: [['id', 'DESC']]
    })

    return res.json({ isError: false, totalRow: result.count, body: result.rows })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.CreateWarehouse = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateWarehouseValidator)
    if (!validate.status) return res.json({ isError: true, message: validate.message })

    const userId = req.user.id

    // ==============================================================================
    //                                  Warehouse
    // ==============================================================================
    // check exists warehouse code
    const warehouseCodeExists = await entity.Warehouse.findOne({ where: { code: body.code } })
    if (warehouseCodeExists) {
      transaction.rollback()
      return res.json({ isError: true, message: `รหัสโกดัง ${body.code} มีอยู่อยู่ในระบบแล้ว` })
    }

    // filter allow key
    const queryBodyWarehouse = {}
    Object.keys(body).map((key) => (createOrUpdateWarehouseValidator[key] ? (queryBodyWarehouse[key] = body[key]) : null))
    queryBodyWarehouse.createdBy = userId
    queryBodyWarehouse.createdAt = new Date()
    const createdWarehouseResult = await entity.Warehouse.create(queryBodyWarehouse, { transaction })
    if (!createdWarehouseResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างข้อมูลโกดังล้มเหลว' })
    }

    for (const storage of body.createWarehouseStorage) {
      storage.warehouseId = createdWarehouseResult.id
    }

    // ==============================================================================
    //                                 Warehouse Storage
    // ==============================================================================
    let warehouseStorageUserActivityBody = []

    // validate createWarehouseStorage
    for (const storage of body.createWarehouseStorage) {
      const validateStorage = validation(storage, createOrUpdateWarehouseStorageValidator)
      if (!validateStorage.status) return res.json({ isError: true, message: `(createWarehouseStorage) : ` + validateStorage.message })
    }

    // add warehouseId and createdBy to warehouse storage body
    const warehouseStorageQueryBody = body.createWarehouseStorage.map((storage) => {
      return {
        warehouseId: createdWarehouseResult.id,
        code: storage.code,
        name: storage.name,
        description: storage.description,
        createdBy: userId
      }
    })

    // create warehouse storage
    const createdWarehouseStorageResult = await entity.WarehouseStorage.bulkCreate(warehouseStorageQueryBody, { transaction })
    if (!createdWarehouseStorageResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างจุดเก็บภายในโกดังล้มเหลว' })
    }
    for (const storage of createdWarehouseStorageResult) {
      warehouseStorageUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, storage.id, 'create', 'สร้างข้อมูลจุดเก็บภายในโกดัง', false, {}, storage.dataValues)
      )
    }

    // log user activity warehouse
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, createdWarehouseResult.id, 'create', 'สร้างข้อมูลโกดัง', false, {}, queryBodyWarehouse),
      { transaction }
    )
    await entity.LogsUserActivity.bulkCreate(warehouseStorageUserActivityBody, { transaction })

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'สร้างโกดังสำเร็จ', body: { id: createdWarehouseResult.id } })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.UpdateWarehouse = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const body = req.body

    // validate input
    const validate = validation(body, createOrUpdateWarehouseValidator)
    if (!validate.status) {
      transaction.rollback()
      return res.json({ isError: true, message: validate.message })
    }

    const userId = req.user.id
    const targetId = req.params.warehouseId

    // ==============================================================================
    //                                  Warehouse
    // ==============================================================================

    // check exists warehouse record
    const record = await entity.Warehouse.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: `ไม่พบข้อมูลโกดังที่ต้องการแก้ไข` })
    }

    // check exists warehouse code (expect current record)
    const warehouseCodeExists = await entity.Warehouse.findOne({ where: { id: { [Op.ne]: targetId }, code: body.code } })
    if (warehouseCodeExists) {
      transaction.rollback()
      return res.json({ isError: true, message: `รหัสโกดัง ${body.code} มีอยู่อยู่ในระบบแล้ว` })
    }

    // filter allow key
    const queryBodyWarehouse = {}
    Object.keys(body).map((key) => (createOrUpdateWarehouseValidator[key] ? (queryBodyWarehouse[key] = body[key]) : null))
    queryBodyWarehouse.updatedBy = userId
    queryBodyWarehouse.updatedAt = new Date()
    const updatedWarehouseResult = await entity.Warehouse.update(queryBodyWarehouse, {
      where: { id: targetId },
      transaction: transaction,
      returning: true
    })
    if (updatedWarehouseResult[0] === 0) {
      transaction.rollback()
      return res.json({ isError: true, message: 'แก้ไขข้อมูลโกดังล้มเหลว' })
    }
    // ==============================================================================
    //                                 Warehouse Storage
    // ==============================================================================
    let warehouseStorageUserActivityBody = []

    // ----------------- delete warehouse storage -----------------
    // ----------------- delete warehouse storage -----------------

    // validate deleteWarehouseStorage
    for (const storage of body.deleteWarehouseStorage) {
      const validateStorage = validation(storage, { id: 'required|integer' })
      if (!validateStorage.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(deleteWarehouseStorage) : ` + validateStorage.message })
      }
    }

    const preDeletedRecord = await entity.WarehouseStorage.findAll({
      where: { warehouseId: targetId, id: { [Op.in]: body.deleteWarehouseStorage.map((item) => item.id) } }
    })
    await entity.WarehouseStorage.destroy({
      where: { warehouseId: targetId, id: { [Op.in]: body.deleteWarehouseStorage.map((item) => item.id) } },
      transaction: transaction
    })

    for (const storage of body.deleteWarehouseStorage) {
      const preRecord = preDeletedRecord.find((item) => item.id === storage.id)
      if (preRecord) {
        warehouseStorageUserActivityBody.push(utils.GenerateUserActivity(userId, serviceName, storage.id, 'delete', 'ลบข้อมูลจุดเก็บภายในโกดัง', false, preRecord, {}))
      }
    }

    // ----------------- create warehouse storage -----------------
    // ----------------- create warehouse storage -----------------

    // validate createWarehouseStorage
    for (const storage of body.createWarehouseStorage) {
      storage.warehouseId = targetId
      const validateStorage = validation(storage, createOrUpdateWarehouseStorageValidator)
      if (!validateStorage.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(createWarehouseStorage) : ` + validateStorage.message })
      }
    }

    // create new warehouse storage
    const warehouseStorageQueryBody = body.createWarehouseStorage.map((storage) => {
      return {
        warehouseId: targetId,
        code: storage.code,
        name: storage.name,
        description: storage.description,
        createdBy: userId
      }
    })
    const createdWarehouseStorageResult = await entity.WarehouseStorage.bulkCreate(warehouseStorageQueryBody, {
      transaction: transaction
    })
    if (!createdWarehouseStorageResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'สร้างจุดเก็บภายในโกดังล้มเหลว' })
    }
    for (const storage of createdWarehouseStorageResult) {
      warehouseStorageUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, storage.id, 'create', 'สร้างข้อมูลจุดเก็บภายในโกดัง', false, {}, storage.dataValues)
      )
    }

    // ----------------- update warehouse storage -----------------
    // ----------------- update warehouse storage -----------------

    // validate updateWarehouseStorage
    for (const storage of body.updateWarehouseStorage) {
      storage.warehouseId = targetId
      const validateStorage = validation(storage, createOrUpdateWarehouseStorageValidator)
      if (!validateStorage.status) {
        transaction.rollback()
        return res.json({ isError: true, message: `(updateWarehouseStorage) : ` + validateStorage.message })
      }
    }

    // update warehouse storage to database
    for (const storage of body.updateWarehouseStorage) {
      const warehouseStorageQueryBody = {
        warehouseId: targetId,
        code: storage.code,
        name: storage.name,
        description: storage.description,
        updatedBy: userId,
        updatedAt: new Date()
      }

      const record = await entity.WarehouseStorage.findOne({ where: { id: storage.id, warehouseId: targetId } })
      if (!record) {
        transaction.rollback()
        return res.json({ isError: true, message: `ไม่พบข้อมูลจุดเก็บภายในโกดังรหัส ${storage.code}` })
      }
      const updatedStorageResult = await entity.WarehouseStorage.update(warehouseStorageQueryBody, {
        where: { id: storage.id },
        transaction: transaction,
        returning: true
      })

      if (updatedStorageResult[0] === 0) {
        transaction.rollback()
        return res.json({ isError: true, message: `แก้ไขข้อมูลจุดเก็บภายในโกดังรหัส ${storage.code} ล้มเหลว` })
      }

      warehouseStorageUserActivityBody.push(
        utils.GenerateUserActivity(userId, serviceName, storage.id, 'update', 'แก้ไขข้อมูลจุดเก็บภายในโกดัง', true, record, updatedStorageResult[1][0])
      )
    }

    // log user activity
    await entity.LogsUserActivity.create(
      utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'แก้ไขข้อมูลโกดัง', true, record, updatedWarehouseResult[1][0]),
      { transaction }
    )

    await entity.LogsUserActivity.bulkCreate(warehouseStorageUserActivityBody, { transaction })

    // commit transaction
    await transaction.commit()
    return res.json({ isError: false, message: 'แก้ไขข้อมูลโกดังสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.MakeHeadquarter = async (req, res) => {
  const transaction = await entity.seq.transaction()
  const targetId = req.params.warehouseId
  try {
    // check exists warehouse record
    const record = await entity.Warehouse.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลโกดังที่ต้องการตั้งเป็นสำนักงานใหญ่' })
    }

    // update other warehouse isHeadquarter to false
    const updatedOtherWarehouseResult = await entity.Warehouse.update(
      { isHeadquarter: false },
      { where: { id: { [Op.ne]: targetId }, isHeadquarter: true }, transaction: transaction }
    )
    if (!updatedOtherWarehouseResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ตั้งค่าโกดังสำนักงานใหญ่ล้มเหลว(1)' })
    }

    // update warehouse isHeadquarter
    const updatedWarehouseResult = await entity.Warehouse.update(
      { isHeadquarter: true, updatedBy: updatedBy, updatedAt: new Date() },
      { where: { id: targetId }, transaction: transaction }
    )
    if (!updatedWarehouseResult) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ตั้งค่าโกดังสำนักงานใหญ่ล้มเหลว(2)' })
    }

    // log user activity
    await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'update', 'ตั้งค่าโกดังสำนักงานใหญ่', false, {}, {}))

    transaction.commit()
    return res.json({ isError: false, message: `ตั้งค่าโกดังสำนักงานใหญ่สำเร็จ` })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.DeleteWarehouse = async (req, res) => {
  const transaction = await entity.seq.transaction()
  try {
    const targetId = req.params.warehouseId
    const userId = req.user.id
    // check is warehouse exists
    const record = await entity.Warehouse.findOne({ where: { id: targetId } })
    if (!record) {
      transaction.rollback()
      return res.json({ isError: true, message: 'ไม่พบข้อมูลโกดังที่ต้องการลบ' })
    }

    // delete warehouse storage
    let warehouseStorageUserActivityBody = []
    const preDeletedRecord = await entity.WarehouseStorage.findAll({ where: { warehouseId: targetId } })
    await entity.WarehouseStorage.destroy({ where: { warehouseId: targetId }, transaction: transaction })
    for (const storage of preDeletedRecord) {
      const preRecord = preDeletedRecord.find((item) => item.id === storage.id)
      if (preRecord) {
        warehouseStorageUserActivityBody.push(utils.GenerateUserActivity(userId, serviceName, storage.id, 'delete', 'ลบข้อมูลจุดเก็บภายในโกดัง', false, preRecord, {}))
      }
    }

    // delete warehouse
    await entity.Warehouse.destroy({ where: { id: targetId }, transaction: transaction })

    // // log user activity
    await entity.LogsUserActivity.create(utils.GenerateUserActivity(userId, serviceName, targetId, 'delete', 'ลบข้อมูลโกดัง', false, record, {}), {
      transaction
    })
    await entity.LogsUserActivity.bulkCreate(warehouseStorageUserActivityBody, { transaction })

    transaction.commit()
    return res.json({ isError: false, message: 'ลบข้อมูลโกดังสำเร็จ' })
  } catch (error) {
    transaction.rollback()
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
