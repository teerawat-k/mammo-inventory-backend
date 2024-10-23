const entity = require('../entity')
const { axios } = require('../utils')
const InventoryBalanceService = require('./InventoryBalance.Service')
const { Op, Sequelize, where } = require('sequelize')

module.exports.GenerateSRNumber = async (req) => {
  if (!req) {
    throw new Error('[StockRequisitionService][GenerateSRNumber] Request is required')
  }

  try {
    const codePattern = await axios.GET(req, '/api/company/master/code-pattern', {})
    if (!codePattern || !codePattern.find((x) => x.name === 'stockRequisitionNo')) {
      return { isError: true, message: 'ไม่พบรูปแบบรหัสเอกสารเบิกสินค้า' }
    }

    const stockRequisitionNoPattern = codePattern.find((x) => x.name === 'stockRequisitionNo')
    const numberLength = stockRequisitionNoPattern.numberLength
    let pattern = stockRequisitionNoPattern.pattern
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

    return { isError: false, data: nextSrNumber }
  } catch (error) {
    throw error
  }
}

module.exports.UpdateDocumentStatus = async (targetId, toDocumentStatusId, userId, transaction) => {
  if (!transaction) {
    throw '[StockRequisitionService][UpdateDocumentStatus] transaction is required'
  }

  try {
    // check is record exists
    const record = await entity.StockRequisition.findOne({ where: { id: targetId, isDeleted: false } })
    if (!record) {
      return { isError: true, message: 'ไม่พบข้อมูลใบเบิกสินค้าที่ต้องการแก้ไขสถานะ' }
    }

    if (record.documentStatusId === toDocumentStatusId) {
      return { isError: true, message: 'สถานะเอกสารใบเบิกสินค้าเป็นสถานะเดียวกัน, กรุณาตรวจสอบอีกครั้ง' }
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
      return { isError: true, message: 'ไม่สามารถเปลี่ยนสถานะเอกสารใบเบิกสินค้าได้' }
    }

    if (targetDocumentStatus.exten && targetDocumentStatus.exten.includes('sr_decrease_inv_balance')) {
      // add qty to inventory balance

      const products = await entity.StockRequisitionProduct.findAll({ where: { stockRequisitionId: targetId } })
      const payload = products.map((product) => ({
        productId: product.productId,
        warehouseStorageId: product.warehouseStorageId,
        qty: product.qty,
        remark: 'sr_decrease_inv_balance',
        refNumber: record.srNumber
      }))
      const result = await InventoryBalanceService.DecreaseProductBalance(payload, userId, transaction)
      if (result.isError) {
        return result
      }
    }

    // update stock requisition document status
    console.log(toDocumentStatusId)

    const updatedResult = await entity.StockRequisition.update(
      { documentStatusId: toDocumentStatusId },
      { where: { id: targetId }, returning: true, transaction: transaction }
    )
    console.log(updatedResult)
    if (updatedResult[0] === 0) {
      return { isError: true, message: 'แก้ไขสถานะเอกสารใบเบิกสินค้าล้มเหลว' }
    }

    return { isError: false, data: updatedResult[1][0], record: record }
  } catch (error) {
    throw error
  }
}
