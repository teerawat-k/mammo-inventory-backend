const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_stockRequisition',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      documentStatusId: Sequelize.INTEGER,
      stockRequisitionTypeId: Sequelize.INTEGER,
      srNumber: Sequelize.TEXT,
      refNumber: Sequelize.TEXT,
      documentDate: Sequelize.DATEONLY,
      createdStaffId: Sequelize.INTEGER,
      requestStaffId: Sequelize.INTEGER,
      approverStaffId: Sequelize.INTEGER,
      approverDate: Sequelize.DATEONLY,
      prepareStaffId: Sequelize.INTEGER,
      prepareDate: Sequelize.DATEONLY,
      deliveryStaffId: Sequelize.INTEGER,
      deliveryDate: Sequelize.DATEONLY,
      remark: Sequelize.TEXT,
      isDeleted: Sequelize.BOOLEAN,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_stockRequisition',
      timestamps: true
    }
  )

  return Entity
}