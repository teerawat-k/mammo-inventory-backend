const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_documentStatus',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: Sequelize.STRING,
      name: Sequelize.STRING,
      next: Sequelize.STRING,
      viewAcc: Sequelize.STRING,
      actionAcc: Sequelize.STRING,
      module: Sequelize.STRING,
      service: Sequelize.STRING,
      exten: Sequelize.JSONB,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'c_documentStatus',
      timestamps: true
    }
  )

  return Entity
}
