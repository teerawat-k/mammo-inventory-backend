const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_goodsReceiptsProduct',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      goodsReceiptsId: Sequelize.INTEGER,
      productId: Sequelize.INTEGER,
      productBarcode: Sequelize.STRING,
      productImage: Sequelize.STRING,
      productCode: Sequelize.STRING,
      productName: Sequelize.STRING,
      unitName: Sequelize.STRING,
      warehouseId: Sequelize.INTEGER,
      warehouseName: Sequelize.STRING,
      warehouseStorageId: Sequelize.INTEGER,
      warehouseStorageName: Sequelize.STRING,
      qty: Sequelize.INTEGER,
      actualQty: Sequelize.INTEGER,
      remark: Sequelize.STRING,
    },
    {
      tableName: 'inv_v_goodsReceiptsProduct',
      timestamps: true
    }
  )

  return Entity
}
