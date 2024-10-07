const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_userSession',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: Sequelize.INTEGER,
      uuid: Sequelize.TEXT,
      expiredAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'c_userSession',
      timestamps: true
    }
  )

  return Entity
}
