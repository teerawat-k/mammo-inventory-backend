const entity = require('../entity')
const { axios } = require('../utils')
const InventoryBalanceService = require('./InventoryBalance.Service')
const { Op, Sequelize, where } = require('sequelize')

module.exports.GenerateGRNumber = async (req) => {
  if (!req) {
    throw new Error('[GoodsReceiptService][GenerateGRNumber] Request is required')
  }

  try {
    const codePattern = await axios.GET(req, '/api/company/master/code-pattern', {})
    if (!codePattern || !codePattern.find((x) => x.name === 'goodsReceiptNo')) {
      return { isError: true, message: 'ไม่พบรูปแบบรหัสเอกสารรับเข้า' }
    }

    const goodsReceiptNoPattern = codePattern.find((x) => x.name === 'goodsReceiptNo')
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

    return { isError: false, data: nextGrNumber }
  } catch (error) {
    throw error
  }
}

module.exports.UpdateDocumentStatus = async (targetId, toDocumentStatusId, userId, transaction) => {
  if (!transaction) {
    throw '[GoodsReceiptService][UpdateDocumentStatus] transaction is required'
  }

  try {
    // check is record exists

    const record = await entity.GoodsReceipt.findOne({ where: { id: targetId, isDeleted: false } })
    if (!record) {
      return { isError: true, message: 'ไม่พบข้อมูลใบรับเข้าสินค้าที่ต้องการแก้ไขสถานะ' }
    }

    if (record.documentStatusId === toDocumentStatusId) {
      return { isError: true, message: 'สถานะเอกสารใบรับเข้าสินค้าเป็นสถานะเดียวกัน, กรุณาตรวจสอบอีกครั้ง' }
    }

    // check is document status exists
    const recordDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: record.documentStatusId } })
    if (!recordDocumentStatus) {
      return { isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่เลือก' }
    }

    // check target document status exists
    const targetDocumentStatus = await entity.DocumentStatus.findOne({ where: { id: toDocumentStatusId } })
    if (!targetDocumentStatus) {
      return { isError: true, message: 'ไม่พบข้อมูลสถานะเอกสารที่ต้องการเปลี่ยน' }
    }

    if (!recordDocumentStatus.next || recordDocumentStatus.next.length <= 0 || !recordDocumentStatus.next.includes(targetDocumentStatus.code)) {
      return { isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบรับเข้าสินค้าได้' }
    }

    if (targetDocumentStatus.exten && targetDocumentStatus.exten.includes('gr_increase_inv_balance')) {
      // add qty to inventory balance

      const products = await entity.GoodsReceiptProduct.findAll({ where: { goodsReceiptId: targetId } })
      const payload = products.map((product) => ({
        productId: product.productId,
        warehouseStorageId: product.warehouseStorageId,
        qty: product.actualQty,
        remark: 'gr_increase_inv_balance',
        refNumber: record.grNumber
      }))
      const result = await InventoryBalanceService.IncreaseProductBalance(payload, userId, transaction)
      if (result.isError) {
        return result
      }
    }

    // update goods receipts document status
    const updatedResult = await entity.GoodsReceipt.update(
      { documentStatusId: toDocumentStatusId },
      { where: { id: targetId }, returning: true, transaction: transaction }
    )
    if (updatedResult[0] === 0) {
      return { isError: true, message: 'แก้ไขสถานะเอกสารใบรับเข้าสินค้าล้มเหลว' }
    }

    return { isError: false, data: updatedResult[1][0], record: record }
  } catch (error) {
    throw error
  }
}
