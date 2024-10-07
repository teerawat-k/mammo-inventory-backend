'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_stockRequisitionType', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดี'
      },
      code: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'รหัสประเภทการจ่ายออก'
      },
      name: {
        type: Sequelize.TEXT,
        comment: 'ชื่อประเภทการจ่ายออก'
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inv_stockRequisitionType')
  }
}
