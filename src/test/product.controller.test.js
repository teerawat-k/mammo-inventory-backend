const util = require('./_util')
const entity = require('../entity')
const productController = require('../controller/Product.Controller')

let testData = null

beforeAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
  const mockupProducts = [
    {
      code: 'TEST-001',
      name: 'test product1',
      barcode: '1234567890',
      description: 'ss',
      remark: 'for test',
      categoryId: 1,
      unitId: 1
    },
    {
      code: 'TEST-002',
      name: 'test product2',
      barcode: '0987654321',
      description: 'dd',
      remark: 'for test',
      categoryId: 2,
      unitId: 2
    }
  ]

  const result = await entity.Product.bulkCreate(mockupProducts)
  testData = result[0].dataValues
})

afterAll(async () => {
  await entity.Product.destroy({ where: { remark: 'for test' } })
})

describe('GET /api/product', () => {
  const expectResponse = (response) => {
    expect(response).toHaveProperty('totalRow')
    expect(response).toHaveProperty('body')

    expect(typeof response.totalRow).toBe('number')
    expect(Array.isArray(response.body)).toBe(true)

    expect(response.totalRow).toBeGreaterThanOrEqual(1)

    const keys = Object.keys(response.body[0])
    expect(keys).toHaveLength(9)
    expect(keys).toEqual(
      expect.arrayContaining(['id', 'imageMain', 'code', 'name', 'description', 'categoryId', 'categoryName', 'unitId', 'unitName'])
    )
  }

  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    // pageNo is required
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no is required' })

    // pageNo must be an integer
    req.query.pageNo = '1a'
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no must be an integer' })

    // pageSize is required
    req.query.pageNo = '1'
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size is required' })

    // pageSize must be an integer
    req.query.pageSize = '1a'
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size must be an integer' })

    // category Id must be an integer
    req.query.pageSize = '50'
    req.query.categoryId = '1a'
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id must be an integer' })

    // unit Id must be an integer
    req.query.categoryId = '1'
    req.query.unitId = '1a'
    await productController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id must be an integer' })
  })

  it('raw search', async () => {
    const req = { query: {} }
    const res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    const result = await productController.Search(req, res)
    responseSearch = result.json.mock.calls[0][0]

    expectResponse(responseSearch)
  })

  it('search with condition', async () => {
    const req = { query: {} }
    const res = util.mockResponse()

    const searchColumn = ['code', 'name', 'categoryId', 'unitId']
    searchColumn.forEach(async (column) => {
      req.query = { pageNo: '1', pageSize: '50' }
      req.query[column] = testData[column]
      const resultSearch = await productController.Search(req, res)
      const responseSearch = resultSearch.json.mock.calls[0][0]
      expectResponse(responseSearch)
      responseSearch.body.forEach((data) => {
        expect(data[column]).toBe(testData[column])
      })
    })
  })

  it('search with ordering desc', async () => {
    const req = { query: {} }
    const res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    req.query.ordering = 'id,desc'

    const resultOrdering = await productController.Search(req, res)
    const responseSearch = resultOrdering.json.mock.calls[0][0]
    expectResponse(responseSearch)
    const sorted = responseSearch.body.map((brach) => brach.id)
    let cid = sorted[0]
    sorted.forEach((id) => {
      expect(id).toBeLessThanOrEqual(cid)
      cid = id
    })
  })

  it('search with ordering asc', async () => {
    const req = { query: {} }
    const res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    req.query.ordering = 'id,asc'

    const resultOrdering = await productController.Search(req, res)
    const responseSearch = resultOrdering.json.mock.calls[0][0]
    expectResponse(responseSearch)
    const sorted = responseSearch.body.map((brach) => brach.id)
    let cid = sorted[0]
    sorted.forEach((id) => {
      expect(id).toBeGreaterThanOrEqual(cid)
      cid = id
    })
  })
})

describe('GET /api/product/:productId', () => {
  it('validate input product id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    await productController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'product id is required' })
  })
  it('validate input product id is not integer', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    req.params.productId = '1a'
    await productController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'product id must be an integer' })
  })

  it('search by product id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.productId = testData.id

    const resultSearchByBranchId = await productController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')

    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(16)
    expect(keys).toEqual(
      expect.arrayContaining([
        'id',
        'categoryId',
        'code',
        'name',
        'barcode',
        'unitId',
        'description',
        'remark',
        'imageMain',
        'image1',
        'image2',
        'image3',
        'image4',
        'image5',
        'image6',
        'image7'
      ])
    )
  })

  it('search by not exists product id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.productId = 999999

    const resultSearchByBranchId = await productController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]

    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_product', message: 'There is not exists product' })
  })
})

