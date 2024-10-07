'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_stockRequisition', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      documentStatusId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีสถานะเอกสาร'
      },
      stockRequisitionTypeId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีประเภทการจ่ายออก'
      },
      srNumber: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'เลขที่เอกสาร'
      },
      refNumber: {
        type: Sequelize.TEXT,
        comment: 'เลขที่เอกสารอ้างอิง'
      },
      documentDate: {
        allowNull: false,
        type: Sequelize.DATEONLY,
        comment: 'วันที่เอกสาร'
      },
      createdStaffId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'เจ้าหน้าที่สร้างเอกสาร'
      },
      requestStaffId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีผู้ร้องขอ'
      },
      approverStaffId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีเจ้าหน้าที่อนุมัติ'
      },
      approverDate: {
        type: Sequelize.DATEONLY,
        comment: 'วันที่อนุมัติ'
      },
      prepareStaffId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีเจ้าหน้าที่จัดเตรียม'
      },
      prepareDate: {
        type: Sequelize.DATEONLY,
        comment: 'วันที่วันที่จัดเตรียม'
      },
      deliveryStaffId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีเจ้าหน้าที่ส่งมอบ'
      },
      deliveryDate: {
        type: Sequelize.DATEONLY,
        comment: 'วันที่ส่งมอบ'
      },
      remark: {
        type: Sequelize.TEXT,
        comment: 'หมายเหตุ'
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'สถานะการลบ'
      },
      updatedBy: {
        allowNull: true,
        type: Sequelize.INTEGER,
        comment: 'อัพเดทล่าสุดโดย'
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        comment: 'วันที่อัพเดทล่าสุด'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        comment: 'สร้างโดย'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
        comment: 'วันที่สร้าง'
      }
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inv_stockRequisition')
  }
}
