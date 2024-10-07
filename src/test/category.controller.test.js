const util = require('./_util')
const entity = require('../entity')
const categoryController = require('../controller/Category.Controller')

let testData = null

beforeAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
  await entity.Category.destroy({ where: { updatedBy: 99 } })
  const mockData = [
    {
      code: 'CT001',
      name: 'Category test 001',
      updatedBy: 99
    },
    {
      code: 'CT002',
      name: 'Category test 002',
      updatedBy: 99
    }
  ]
  const result = await entity.Category.bulkCreate(mockData)
  testData = result[0].dataValues

  const mockProduct = {
    code: 'PD001',
    name: 'Product test 001',
    categoryId: testData.id,
    remark: 'for test'
  }
  await entity.Product.create(mockProduct)
})

afterAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
  await entity.Category.destroy({ where: { updatedBy: 99 } })
})

describe('GET /api/category', () => {
  const expectResponse = (response) => {
    expect(response).toHaveProperty('totalRow')
    expect(response).toHaveProperty('body')

    expect(typeof response.totalRow).toBe('number')
    expect(Array.isArray(response.body)).toBe(true)

    expect(response.totalRow).toBeGreaterThanOrEqual(1)

    const keys = Object.keys(response.body[0])
    expect(keys).toHaveLength(3)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'name']))
  }
  const expectSearchCondition = async (column) => {
    const req = { query: { [column]: testData[column], pageNo: 1, pageSize: 50 } }
    const res = util.mockResponse()
    const resultSearch = await categoryController.Search(req, res)
    const responseSearch = resultSearch.json.mock.calls[0][0]
    expectResponse(responseSearch)
    responseSearch.body.forEach((data) => {
      expect(data[column]).toBe(testData[column])
    })
  }

  it('validate input pageNo required', async () => {
    const req = { query: { pageSize: 50 } }
    const res = util.mockResponse()
    await categoryController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no is required' })
  })
  it('validate input pageNo must be an integer', async () => {
    const req = { query: { pageNo: 'abc', pageSize: 50 } }
    const res = util.mockResponse()
    await categoryController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no must be an integer' })
  })
  it('validate input pageSize required', async () => {
    const req = { query: { pageNo: 1 } }
    const res = util.mockResponse()
    await categoryController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size is required' })
  })
  it('validate input pageSize must be an integer', async () => {
    const req = { query: { pageNo: 1, pageSize: 'abc' } }
    const res = util.mockResponse()
    await categoryController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size must be an integer' })
  })
  it('raw search', async () => {
    const req = { query: { pageNo: 1, pageSize: 50 } }
    const res = util.mockResponse()
    const result = await categoryController.Search(req, res)
    responseSearch = result.json.mock.calls[0][0]
    expectResponse(responseSearch)
  })
  it('search by code', async () => {
    expectSearchCondition('code')
  })
  it('search by name', async () => {
    expectSearchCondition('name')
  })
})
describe('GET /api/category/:categoryId', () => {
  it('validate input category id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await categoryController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id is required' })
  })
  it('validate input category id must be an integer', async () => {
    let req = { params: { categoryId: '1a' } }
    let res = util.mockResponse()
    await categoryController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id must be an integer' })
  })
  it('search by category id', async () => {
    const req = { params: { categoryId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await categoryController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(3)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'name']))
  })
  it('search by category id not exists', async () => {
    const req = { params: { categoryId: 999999 } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await categoryController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_category', message: 'There is not exists category' })
  })
})
describe('POST /api/category', () => {
  it('validate input code required', async () => {
    let req = { body: { name: testData.name } }
    let res = util.mockResponse()
    await categoryController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })
  })
  it('validate input name required', async () => {
    let req = { body: { code: testData.code } }
    let res = util.mockResponse()
    await categoryController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('create category with exists code', async () => {
    let req = { body: { code: testData.code, name: testData.name } }
    let res = util.mockResponse()
    await categoryController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_category_code', message: 'There is exists category code' })
  })
  it('create category', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = {
      code: 'CT003',
      name: 'Category test 003',
      updatedBy: 99
    }

    const result = await categoryController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })

    const data = await entity.Category.findOne({ where: { code: 'CT003' } })
    expect(data).not.toBeNull()
  })
})
describe('PUT /api/category/:categoryId', () => {
  it('validate input code required', async () => {
    let req = { user: { id: 99 }, params: { categoryId: testData.id }, body: { name: testData.name } }
    let res = util.mockResponse()
    await categoryController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })
  })
  it('validate input name required', async () => {
    let req = { user: { id: 99 }, params: { categoryId: testData.id }, body: { code: testData.code } }
    let res = util.mockResponse()
    await categoryController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('update product with exists code in another category', async () => {
    let req = { user: { id: 99 }, params: { categoryId: testData.id }, body: { code: 'CT002', name: 'Category test NEW' } }
    let res = util.mockResponse()
    await categoryController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_category_code', message: 'There is exists category code' })
  })
  it('update category with not exists category id', async () => {
    let req = { user: { id: 99 }, params: { categoryId: 999999 }, body: { code: 'CT003', name: 'Category test 003' } }
    let res = util.mockResponse()
    await categoryController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_category', message: 'There is not exists category' })
  })
  it('update category', async () => {
    let req = { user: { id: 99 }, params: { categoryId: testData.id }, body: { code: 'CT-NEW', name: 'Category test NEW' } }
    let res = util.mockResponse()
    await categoryController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Category.findOne({ where: { code: 'CT-NEW' } })
    expect(data).not.toBeNull()
  })
})
describe('DELETE /api/category/:categoryId', () => {
  it('validate params category id must be integer', async () => {
    let req = { user: { id: 99 }, params: { categoryId: '1a' } }
    let res = util.mockResponse()
    await categoryController.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id must be an integer' })
  })
  it('delete category not exists category id', async () => {
    const req = { user: { id: 99 }, params: { categoryId: 999999 } }
    const res = util.mockResponse()
    const resultDeleted = await categoryController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'not_exists_category', message: 'There is not exists category' })
  })
  it('delete default category', async () => {
    const req = { user: { id: 99 }, params: { categoryId: 1 } }
    const res = util.mockResponse()
    const resultDeleted = await categoryController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default category' })
  })
  it('delete category', async () => {
    const req = { user: { id: 99 }, params: { categoryId: testData.id } }
    const res = util.mockResponse()
    const resultDeleted = await categoryController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]

    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })
    const record = await entity.Product.findOne({ where: { categoryId: testData.id } })
    expect(record).toBeNull()
  })
})
