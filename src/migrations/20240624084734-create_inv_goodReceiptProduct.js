'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_goodsReceiptProduct', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      goodsReceiptsId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีเอกสารรับเข้า'
      },
      productId: {
        type: Sequelize.INTEGER,
        comment: 'ไอดีสินค้า'
      },
      warehouseStorageId: {
        type: Sequelize.INTEGER,
        comment: 'ตำแหน่งที่เก็บ'
      },
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'จำนวนรับเข้า'
      },
      actualQty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'จำนวนรับเข้าจริง'
      },
      remark: {
        type: Sequelize.TEXT,
        comment: 'หมายเหตุ'
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
    await queryInterface.dropTable('inv_goodsReceiptProduct');
  }
};
