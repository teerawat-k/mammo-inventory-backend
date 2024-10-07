const { Sequelize } = require('sequelize')

module.exports = (sequelize) => {
  const Entity = sequelize.define(
    'c_employee',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      image: Sequelize.TEXT,
      employeeNo: Sequelize.TEXT,
      genderId: Sequelize.INTEGER,
      idcardNo: Sequelize.TEXT,
      idcardExpireDate: Sequelize.DATE,
      idcardPlace: Sequelize.TEXT,
      passportNo: Sequelize.TEXT,
      passportExpireDate: Sequelize.DATE,
      titleNameId: Sequelize.INTEGER,
      displayName: Sequelize.TEXT,
      firstNameTH: Sequelize.TEXT,
      lastNameTH: Sequelize.TEXT,
      firstNameEN: Sequelize.TEXT,
      lastNameEN: Sequelize.TEXT,
      taxId: Sequelize.TEXT,
      dateOfBirth: Sequelize.DATE,
      nationalityId: Sequelize.INTEGER,
      religionId: Sequelize.INTEGER,
      militaryServiceStatus: Sequelize.TEXT,
      bloodTypeId: Sequelize.INTEGER,
      height: Sequelize.INTEGER,
      weight: Sequelize.INTEGER,
      branchId: Sequelize.INTEGER,
      departmentId: Sequelize.INTEGER,
      positionId: Sequelize.INTEGER,
      startDate: Sequelize.DATE,
      endDate: Sequelize.DATE,
      marriageStatus: Sequelize.TEXT,
      activeStatus: Sequelize.TEXT,
      activeStatusLastedUpdated: Sequelize.DATE,
      activeStatusRemark: Sequelize.TEXT,
      address: Sequelize.TEXT,
      tel: Sequelize.TEXT,
      email: Sequelize.TEXT,
      emsContact1: Sequelize.TEXT,
      emsContact2: Sequelize.TEXT,
      remark: Sequelize.TEXT,
      isDeleted: Sequelize.BOOLEAN,
      updatedBy: Sequelize.INTEGER,
      updatedAt: Sequelize.DATE,
      createdBy: Sequelize.INTEGER,
      createdAt: Sequelize.DATE
    },
    {
      tableName: 'c_employee',
      timestamps: true
    }
  )

  return Entity
}
