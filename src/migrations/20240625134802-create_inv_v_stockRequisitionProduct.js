'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_stockRequisitionProduct"
      AS SELECT 
          srp.id,
          srp."stockRequisitionId",
          p.id AS "productId",
          p.barcode AS "productBarcode",
          p.image AS "productImage",
          p.code as "productCode",
          p.name AS "productName",
          u.name AS "unitName",
          wh.id AS "warehouseId",
          wh.name AS "warehouseName",
          whs.id AS "warehouseStorageId",
          whs.name AS "warehouseStorageName",
          srp.qty,
          srp.remark
        FROM "inv_stockRequisitionProduct" srp
          LEFT JOIN c_product p ON p.id = srp."productId"
          LEFT JOIN "c_productUnit" u ON u.id = p."unitId"
          LEFT JOIN "inv_warehouseStorage" whs ON whs.id = srp."warehouseStorageId"
          LEFT JOIN inv_warehouse wh ON wh.id = whs."warehouseId";
    `)
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_stockRequisitionProduct";
    `)
  }
}
