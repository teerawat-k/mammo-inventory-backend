const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/Role.Controller')

let testData = null
let testData2 = null
let testUser = null

beforeAll(async () => {
  await entity.User.destroy({ where: { activeRemark: 'for test' } })
  await entity.Role.destroy({ where: { remark: 'for test' } })

  const mockupRole = [
    {
      name: 'test role',
      permission: [],
      remark: 'for test'
    },
    {
      name: 'role test 2',
      permission: [],
      remark: 'for test'
    }
  ]

  const result = await entity.Role.bulkCreate(mockupRole)
  testData = result[0].dataValues
  testData2 = result[1].dataValues

  const mockupUser = {
    employeeId: 1,
    roleId: testData.id,
    username: 'john',
    password: '1234',
    activeStatus: 'active',
    activeRemark: 'for test'
  }

  const createdUser = await entity.User.create(mockupUser)
  testUser = createdUser.dataValues
})

afterAll(async () => {
  await entity.User.destroy({ where: { activeRemark: 'for test' } })
  await entity.Role.destroy({ where: { remark: 'for test' } })
})

describe('GET /api/role', () => {
  const expectResponse = (response) => {
    expect(response).toHaveProperty('totalRow')
    expect(response).toHaveProperty('body')

    expect(typeof response.totalRow).toBe('number')
    expect(Array.isArray(response.body)).toBe(true)

    expect(response.totalRow).toBeGreaterThanOrEqual(1)

    const keys = Object.keys(response.body[0])
    expect(keys).toHaveLength(4)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name', 'permission', 'createdAt']))
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

  it('search by name', async () => {
    expectSearchCondition('name')
  })
})

describe('GET /api/role/:roleId', () => {
  it('validate input role id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id is required' })
  })
  it('validate input role id must be an integer', async () => {
    let req = { params: { roleId: 'abc' } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id must be an integer' })
  })
  it('role not exists', async () => {
    let req = { params: { roleId: 999999 } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_role', message: 'There is not exists role' })
  })
  it('search by role id', async () => {
    let req = { params: { roleId: testData.id } }
    let res = util.mockResponse()
    const result = await controller.SearchDetail(req, res)
    const response = result.json.mock.calls[0][0]
    expect(response).toHaveProperty('body')
    const keys = Object.keys(response.body)
    expect(keys).toHaveLength(4)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name', 'permission', 'remark']))
  })
})

describe('POST /api/role', () => {
  const fullPayload = {
    name: 'New Role',
    permission: [],
    remark: 'for test'
  }
  it('validate input name required', async () => {
    let payload = { ...fullPayload }
    delete payload.name
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('create with exists name', async () => {
    let payload = { ...fullPayload, name: testData.name }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_name', message: 'There is exists name' })
  })

  it('create successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = { ...fullPayload }
    const result = await controller.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })
    const data = await entity.Role.findOne({ where: { name: fullPayload.name } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/role/:roleId', () => {
  const fullPayload = {
    name: 'UpdatedRole',
    permission: [],
    remark: 'for test'
  }
  it('validate input role id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id is required' })
  })
  it('validate input role id must be an integer', async () => {
    let req = { params: { roleId: 'abc' }, body: fullPayload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id must be an integer' })
  })
  it('validate input name required', async () => {
    let payload = { ...fullPayload }
    delete payload.name
    let req = { params: { roleId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('update with exists name', async () => {
    let payload = { ...fullPayload, name: testData2.name }
    let req = { params: { roleId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_name', message: 'There is exists name' })
  })
  it('role not exists', async () => {
    let req = { params: { roleId: 999999 }, body: fullPayload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_role', message: 'There is not exists role' })
  })

  it('update successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.params = { roleId: testData.id }
    req.body = { ...fullPayload }
    const result = await controller.Update(req, res)
    const responseUpdated = result.json.mock.calls[0][0]
    expect(responseUpdated).toEqual({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Role.findOne({ where: { id: testData.id } })
    expect(data.name).toBe(fullPayload.name)
  })
})

describe('DELETE /api/role/:roleId', () => {
  it('validate input role id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id is required' })
  })
  it('validate input role id must be an integer', async () => {
    let req = { params: { roleId: 'abc' } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'role id must be an integer' })
  })
  it('role not exists', async () => {
    let req = { params: { roleId: 999999 } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_role', message: 'There is not exists role' })
  })
  it('delete successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.params = { roleId: testData.id }
    const result = await controller.Delete(req, res)
    const responseDeleted = result.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })
    const data = await entity.Role.findOne({ where: { id: testData.id } })
    expect(data).toBeNull()
    const recheckUser = await entity.User.findOne({ where: { roleId: testData.id } })
    expect(recheckUser).toBeNull()
  })
})
