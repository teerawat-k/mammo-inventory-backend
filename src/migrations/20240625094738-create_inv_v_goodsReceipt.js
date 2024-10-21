'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_goodsReceipt"
      AS SELECT gr.id,
        gr."grNumber",
        gr."refNumber",
        to_char(gr."dueDate", 'YYYY-MM-DD'::text) AS "dueDate",
        to_char(gr."receiveDate" , 'YYYY-MM-DD'::text) AS "receiveDate",
        to_char(gr."documentDate" , 'YYYY-MM-DD'::text) AS "documentDate",
        ds.id AS "documentStatusId",
        ds."code" AS "documentStatusCode",
        ds.name AS "documentStatusName",
        vendor.id AS "vendorId",
        vendor.name AS "vendorName",
        vendor.code AS "vendorCode",
        vendor.tel AS "vendorTel",
        vendor.email AS "vendorEmail",
        vendor.address AS "vendorAddress",
        "receiveStaff".id AS "receiveStaffId",
        "receiveStaff"."employeeNo" as "receiveStaffEmployeeNo",
        "receiveStaff"."displayName" as "receiveStaffDisplayName",
        "receiveStaff"."firstNameTH" as "receiveStaffFirstNameTH",
        "receiveStaff"."lastNameTH" as "receiveStaffLastNameTH",
        "receiveStaff"."firstNameEN" as "receiveStaffFirstNameEN",
        "receiveStaff"."lastNameEN" as "receiveStaffLastNameEN",
        "createdStaff".id AS "createdStaffId",
        "createdStaff"."employeeNo" as "createdStaffEmployeeNo",
        "createdStaff"."displayName" as "createdStaffDisplayName",
		    "createdStaff"."firstNameTH" as "createdStaffFirstNameTH",
        "createdStaff"."lastNameTH" as "createdStaffLastNameTH",
        "createdStaff"."firstNameEN" as "createdStaffFirstNameEN",
        "createdStaff"."lastNameEN" as "createdStaffLastNameEN",
        gr."updatedBy",
        gr."createdBy",
        to_char(gr."updatedAt", 'YYYY-MM-DD'::text) AS "updatedAt",
        to_char(gr."createdAt", 'YYYY-MM-DD'::text) AS "createdAt",
        gr."isDeleted"
       FROM "inv_goodsReceipt" gr
        LEFT JOIN "c_documentStatus" ds ON ds.id = gr."documentStatusId"
        LEFT JOIN c_vendor vendor ON vendor.id = gr."vendorId"
        LEFT JOIN c_employee "receiveStaff" ON "receiveStaff".id = gr."receiveStaffId" 
        LEFT JOIN c_employee "createdStaff" ON "createdStaff".id = gr."createdStaffId";
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_goodsReceipt";
    `)
  }
}
