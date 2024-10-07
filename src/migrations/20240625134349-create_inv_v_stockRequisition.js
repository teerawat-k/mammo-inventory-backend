'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW public."inv_v_stockRequisition"
      AS SELECT sr.id,
        sr."srNumber",
        sr."refNumber",
        to_char(sr."documentDate", 'YYYY-MM-DD'::text) AS "documentDate",
        ds.id AS "documentStatusId",
        ds."code" AS "documentStatusCode",
        ds.name AS "documentStatusName",
        idt.id AS "stockRequisitionTypeId",
        idt.name AS "stockRequisitionTypeName",
        sr."remark",
        requestStaff.id as "requestStaffId",
        requestStaff."employeeNo" AS "requestStaffEmployeeNo",
        requestStaff."displayName" as "requestStaffDisplayName",
        requestStaff."firstNameTH" AS "requestStaffFirstNameTH",
        requestStaff."lastNameTH" AS "requestStaffLastNameTH",
        requestStaff."firstNameEN" AS "requestStaffFirstNameEN",
        requestStaff."lastNameEN"  AS "requestStaffLastNameEN",
        requestStaffDepartment.id as "requestStaffDepartmentId",
      	requestStaffDepartment."code" as "requestStaffDepartmentCode",
      	requestStaffDepartment."name" as "requestStaffDepartmentName",
        createdStaff.id AS "createdStaffId",
        createdStaff."employeeNo" as "createdStaffEmployeeNo",
        createdStaff."displayName" as "createdStaffDisplayName",
        createdStaff."firstNameTH" AS "createdStaffFirstNameTH",
        createdStaff."lastNameTH" AS "createdStaffLastNameTH",
        createdStaff."firstNameEN" AS "createdStaffFirstNameEN",
        createdStaff."lastNameEN"  AS "createdStaffLastNameEN",
        to_char(sr."approverDate" , 'YYYY-MM-DD'::text) AS "approverDate",
        approverStaff.id AS "approverStaffId",
        approverStaff."employeeNo" as "approverStaffEmployeeNo",
        approverStaff."displayName" as "approverStaffDisplayName",
        approverStaff."firstNameTH" AS "approverStaffFirstNameTH",
        approverStaff."lastNameTH" AS "approverStaffLastNameTH",
        approverStaff."firstNameEN" AS "approverStaffFirstNameEN",
        approverStaff."lastNameEN"  AS "approverStaffLastNameEN",
        to_char(sr."prepareDate", 'YYYY-MM-DD'::text) AS "prepareDate",
        prepareStaff.id AS "prepareStaffId",
        prepareStaff."employeeNo" as "prepareStaffEmpNo",
        prepareStaff."displayName" as "prepareStaffDisplayName",
        prepareStaff."firstNameTH" AS "prepareStaffFirstNameTH",
        prepareStaff."lastNameTH" AS "prepareStaffLastNameTH",
        prepareStaff."firstNameEN" AS "prepareStaffFirstNameEN",
        prepareStaff."lastNameEN"  AS "prepareStaffLastNameEN",
        to_char(sr."deliveryDate", 'YYYY-MM-DD'::text) AS "deliveryDate",
        deliveryStaff.id AS "deliveryStaffId",
        deliveryStaff."employeeNo" as "deliveryStaffEmpNo",
        deliveryStaff."displayName" as "deliveryStaffDisplayName",
        deliveryStaff."firstNameTH" AS "deliveryStaffFirstNameTH",
        deliveryStaff."lastNameTH" AS "deliveryStaffLastNameTH",
        deliveryStaff."firstNameEN" AS "deliveryStaffFirstNameEN",
        deliveryStaff."lastNameEN"  AS "deliveryStaffLastNameEN",
        sr."updatedBy",
        sr."createdBy",
        to_char(sr."updatedAt", 'YYYY-MM-DD'::text) AS "updatedAt",
        to_char(sr."createdAt", 'YYYY-MM-DD'::text) AS "createdAt",
        sr."isDeleted"
      FROM "inv_stockRequisition" sr
        LEFT JOIN "c_documentStatus" ds ON ds.id = sr."documentStatusId" 
        LEFT JOIN "inv_stockRequisitionType" idt ON idt.id = sr."stockRequisitionTypeId" 
        LEFT JOIN c_employee approverStaff ON approverStaff.id = sr."approverStaffId"
        LEFT JOIN c_employee prepareStaff ON prepareStaff.id = sr."prepareStaffId"
        LEFT JOIN c_employee deliveryStaff ON deliveryStaff.id = sr."deliveryStaffId"
        LEFT JOIN c_employee requestStaff on requestStaff.id = sr."requestStaffId"
        LEFT JOIN c_department requestStaffDepartment on requestStaffDepartment.id = requestStaff."departmentId"
        LEFT JOIN c_employee createdStaff on createdStaff.id = sr."createdStaffId"
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP VIEW IF EXISTS public."inv_v_stockRequisition";
    `)
  }
}
