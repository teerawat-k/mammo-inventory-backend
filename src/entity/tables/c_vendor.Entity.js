const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_vendor',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: Sequelize.TEXT,
      name: Sequelize.TEXT,
      tel: Sequelize.TEXT,
      email: Sequelize.TEXT,
      fax: Sequelize.TEXT,
      address: Sequelize.TEXT,
      googleMap: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'c_vendor',
      timestamps: true
    }
  )

  return Entity
}
