'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('inv_product', 'isAlert', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
    await queryInterface.addColumn('inv_product', 'alertQty', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    })
    await queryInterface.renameColumn('inv_product', 'remark', 'warehouseRemark')
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('inv_product', 'isAlert')
    await queryInterface.removeColumn('inv_product', 'alertQty')
    await queryInterface.renameColumn('inv_product', 'warehouseRemark', 'remark')
  }
}
