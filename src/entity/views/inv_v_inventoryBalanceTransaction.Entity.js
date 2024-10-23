const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_inventoryBalanceTransaction',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      refNumber: Sequelize.TEXT,
      type: Sequelize.TEXT,
      warehouseId: Sequelize.INTEGER,
      warehouseCode: Sequelize.TEXT,
      warehouseName: Sequelize.TEXT,
      qty: Sequelize.INTEGER,
      balanceQty: Sequelize.INTEGER,
      warehouseStorageId: Sequelize.INTEGER,
      warehouseStorageCode: Sequelize.TEXT,
      warehouseStorageName: Sequelize.TEXT,
      productId: Sequelize.INTEGER,
      productImage: Sequelize.TEXT,
      productCode: Sequelize.TEXT,
      productName: Sequelize.TEXT,
      productBarcode: Sequelize.TEXT,
      productDescription: Sequelize.TEXT,
      productRemark: Sequelize.TEXT,
      productCategoryId: Sequelize.INTEGER,
      productCategoryCode: Sequelize.TEXT,
      productCategoryName: Sequelize.TEXT,
      productUnitId: Sequelize.INTEGER,
      productUnitName: Sequelize.TEXT,
      remark: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      createdBy: Sequelize.INTEGER,
      updatedAt: Sequelize.TEXT,
      createdAt: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      createdBy: Sequelize.INTEGER,
      updatedAt: Sequelize.STRING,
      createdAt: Sequelize.STRING
    },
    {
      tableName: 'inv_v_inventoryBalanceTransaction',
      timestamps: true
    }
  )

  return Entity
}
