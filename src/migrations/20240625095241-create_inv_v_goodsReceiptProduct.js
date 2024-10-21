'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_goodsReceiptProduct"
      AS SELECT
          grp.id,
          grp."goodsReceiptId",
          p.id AS "productId",
          p.barcode AS "productBarcode",
          p.image AS "productImage",
          p.code AS "productCode",
          p.name AS "productName",
          u.name AS "unitName",
          wh.id AS "warehouseId",
          wh.code AS "warehouseName",
          whs.id AS "warehouseStorageId",
          whs.name AS "warehouseStorageName",
          grp.qty,
          grp."actualQty",
          grp.remark
         FROM "inv_goodsReceiptProduct" grp
           LEFT JOIN c_product p ON p.id = grp."productId"
           LEFT JOIN "c_productUnit" u ON u.id = p."unitId"
           LEFT JOIN "inv_warehouseStorage" whs ON whs.id = grp."warehouseStorageId"
           LEFT JOIN inv_warehouse wh ON wh.id = whs."warehouseId";
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_goodsReceiptProduct";
    `)
  }
}
