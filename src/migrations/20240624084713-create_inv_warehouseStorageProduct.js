'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_warehouseStorageProduct', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      warehouseStorageId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีตำแหน่งที่เก็บ'
      },
      productId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีสินค้า'
      },
      qty: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'จำนวนสินค้า'
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
    await queryInterface.dropTable('inv_warehouseStorageProduct');
  }
};
