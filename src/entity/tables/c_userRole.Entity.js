const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_userRole',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: Sequelize.TEXT,
      permission: Sequelize.JSONB,
      remark: Sequelize.TEXT,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'c_userRole',
      timestamps: true
    }
  )

  return Entity
}
