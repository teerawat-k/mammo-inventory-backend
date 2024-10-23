const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_inventoryBalance',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      warehouseId: Sequelize.INTEGER,
      warehouseCode: Sequelize.TEXT,
      warehouseName: Sequelize.TEXT,
      warehouseStorageId: Sequelize.INTEGER,
      warehouseStorageCode: Sequelize.TEXT,
      warehouseStorageName: Sequelize.TEXT,
      qty: Sequelize.INTEGER,
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
      tableName: 'inv_v_inventoryBalance',
      timestamps: true
    }
  )

  return Entity
}
