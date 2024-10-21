const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_goodsReceipt',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      documentStatusId: Sequelize.INTEGER,
      vendorId: Sequelize.INTEGER,
      grNumber: Sequelize.TEXT,
      refNumber: Sequelize.TEXT,
      documentDate: Sequelize.DATEONLY,
      createdStaffId: Sequelize.INTEGER,
      dueDate: Sequelize.DATEONLY,
      receiveStaffId: Sequelize.INTEGER,
      receiveDate: Sequelize.DATEONLY,
      remark: Sequelize.TEXT,
      isDeleted: Sequelize.BOOLEAN,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_goodsReceipt',
      timestamps: true
    }
  )

  return Entity
}
