const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/Unit.Controller')

let testData = null

beforeAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
  await entity.Unit.destroy({ where: { updatedBy: 99 } })
  const mockupUnit = [
    { name: 'Unit 1', updatedBy: 99 },
    { name: 'Unit 2', updatedBy: 99 },
    { name: 'Unit 3', updatedBy: 99 }
  ]
  const result = await entity.Unit.bulkCreate(mockupUnit)
  testData = result[0].dataValues

  const mockupProducts = [
    {
      code: 'PD001',
      name: 'Product test 001',
      categoryId: 1,
      unitId: testData.id,
      remark: 'for test'
    }
  ]
  await entity.Product.bulkCreate(mockupProducts)
})

afterAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
  await entity.Unit.destroy({ where: { updatedBy: 99 } })
})

describe('GET /api/unit', () => {
  const expectResponse = (response) => {
    expect(response).toHaveProperty('totalRow')
    expect(response).toHaveProperty('body')

    expect(typeof response.totalRow).toBe('number')
    expect(Array.isArray(response.body)).toBe(true)

    expect(response.totalRow).toBeGreaterThanOrEqual(1)

    const keys = Object.keys(response.body[0])
    expect(keys).toHaveLength(2)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name']))
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

describe('GET /api/unit/:unitId', () => {
  it('validate input unit id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id is required' })
  })
  it('validate input unit id must be an integer', async () => {
    let req = { params: { unitId: '1a' } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id must be an integer' })
  })

  it('search by unit id not exists', async () => {
    const req = { params: { unitId: 999999 } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_unit', message: 'There is not exists unit' })
  })

  it('search by unit id', async () => {
    const req = { params: { unitId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(2)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name']))
  })
})

describe('POST /api/unit', () => {
  it('validate input name required', async () => {
    let req = { body: {} }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('create with exists name', async () => {
    let req = { body: { name: testData.name } }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_unit_name', message: 'There is exists unit name' })
  })

  it('create successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = { name: 'Unit New', updatedBy: 99 }
    const result = await controller.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })
    const data = await entity.Unit.findOne({ where: { name: 'Unit New' } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/unit/:unitId', () => {
  it('validate input name required', async () => {
    let req = { user: { id: 99 }, params: { unitId: testData.id }, body: {} }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })

  it('update with exists name in other record', async () => {
    let req = { user: { id: 99 }, params: { unitId: testData.id }, body: { name: 'Unit 2' } }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_unit_name', message: 'There is exists unit name' })
  })

  it('update with not exists record', async () => {
    let req = {
      user: { id: 99 },
      params: { unitId: 999999 },
      body: { name: 'Update New' }
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_unit', message: 'There is not exists unit' })
  })
  it('update successfully', async () => {
    let req = {
      user: { id: 99 },
      params: { unitId: testData.id },
      body: { name: 'Update New' }
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Unit.findOne({ where: { name: 'Update New' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/unit/:unitId', () => {
  it('validate params unit id must be integer', async () => {
    let req = { user: { id: 99 }, params: { unitId: '1a' } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id must be an integer' })
  })
  it('delete with not exists record', async () => {
    const req = { user: { id: 99 }, params: { unitId: 999999 } }
    const res = util.mockResponse()
    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'not_exists_unit', message: 'There is not exists unit' })
  })
  it('delete default', async () => {
    const req = { user: { id: 99 }, params: { unitId: 1 } }
    const res = util.mockResponse()
    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default unit' })
  })

  it('delete successfully', async () => {
    const req = { user: { id: 99 }, params: { unitId: testData.id } }
    const res = util.mockResponse()

    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const recheckRecordCount = await entity.Unit.count({ where: { id: testData.id } })
    expect(recheckRecordCount).toBe(0)
    const recheckProduct = await entity.Product.count({ where: { unitId: testData.id } })
    expect(recheckProduct).toBe(0)
  })
})
