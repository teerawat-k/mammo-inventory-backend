const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_logsUserActivity',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      createdAt: Sequelize.DATE,
      userId: Sequelize.INTEGER,
      module: Sequelize.TEXT,
      service: Sequelize.TEXT,
      targetId: Sequelize.INTEGER,
      action: Sequelize.TEXT,
      description: Sequelize.TEXT,
      beforeChange: Sequelize.JSONB,
      afterChange: Sequelize.JSONB,
      updatedAt: Sequelize.DATE
    },
    {
      tableName: 'c_logsUserActivity',
      timestamps: true
    }
  )

  return Entity
}
