'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inv_warehouse', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'ไอดีสินค้าหลัก'
      },
      isHeadquarter: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'สำนักงานใหญ่'
      },
      code: {
        type: Sequelize.TEXT,
        comment: 'รหัสโกดัง'
      },
      name: {
        type: Sequelize.TEXT,
        comment: 'ชื่อโกดัง'
      },
      tel: {
        type: Sequelize.TEXT,
        comment: 'เบอร์ติดต่อ'
      },
      email: {
        type: Sequelize.TEXT,
        comment: 'อีเมล'
      },
      address: {
        type: Sequelize.TEXT,
        comment: 'ที่อยู่'
      },
      googleMap: {
        type: Sequelize.TEXT,
        comment: 'google map iframe url'
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
    await queryInterface.dropTable('inv_warehouse');
  }
};
