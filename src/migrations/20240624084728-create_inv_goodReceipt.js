'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_goodsReceipt', {
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
      vendorId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีผู้ขาย'
      },
      grNumber: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'รหัสเอกสาร'
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
      dueDate: {
        type: Sequelize.DATEONLY,
        comment: 'กำหนดการรับเข้า'
      },
      receiveStaffId: {
        type: Sequelize.INTEGER,
        comment: 'เจ้าหน้าที่รับเข้า'
      },
      receiveDate: {
        type: Sequelize.DATEONLY,
        comment: 'วันที่รับเข้า'
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inv_goodsReceipt');
  }
};
