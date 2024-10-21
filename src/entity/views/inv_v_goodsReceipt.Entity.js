const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_goodsReceipt',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      grNumber: Sequelize.STRING,
      refNumber: Sequelize.STRING,
      dueDate: Sequelize.STRING,
      receiveDate: Sequelize.STRING,
      documentDate: Sequelize.STRING,
      documentStatusId: Sequelize.INTEGER,
      documentStatusCode: Sequelize.STRING,
      documentStatusName: Sequelize.STRING,
      vendorId: Sequelize.INTEGER,
      vendorName: Sequelize.STRING,
      vendorCode: Sequelize.STRING,
      vendorTel: Sequelize.STRING,
      vendorEmail: Sequelize.STRING,
      vendorAddress: Sequelize.STRING,
      receiveStaffId: Sequelize.INTEGER,
      receiveStaffEmployeeNo: Sequelize.STRING,
      receiveStaffDisplayName: Sequelize.STRING,
      receiveStaffFirstNameTH: Sequelize.STRING,
      receiveStaffLastNameTH: Sequelize.STRING,
      receiveStaffFirstNameEN: Sequelize.STRING,
      receiveStaffLastNameEN: Sequelize.STRING,
      createdStaffId: Sequelize.INTEGER,
      createdStaffEmployeeNo: Sequelize.STRING,
      createdStaffDisplayName: Sequelize.STRING,
      createdStaffFirstNameTH: Sequelize.STRING,
      createdStaffLastNameTH: Sequelize.STRING,
      createdStaffFirstNameEN: Sequelize.STRING,
      createdStaffLastNameEN: Sequelize.STRING,
      updatedBy: Sequelize.INTEGER,
      createdBy: Sequelize.INTEGER,
      updatedAt: Sequelize.STRING,
      createdAt: Sequelize.STRING,
      isDeleted: Sequelize.BOOLEAN
    },
    {
      tableName: 'inv_v_goodsReceipt',
      timestamps: true
    }
  )

  return Entity
}
