const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_stockRequisitionProduct',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stockRequisitionId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      warehouseStorageId: Sequelize.INTEGER,
      qty: Sequelize.INTEGER,
      remark: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_stockRequisitionProduct',
      timestamps: true
    }
  )

  return Entity
}