const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_goodsReceiptProduct',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      goodsReceiptsId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      warehouseStorageId: Sequelize.INTEGER,
      qty: Sequelize.INTEGER,
      actualQty: Sequelize.INTEGER,
      remark: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_goodsReceiptProduct',
      timestamps: true
    }
  )

  return Entity
}
