const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_warehouseStorageProduct',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      warehouseStorageId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      qty: Sequelize.INTEGER,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_warehouseStorageProduct',
      timestamps: true
    }
  )

  return Entity
}
