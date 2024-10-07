const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/User.Controller')

let testData = null
let testDataSecond = null
let employeeData = null
let employeeDataSecond = null
let employeeDataThird = null

beforeAll(async () => {
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  await entity.User.destroy({ where: { activeRemark: 'for test' } })

  const mockUpEmployee = {
    employeeNo: 'EMP100',
    idcardNo: '1234567890123',
    firstNameTH: 'John',
    lastNameTH: 'Doe',
    departmentId: 1,
    genderId: 1,
    branchId: 1,
    titleNameId: 1,
    remark: 'for test'
  }

  const createdEmployee = await entity.Employee.create(mockUpEmployee)
  employeeData = createdEmployee.dataValues
  const createdEmployeeSecond = await entity.Employee.create({ ...mockUpEmployee, employeeNo: 'EMP101' })
  employeeDataSecond = createdEmployeeSecond.dataValues
  const createdEmployeeThird = await entity.Employee.create({ ...mockUpEmployee, employeeNo: 'EMP102' })
  employeeDataThird = createdEmployeeThird.dataValues

  const mockupUsers = [
    {
      employeeId: createdEmployee.dataValues.id,
      roleId: 1,
      username: 'john',
      password: '1234',
      activeStatus: 'active',
      activeRemark: 'for test'
    },
    {
      employeeId: createdEmployee.dataValues.id,
      roleId: 1,
      username: 'johnSS',
      password: '1234',
      activeStatus: 'active',
      activeRemark: 'for test'
    }
  ]

  const result = await entity.User.bulkCreate(mockupUsers)
  const user = await entity.ViewUser.findOne({ where: { id: result[0].dataValues.id } })
  const userSecond = await entity.ViewUser.findOne({ where: { id: result[1].dataValues.id } })
  testData = user
  testDataSecond = userSecond
})

afterAll(async () => {
  // await entity.Employee.destroy({ where: { remark: 'for test' } })
  // await entity.User.destroy({ where: { activeRemark: 'for test' } })
})

describe('GET /api/user', () => {
  const expectResponse = (response) => {
    expect(response).toHaveProperty('totalRow')
    expect(response).toHaveProperty('body')

    expect(typeof response.totalRow).toBe('number')
    expect(Array.isArray(response.body)).toBe(true)

    expect(response.totalRow).toBeGreaterThanOrEqual(1)

    const keys = Object.keys(response.body[0])
    expect(keys).toHaveLength(12)
    expect(keys).toEqual(
      expect.arrayContaining([
        'id',
        'image',
        'username',
        'firstNameTH',
        'lastNameTH',
        'roleId',
        'roleName',
        'departmentId',
        'departmentName',
        'createdAt',
        'lastSignIn',
        'activeStatus'
      ])
    )
  }
  const expectSearchCondition = async (column) => {
    const req = { query: { [column]: testData[column], pageNo: 1, pageSize: 50 } }
    const res = util.mockResponse()
    const resultSearch = await controller.Search(req, res)
    const responseSearch = resultSearch.json.mock.calls[0][0]
    expectResponse(responseSearch)
    responseSearch.body.forEach((data) => {
      expect(data[column]).toBe(testData[column])
    })
  }

  it('validate input pageNo required', async () => {
    const req = { query: { pageSize: 50 } }
    const res = util.mockResponse()
    await controller.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no is required' })
  })
  it('validate input pageNo must be an integer', async () => {
    const req = { query: { pageNo: 'abc', pageSize: 50 } }
    const res = util.mockResponse()
    await controller.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no must be an integer' })
  })
  it('validate input pageSize required', async () => {
    const req = { query: { pageNo: 1 } }
    const res = util.mockResponse()
    await controller.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size is required' })
  })
  it('validate input pageSize must be an integer', async () => {
    const req = { query: { pageNo: 1, pageSize: 'abc' } }
    const res = util.mockResponse()
    await controller.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size must be an integer' })
  })
  it('raw search', async () => {
    const req = { query: { pageNo: 1, pageSize: 50 } }
    const res = util.mockResponse()
    const result = await controller.Search(req, res)
    responseSearch = result.json.mock.calls[0][0]
    expectResponse(responseSearch)
  })
  it('search by first name th', async () => {
    expectSearchCondition('firstNameTH')
  })
  it('search by last name th', async () => {
    expectSearchCondition('lastNameTH')
  })
  it('search by role id', async () => {
    expectSearchCondition('roleId')
  })
  it('search by department id', async () => {
    expectSearchCondition('departmentId')
  })
  it('search by active status', async () => {
    expectSearchCondition('activeStatus')
  })
})

