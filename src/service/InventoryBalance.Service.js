const { Sequelize } = require('sequelize')
const entity = require('../entity')

module.exports.IncreaseProductBalance = async (data, userId, transaction) => {
  if (!transaction) {
    throw '[IncreaseProductBalance] transaction is required'
  }

  try {
    let inventoryPayload = []
    // sum duplicate product and warehouseStorageId
    for (record of data) {
      const { productId, warehouseStorageId, qty } = record
      if (!warehouseStorageId) {
        return { isError: true, message: 'ไม่พบข้อมูลจุดเก็บสินค้า' }
      }
      const payload = inventoryPayload.find((x) => x.productId === productId && x.warehouseStorageId === warehouseStorageId)
      if (payload) {
        payload.qty += qty
      } else {
        inventoryPayload.push({ productId, warehouseStorageId, qty, refNumber: record.refNumber, remark: record.remark })
      }
    }

    for (record of inventoryPayload) {
      const { productId, warehouseStorageId } = record
      const _record = await entity.InventoryBalance.findOne({ attributes: ['qty'], where: { productId: productId, warehouseStorageId: warehouseStorageId } })
      record.isExists = _record ? true : false
      record.balanceQty = _record ? _record.qty + record.qty : record.qty
    }

    for (record of inventoryPayload) {
      if (record.isExists) {
        const result = await entity.InventoryBalance.update(
          { qty: Sequelize.literal(`qty + ${record.qty}`), updatedAt: Sequelize.literal('CURRENT_TIMESTAMP') },
          {
            where: { productId: record.productId, warehouseStorageId: record.warehouseStorageId },
            transaction: transaction,
            returning: true
          }
        )
        if (result[0] === 0) return { isError: true, message: 'เพิ่มจำนวนคงคลังสินค้าล้มเหลว' }
      } else {
        const result = await entity.InventoryBalance.create(
          {
            warehouseStorageId: record.warehouseStorageId,
            productId: record.productId,
            qty: record.balanceQty
          },
          { transaction: transaction }
        )
        if (!result) return { isError: true, message: 'เพิ่มจำนวนคงคลังสินค้าล้มเหลว' }
      }
    }

    const transactionPayload = inventoryPayload.map((record) => {
      return {
        type: 'IN',
        refNumber: record.refNumber,
        productId: record.productId,
        warehouseStorageId: record.warehouseStorageId,
        qty: record.qty,
        balanceQty: record.balanceQty,
        remark: record.remark,
        createdBy: userId
      }
    })
    await entity.InventoryBalanceTransaction.bulkCreate(transactionPayload, { transaction: transaction })

    return { isError: false }
  } catch (error) {
    throw error
  }
}

module.exports.DecreaseProductBalance = async (data, userId, transaction) => {
  if (!transaction) {
    throw '[DecreaseProductBalance] transaction is required'
  }

  try {
    let inventoryPayload = []
    // sum duplicate product and warehouseStorageId
    for (record of data) {
      const { productId, warehouseStorageId, qty } = record
      if (!warehouseStorageId) {
        return { isError: true, message: 'ไม่พบข้อมูลจุดเก็บสินค้า' }
      }
      const payload = inventoryPayload.find((x) => x.productId === productId && x.warehouseStorageId === warehouseStorageId)
      if (payload) {
        payload.qty += qty
      } else {
        inventoryPayload.push({ productId, warehouseStorageId, qty, refNumber: record.refNumber, remark: record.remark })
      }
    }

    for (record of inventoryPayload) {
      const { productId, warehouseStorageId } = record
      const _record = await entity.InventoryBalance.findOne({ attributes: ['qty'], where: { productId: productId, warehouseStorageId: warehouseStorageId } })
      record.isExists = _record ? true : false
      record.balanceQty = _record ? _record.qty - record.qty : -record.qty
    }

    for (record of inventoryPayload) {
      if (record.isExists) {
        const result = await entity.InventoryBalance.update(
          { qty: Sequelize.literal(`qty - ${record.qty}`), updatedAt: Sequelize.literal('CURRENT_TIMESTAMP') },
          {
            where: { productId: record.productId, warehouseStorageId: record.warehouseStorageId },
            transaction: transaction,
            returning: true
          }
        )
        if (result[0] === 0) return { isError: true, message: 'ลดจำนวนคงคลังสินค้าล้มเหลว' }
      } else {
        const result = await entity.InventoryBalance.create(
          {
            warehouseStorageId: record.warehouseStorageId,
            productId: record.productId,
            qty: record.balanceQty
          },
          { transaction: transaction }
        )
        if (!result) return { isError: true, message: 'ลดจำนวนคงคลังสินค้าล้มเหลว' }
      }
    }

    const transactionPayload = inventoryPayload.map((record) => {
      return {
        type: 'OUT',
        refNumber: record.refNumber,
        productId: record.productId,
        warehouseStorageId: record.warehouseStorageId,
        qty: record.qty,
        balanceQty: record.balanceQty,
        remark: record.remark,
        createdBy: userId
      }
    })
    await entity.InventoryBalanceTransaction.bulkCreate(transactionPayload, { transaction: transaction })

    return { isError: false }
  } catch (error) {
    throw error
  }
}
