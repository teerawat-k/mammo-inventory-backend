const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'inv_v_stockRequisition',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      srNumber: Sequelize.STRING,
      refNumber: Sequelize.STRING,
      documentDate: Sequelize.STRING,
      documentStatusId: Sequelize.INTEGER,
      documentStatusCode: Sequelize.STRING,
      documentStatusName: Sequelize.STRING,
      stockRequisitionTypeId: Sequelize.INTEGER,
      stockRequisitionTypeName: Sequelize.STRING,
      remark: Sequelize.STRING,
      requestStaffId: Sequelize.INTEGER,
      requestStaffEmployeeNo: Sequelize.STRING,
      requestStaffDisplayName: Sequelize.STRING,
      requestStaffFirstNameTH: Sequelize.STRING,
      requestStaffLastNameTH: Sequelize.STRING,
      requestStaffFirstNameEN: Sequelize.STRING,
      requestStaffLastNameEN: Sequelize.STRING,
      requestStaffDepartmentId: Sequelize.INTEGER,
      requestStaffDepartmentCode: Sequelize.STRING,
      requestStaffDepartmentName: Sequelize.STRING,
      createdStaffId: Sequelize.INTEGER,
      createdStaffEmployeeNo: Sequelize.STRING,
      createdStaffDisplayName: Sequelize.STRING,
      createdStaffFirstNameTH: Sequelize.STRING,
      createdStaffLastNameTH: Sequelize.STRING,
      createdStaffFirstNameEN: Sequelize.STRING,
      createdStaffLastNameEN: Sequelize.STRING,
      approverDate: Sequelize.STRING,
      approverStaffId: Sequelize.INTEGER,
      approverStaffEmployeeNo: Sequelize.STRING,
      approverStaffDisplayName: Sequelize.STRING,
      approverStaffFirstNameTH: Sequelize.STRING,
      approverStaffLastNameTH: Sequelize.STRING,
      approverStaffFirstNameEN: Sequelize.STRING,
      approverStaffLastNameEN: Sequelize.STRING,
      prepareDate: Sequelize.STRING,
      prepareStaffId: Sequelize.INTEGER,
      prepareStaffEmployeeNo: Sequelize.STRING,
      prepareStaffDisplayName: Sequelize.STRING,
      prepareStaffFirstNameTH: Sequelize.STRING,
      prepareStaffLastNameTH: Sequelize.STRING,
      prepareStaffFirstNameEN: Sequelize.STRING,
      prepareStaffLastNameEN: Sequelize.STRING,
      deliveryDate: Sequelize.STRING,
      deliveryStaffId: Sequelize.INTEGER,
      deliveryStaffEmployeeNo: Sequelize.STRING,
      deliveryStaffDisplayName: Sequelize.STRING,
      deliveryStaffFirstNameTH: Sequelize.STRING,
      deliveryStaffLastNameTH: Sequelize.STRING,
      deliveryStaffFirstNameEN: Sequelize.STRING,
      deliveryStaffLastNameEN: Sequelize.STRING,
      updatedBy: Sequelize.INTEGER,
      createdBy: Sequelize.INTEGER,
      updatedAt: Sequelize.STRING,
      createdAt: Sequelize.STRING,
      isDeleted: Sequelize.BOOLEAN
    },
    {
      tableName: 'inv_v_stockRequisition',
      timestamps: true
    }
  )

  return Entity
}
