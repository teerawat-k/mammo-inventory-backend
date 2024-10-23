'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_inventoryBalanceTransaction"
      AS SELECT iib.id, iib."refNumber", iib."type"
      , iw.id as "warehouseId", iw.code as "warehouseCode", iw."name" as "warehouseName", iib.qty, iib."balanceQty"
      , iws.id AS "warehouseStorageId", iws.code AS "warehouseStorageCode", iws."name" AS "warehouseStorageName"
      , cp.id AS "productId", cp.image AS "productImage", cp.code AS "productCode", cp.name AS "productName", cp.barcode AS "productBarcode", cp.description AS "productDescription", cp.remark AS "productRemark"
      , cpc.id AS "productCategoryId", cpc.code AS "productCategoryCode", cpc.name AS "productCategoryName"
      , cpu.id AS "productUnitId", cpu.name AS "productUnitName"
      , iib.remark 
      , iib."updatedBy", iib."createdBy", to_char(iib."updatedAt", 'YYYY-MM-DD HH24:MM:SS'::text) AS "updatedAt", to_char(iib."createdAt", 'YYYY-MM-DD HH24:MM:SS'::text) AS "createdAt"
      FROM "inv_inventoryBalanceTransaction" iib
      LEFT JOIN c_product cp ON cp.id = iib."productId" 
      LEFT JOIN "c_productCategory" cpc ON cpc.id = cp."categoryId"
      LEFT JOIN "c_productUnit" cpu ON cpu.id = cp."unitId"
      LEFT JOIN "inv_warehouseStorage" iws ON iws.id = iib."warehouseStorageId"
      LEFT JOIN "inv_warehouse" iw on iw.id = iws."warehouseId"
    `)
  },

  async down(queryInterface, _) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_inventoryBalanceTransaction";
    `)
  }
}
