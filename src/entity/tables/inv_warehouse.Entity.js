const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_warehouse',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      isHeadquarter: Sequelize.BOOLEAN,
      code: Sequelize.TEXT,
      name: Sequelize.TEXT,
      tel: Sequelize.TEXT,
      email: Sequelize.TEXT,
      address: Sequelize.TEXT,
      googleMap: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'inv_warehouse',
      timestamps: true
    }
  )

  return Entity
}