describe('GET /api/user/:userId', () => {
  it('validate input user id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'user id is required' })
  })
  it('validate input user id must be an integer', async () => {
    let req = { params: { userId: '1a' } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'user id must be an integer' })
  })
  it('search by user id not exists', async () => {
    let req = { params: { userId: 999999 } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_user', message: 'There is not exists user' })
  })

  it('search by user id', async () => {
    const req = { params: { userId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(14)
    expect(keys).toEqual(
      expect.arrayContaining([
        'id',
        'image',
        'employeeNo',
        'roleId',
        'username',
        'activeStatus',
        'activeRemark',
        'remark',
        'firstNameTH',
        'lastNameTH',
        'branchId',
        'departmentId',
        'position',
        'lastSignIn'
      ])
    )
  })
})

describe('POST /api/user', () => {
  const fullPayload = {
    username: 'DoeDD',
    password: '123455',
    employeeId: 1,
    roleId: 1,
    activeStatus: 'active',
    activeRemark: 'for test'
  }
  it('validate input username required', async () => {
    let payload = { ...fullPayload }
    delete payload.username
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'username is required' })
  })
  it('validate input password required', async () => {
    let payload = { ...fullPayload }
    delete payload.password
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'password is required' })
  })
  it('validate input employee id required', async () => {
    let payload = { ...fullPayload }
    delete payload.employeeId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id is required' })
  })
  it('validate input employee id must be an integer', async () => {
    let payload = { ...fullPayload, employeeId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id must be an integer' })
  })
  it('validate input role id required', async () => {
    let payload = { ...fullPayload }
    delete payload.roleId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id is required' })
  })
  it('validate input role id must be an integer', async () => {
    let payload = { ...fullPayload, roleId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id must be an integer' })
  })
  it('create with exists username', async () => {
    let payload = { ...fullPayload, username: testData.username }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_username', message: 'There is exists username' })
  })
  it('create with exists user by employee id', async () => {
    let payload = { ...fullPayload, employeeId: testData.employeeId }
    let req = { user: { id: 1 }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_user_by_employee', message: 'This employee has been created user' })
  })
  it('create with not exists employee', async () => {
    let payload = { ...fullPayload, employeeId: 999999 }
    let req = { user: { id: 1 }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })
  it('create with not exists role', async () => {
    let payload = { ...fullPayload, roleId: 999999, employeeId: employeeDataSecond.id }
    let req = { user: { id: 1 }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_role', message: 'There is not exists role' })
  })

  it('create successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = { ...fullPayload, employeeId: employeeDataSecond.id }
    const result = await controller.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })
    const data = await entity.ViewUser.findOne({ where: { firstNameTH: employeeDataSecond.firstNameTH } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/user/:userId', () => {
  const fullPayload = {
    username: 'DoeDDSS',
    password: '123455',
    employeeId: 1,
    roleId: 1,
    activeStatus: 'active'
  }
  it('validate params user id must be integer', async () => {
    let req = { user: { id: 99 }, params: { userId: '1a' }, body: fullPayload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'user id must be an integer' })
  })
  it('validate input username required', async () => {
    let payload = { ...fullPayload }
    delete payload.username
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'username is required' })
  })
  it('validate input password required', async () => {
    let payload = { ...fullPayload }
    delete payload.password
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'password is required' })
  })
  it('validate input employee id required', async () => {
    let payload = { ...fullPayload }
    delete payload.employeeId
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id is required' })
  })
  it('validate input employee id must be an integer', async () => {
    let payload = { ...fullPayload, employeeId: '1a' }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id must be an integer' })
  })
  it('validate input role id required', async () => {
    let payload = { ...fullPayload }
    delete payload.roleId
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id is required' })
  })
  it('validate input role id must be an integer', async () => {
    let payload = { ...fullPayload, roleId: '1a' }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id must be an integer' })
  })

  it('update with exists username', async () => {
    let payload = { ...fullPayload, username: testDataSecond.username }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_username', message: 'There is exists username' })
  })
  it('update with exists user by employee id', async () => {
    let payload = { ...fullPayload, employeeId: testDataSecond.employeeId }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_user_by_employee', message: 'This employee has been created user' })
  })
  it('update with not exists employee', async () => {
    let payload = { ...fullPayload, employeeId: 999999 }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })
  it('update with not exists role', async () => {
    let payload = { ...fullPayload, roleId: 999999, employeeId: employeeDataThird.id }
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_role', message: 'There is not exists role' })
  })

  it('update successfully with null password', async () => {
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: { ...fullPayload, employeeId: employeeDataThird.id } }
    let res = util.mockResponse()
    delete req.body.password

    const originData = await entity.User.findOne({ where: { id: testData.id } })

    const result = await controller.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.User.findOne({ where: { password: originData.password, id: testData.id } })
    expect(data).not.toBeNull()
  })

  it('update successfully with new password', async () => {
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: { ...fullPayload, employeeId: employeeDataThird.id } }
    let res = util.mockResponse()

    const originData = await entity.User.findOne({ where: { id: testData.id } })

    const result = await controller.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.User.findOne({ where: { password: originData.password, id: testData.id } })
    expect(data).toBeNull()
  })

  it('update successfully', async () => {
    let req = { user: { id: 1 }, params: { userId: testData.id }, body: { ...fullPayload, employeeId: employeeDataThird.id } }
    let res = util.mockResponse()
    req.body.username = 'EMP555'
    const result = await controller.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.User.findOne({ where: { username: 'EMP555' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/user/:userId', () => {
  it('validate params user id must be integer', async () => {
    let req = { user: { id: 99 }, params: { userId: '1a' } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'user id must be an integer' })
  })
  it('delete with not exists record', async () => {
    let req = {
      user: { id: 1 },
      params: { userId: 999999 }
    }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_user', message: 'There is not exists user' })
  })
  it('delete successfully', async () => {
    const req = { user: { id: 99 }, params: { userId: testData.id } }
    const res = util.mockResponse()

    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const recheckRecordCount = await entity.User.count({ where: { id: testData.id } })
    expect(recheckRecordCount).toBe(0)
  })
})
