'use strict'

const { logger } = require('../utils')
const { Sequelize } = require('sequelize')
const config = require('../../config/sequelizeConfig')

const UserSession = require('./tables/c_userSession.Entity')
const UserRole = require('./tables/c_userRole.Entity')
const LogsUserActivity = require('./tables/c_logsUserActivity.Entity')
const DocumentStatus = require('./tables/c_documentStatus.Entity')
const Vendor = require('./tables/c_vendor.Entity')
const Employee = require('./tables/c_employee.Entity')

const Warehouse = require('./tables/inv_warehouse.Entity')
const WarehouseStorage = require('./tables/inv_warehouseStorage.Entity')

const GoodsReceipt = require('./tables/inv_goodsReceipt.Entity')
const GoodsReceiptProduct = require('./tables/inv_goodsReceiptProduct.Entity')
const ViewGoodsReceipt = require('./views/inv_v_goodsReceipt.Entity')
const ViewGoodsReceiptProduct = require('./views/inv_v_goodsReceiptProduct.Entity')
const StockRequisition = require('./tables/inv_stockRequisition.Entity')
const StockRequisitionType = require('./tables/inv_stockRequisitionType')
const StockRequisitionProduct = require('./tables/inv_stockRequisitionProduct.Entity')
const ViewStockRequisition = require('./views/inv_v_stockRequisition.Entity')
const ViewStockRequisitionProduct = require('./views/inv_v_stockRequisitionProduct.Entity')
const InventoryBalance = require('./tables/inv_inventoryBalance.Entity')
const InventoryBalanceTransaction = require('./tables/inv_inventoryBalanceTransaction.Entity')
const ViewInventoryBalance = require('./views/inv_v_inventoryBalance.Entity')
const ViewInventoryBalanceTransaction = require('./views/inv_v_inventoryBalanceTransaction.Entity')

const sequelize = new Sequelize(config.database, config.username, config.password, config)
const exec = require('child_process').exec

sequelize
  .authenticate()
  .then(async () => {
    logger.info(`Successful, connect to database host: ${config.host} database_name: ${config.database} with user ${config.username}`)

    await new Promise((resolve, reject) => {
      const migrate = exec('sequelize db:migrate', { env: process.env }, (err) => (err ? reject(err) : resolve()))
      migrate.stdout.pipe(process.stdout)
      migrate.stderr.pipe(process.stderr)
      logger.info('Migrate database')
    })
  })
  .catch((e) => {
    logger.error(`Failed, connect to database host${config.host} [ ${e} ]`)
    process.exit()
  })

const entity = {
  seq: sequelize,
  Seq: Sequelize,
  UserSession: UserSession(sequelize),
  UserRole: UserRole(sequelize),
  LogsUserActivity: LogsUserActivity(sequelize),
  DocumentStatus: DocumentStatus(sequelize),
  Vendor: Vendor(sequelize),
  Employee: Employee(sequelize),

  Warehouse: Warehouse(sequelize),
  WarehouseStorage: WarehouseStorage(sequelize),

  GoodsReceipt: GoodsReceipt(sequelize),
  GoodsReceiptProduct: GoodsReceiptProduct(sequelize),
  ViewGoodsReceipt: ViewGoodsReceipt(sequelize),
  ViewGoodsReceiptProduct: ViewGoodsReceiptProduct(sequelize),
  StockRequisition: StockRequisition(sequelize),
  StockRequisitionType: StockRequisitionType(sequelize),
  StockRequisitionProduct: StockRequisitionProduct(sequelize),
  ViewStockRequisition: ViewStockRequisition(sequelize),
  ViewStockRequisitionProduct: ViewStockRequisitionProduct(sequelize),
  InventoryBalance: InventoryBalance(sequelize),
  InventoryBalanceTransaction: InventoryBalanceTransaction(sequelize),
  ViewInventoryBalance: ViewInventoryBalance(sequelize),
  ViewInventoryBalanceTransaction: ViewInventoryBalanceTransaction(sequelize)
}

module.exports = entity
