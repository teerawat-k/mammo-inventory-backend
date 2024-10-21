'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_inventoryBalanceTransaction', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      refNumber: {
        type: Sequelize.TEXT,
        comment: 'เอกสารอ้างอิง'
      },
      warehouseStorageId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีจุดเก็บ'
      },
      productId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีสินค้า'
      },
      type: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'ประเภท รับเข้า/จ่ายออก',
        validate: {
          isIn: [['IN', 'OUT']]
        }
      },
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'จำนวน'
      },
      balanceQty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'จำนวนคงคลัง'
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
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('inv_inventoryBalanceTransaction')
  }
}
