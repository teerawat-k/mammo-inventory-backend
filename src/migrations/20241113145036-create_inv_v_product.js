'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_product"
      AS SELECT cp.id, cp.image, cp.code, cp.name, cp.barcode, cp.description, cp.remark
      , cpc.id AS "categoryId", cpc.code AS "categoryCode", cpc.name AS "categoryName"
      , cpu.id AS "unitId", cpu.name AS "unitName", ip."warehouseRemark", ip."isAlert", ip."alertQty"
      , cp."isDeleted", cp."updatedBy"
      , to_char(cp."updatedAt", 'YYYY-MM-DD HH24:MI'::text) AS "updatedAt"
      , cp."createdBy"
      , to_char(cp."createdAt", 'YYYY-MM-DD HH24:MI'::text) AS "createdAt"
      FROM c_product cp
      LEFT JOIN "c_productCategory" cpc ON cpc.id = cp."categoryId"
      LEFT JOIN "c_productUnit" cpu ON cpu.id = cp."unitId"
      LEFT JOIN "inv_product" ip on ip."productId"  = cp.id;
    `)
  },

  async down(queryInterface, _) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_product";
    `)
  }
}
