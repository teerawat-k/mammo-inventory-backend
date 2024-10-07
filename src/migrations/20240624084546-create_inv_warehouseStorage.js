'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_warehouseStorage', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      warehouseId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        comment: 'ไอดีโกดัง'
      },
      code: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'รหัสตำแหน่งที่เก็บ'
      },
      name: {
        type: Sequelize.TEXT,
        comment: 'ชื่อตำแหน่งที่เก็บ'
      },
      description: {
        type: Sequelize.TEXT,
        comment: 'รายละเอียด'
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
    await queryInterface.dropTable('inv_warehouseStorage');
  }
};