describe('POST /api/product', () => {
  it('validate input required name', async () => {
    let req = { body: { categoryId: 1, unitId: 1 } }
    let res = util.mockResponse()
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('validate input category id required', async () => {
    let req = { body: { name: 'test', unitId: 1 } }
    let res = util.mockResponse()
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id is required' })
  })
  it('validate input category id must be integer', async () => {
    let req = { body: { name: 'test', categoryId: '1a', unitId: 1 } }
    let res = util.mockResponse()
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id must be an integer' })
  })
  it('validate input unit id required', async () => {
    let req = { body: { name: 'test', categoryId: 1 } }
    let res = util.mockResponse()
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id is required' })
  })
  it('validate input unit id must be integer', async () => {
    let req = { body: { name: 'test', categoryId: 1, unitId: '1a' } }
    let res = util.mockResponse()
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id must be an integer' })
  })

  it('create product with exists code', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()
    req.body = { code: testData.code, name: 'test', remark: 'for test', categoryId: 1, unitId: 1 }
    const result = await productController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'exists_product_code', message: 'There is already product code' })
  })
  it('create product with not exists category id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()
    req.body = { code: 'TEST-003', name: 'test', remark: 'for test', categoryId: 999999, unitId: 1 }
    const result = await productController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'not_exists_category', message: 'There is not exists category' })
  })
  it('create product with not exists unit id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()
    req.body = { code: 'TEST-003', name: 'test', remark: 'for test', categoryId: 1, unitId: 999999 }
    const result = await productController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'not_exists_unit', message: 'There is not exists unit' })
  })

  it('create product', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.user = { id: 1 }
    req.body = {
      code: 'TEST-003',
      name: 'test',
      barcode: '1234567890',
      description: 'ss',
      remark: 'for test',
      categoryId: 1,
      unitId: 1
    }

    const result = await productController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })

    const data = await entity.Product.findOne({ where: { code: 'TEST-003' } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/product/:productId', () => {
  it('validate params product id must be integer', async () => {
    let req = { user: { id: 1 }, params: { productId: '1a' }, body: { name: 'test', categoryId: 1, unitId: 1 } }
    let res = util.mockResponse()
    await productController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'product id must be an integer' })
  })
  it('validate input required name', async () => {
    let req = { user: { id: 1 }, params: { productId: testData.id }, body: { categoryId: 1, unitId: 1 } }
    let res = util.mockResponse()
    await productController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('validate input required categoryId and categoryId must be integer', async () => {
    let req = { user: { id: 1 }, params: { productId: testData.id }, body: { name: 'test', unitId: 1 } }
    let res = util.mockResponse()
    await productController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id is required' })

    req.body.categoryId = '1a'
    await productController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'category id must be an integer' })
  })
  it('validate input required unitId and unitId must be integer', async () => {
    let req = { user: { id: 1 }, params: { productId: testData.id }, body: { name: 'test', categoryId: 1 } }
    let res = util.mockResponse()
    await productController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'unit id is required' })
  })

  it('update product with exists code in other product', async () => {
    const req = {
      user: { id: 1 },
      params: { productId: testData.id },
      body: { code: testData.code, name: 'test', remark: 'for test', categoryId: 1, unitId: 1 }
    }
    const res = util.mockResponse()
    const result = await productController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'exists_product_code', message: 'There is already product code' })
  })

  it('update product with not exists category id', async () => {
    const req = {
      user: { id: 1 },
      params: { productId: testData.id },
      body: { code: 'TEST-NEW', name: 'test', remark: 'for test', categoryId: 999999, unitId: 1 }
    }
    const res = util.mockResponse()
    const result = await productController.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'not_exists_category', message: 'There is not exists category' })
  })
  it('update product with not exists unit id', async () => {
    const req = {
      user: { id: 1 },
      params: { productId: testData.id },
      body: { code: 'TEST-NEW', name: 'test', remark: 'for test', categoryId: 1, unitId: 999999 }
    }
    const res = util.mockResponse()
    const result = await productController.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'not_exists_unit', message: 'There is not exists unit' })
  })

  it('update product', async () => {
    const req = {
      user: { id: 1 },
      params: { productId: testData.id },
      body: { code: testData.code, name: 'test11111', remark: 'for test', categoryId: 1, unitId: 1 }
    }
    const res = util.mockResponse()
    const result = await productController.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'update_success', message: 'Update successfully' })

    const data = await entity.Product.findOne({ where: { name: 'test11111' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/product/:productId', () => {
  it('validate params product id must be integer', async () => {
    let req = { user: { id: 1 }, params: { productId: '1a' } }
    let res = util.mockResponse()
    await productController.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'product id must be an integer' })
  })

  it('delete product not exists product id', async () => {
    const req = { user: { id: 1 }, params: { productId: 999999 } }
    const res = util.mockResponse()
    const resultDeleted = await productController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'not_exists_product', message: 'There is not exists product' })
  })

  it('delete default product', async () => {
    const req = { user: { id: 1 }, params: { productId: 1 } }
    const res = util.mockResponse()
    const resultDeleted = await productController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default product' })
  })

  it('delete branch', async () => {
    const req = { user: { id: 1 }, params: { productId: testData.id } }
    const res = util.mockResponse()
    const resultDeleted = await productController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })
    const branch = await entity.Branch.findOne({ where: { id: testData.id } })
    expect(branch).toBeNull()
  })
})
