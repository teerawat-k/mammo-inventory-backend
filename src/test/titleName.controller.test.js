const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/TitleName.Controller')

let testData = null

beforeAll(async () => {
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  await entity.TitleName.destroy({ where: { updatedBy: 99 } })
  const mockupTitleName = [
    { name: 'Mr.', updatedBy: 99 },
    { name: 'Mrs.', updatedBy: 99 },
    { name: 'Miss', updatedBy: 99 }
  ]
  const result = await entity.TitleName.bulkCreate(mockupTitleName)
  testData = result[0].dataValues

  const mockupEmployee = [
    {
      code: 'EMP100',
      name: 'John',
      genderId: 0,
      titleNameId: testData.id,
      remark: 'for test'
    },
    {
      code: 'EMP200',
      name: 'Jane',
      genderId: 0,
      titleNameId: testData.id,
      remark: 'for test'
    },
    {
      code: 'EMP300',
      name: 'Jim',
      genderId: 0,
      titleNameId: testData.id,
      remark: 'for test'
    }
  ]
  await entity.Employee.bulkCreate(mockupEmployee)
})

afterAll(async () => {
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  await entity.TitleName.destroy({ where: { updatedBy: 99 } })
})

describe('GET /api/title-name', () => {
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

describe('GET /api/title-name/:titleNameId', () => {
  it('validate input title name id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id is required' })
  })
  it('validate input title name id must be an integer', async () => {
    let req = { params: { titleNameId: '1a' } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id must be an integer' })
  })
  it('search by title name id', async () => {
    const req = { params: { titleNameId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(2)
    expect(keys).toEqual(expect.arrayContaining(['id', 'name']))
  })
  it('search by title name id not exists', async () => {
    const req = { params: { titleNameId: 999999 } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_title_name', message: 'There is not exists title name' })
  })
})

describe('POST /api/title-name', () => {
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
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_title_name', message: 'There is exists title name' })
  })

  it('create successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = { name: 'Title New', updatedBy: 99 }
    const result = await controller.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })
    const data = await entity.TitleName.findOne({ where: { name: 'Title New' } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/title-name/:titleNameId', () => {
  it('validate input name required', async () => {
    let req = { user: { id: 99 }, params: { titleNameId: testData.id }, body: {} }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })

  it('update with exists name in other record', async () => {
    let req = { user: { id: 99 }, params: { titleNameId: testData.id }, body: { name: 'Mrs.' } }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_title_name', message: 'There is exists title name' })
  })

  it('update with not exists record', async () => {
    let req = {
      user: { id: 99 },
      params: { titleNameId: 999999 },
      body: { name: 'Update Title New' }
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_title_name', message: 'There is not exists title name' })
  })
  it('update successfully', async () => {
    let req = {
      user: { id: 99 },
      params: { titleNameId: testData.id },
      body: { name: 'Update Title New' }
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.TitleName.findOne({ where: { name: 'Update Title New' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/title-name/:titleNameId', () => {
  it('validate params title name id must be integer', async () => {
    let req = { user: { id: 99 }, params: { titleNameId: '1a' } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id must be an integer' })
  })
  it('delete with not exists record', async () => {
    const req = { user: { id: 99 }, params: { titleNameId: 999999 } }
    const res = util.mockResponse()
    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'not_exists_title_name', message: 'There is not exists title name' })
  })
  it('delete default', async () => {
    const req = { user: { id: 99 }, params: { titleNameId: 1 } }
    const res = util.mockResponse()
    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default title name' })
  })

  it('delete successfully', async () => {
    const req = { user: { id: 99 }, params: { titleNameId: testData.id } }
    const res = util.mockResponse()

    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const recheckRecordCount = await entity.TitleName.count({ where: { id: testData.id } })
    expect(recheckRecordCount).toBe(0)
    const recheckEmployeeCount = await entity.Employee.count({ where: { titleNameId: testData.id } })
    expect(recheckEmployeeCount).toBe(0)
  })
})
