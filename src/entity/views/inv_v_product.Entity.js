const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_product',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      image: Sequelize.TEXT,
      code: Sequelize.TEXT,
      name: Sequelize.TEXT,
      barcode: Sequelize.TEXT,
      description: Sequelize.TEXT,
      remark: Sequelize.TEXT,
      categoryId: Sequelize.INTEGER,
      categoryCode: Sequelize.TEXT,
      categoryName: Sequelize.TEXT,
      unitId: Sequelize.INTEGER,
      unitName: Sequelize.TEXT,
      warehouseRemark: Sequelize.TEXT,
      isAlert: Sequelize.BOOLEAN,
      alertQty: Sequelize.INTEGER,
      isDeleted: Sequelize.BOOLEAN,
      updatedBy: Sequelize.TEXT,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.TEXT,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_v_product',
      timestamps: true
    }
  )

  return Entity
}
