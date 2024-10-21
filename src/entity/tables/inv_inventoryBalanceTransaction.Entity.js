const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_inventoryBalanceTransaction',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      refNumber: Sequelize.TEXT,
      warehouseStorageId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      type: Sequelize.TEXT,
      qty: Sequelize.INTEGER,
      balanceQty: Sequelize.INTEGER,
      remark: Sequelize.TEXT
    },
    {
      tableName: 'inv_inventoryBalanceTransaction',
      timestamps: true
    }
  )

  return Entity
}
