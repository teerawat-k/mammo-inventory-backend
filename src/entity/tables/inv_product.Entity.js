const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_product',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: Sequelize.INTEGER,
      warehouseRemark: Sequelize.TEXT,
      isAlert: Sequelize.BOOLEAN,
      alertQty: Sequelize.INTEGER,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_product',
      timestamps: true
    }
  )

  return Entity
}
