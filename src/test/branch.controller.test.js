const util = require('./_util')
const entity = require('../entity')
const branchController = require('../controller/Branch.Controller')

let testData = null

beforeAll(async () => {
  await entity.Branch.destroy({ where: { address: 'for test' } })
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  const mockupBranch = {
    managerId: null,
    code: 'RM9',
    nameTH: 'พระราม9',
    nameEN: 'RAMA9',
    address: 'for test',
    email: 'rama9@gmail.com',
    officeNumber1: '02-66312404',
    officeNumber2: '02-65245841',
    faxNumber: '02-45618791'
  }

  const result = await entity.Branch.create(mockupBranch)
  testData = result.dataValues

  const mockupEmployee = {
    genderId: 1,
    titleNameId: 1,
    branchId: testData.id,
    remark: 'for test'
  }
  await entity.Employee.create(mockupEmployee)
})

afterAll(async () => {
  await entity.Branch.destroy({ where: { address: 'for test' } })
  await entity.Employee.destroy({ where: { remark: 'for test' } })
})

describe('GET /api/brach', () => {
  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    // pageNo is required
    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no is required' })

    // pageNo must be an integer
    req.query.pageNo = '1a'
    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no must be an integer' })

    // pageSize is required
    req.query.pageNo = '1'
    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size is required' })

    // pageSize must be an integer
    req.query.pageSize = '1a'
    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size must be an integer' })
  })

  it('validate ordering', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    req.query.ordering = 'undefined,desc'

    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'ordering_error', message: 'Some ordering column is not allow' })

    req.query.ordering = 'code,cccc'
    await branchController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'ordering_error', message: 'Some ordering column is not allow' })
  })

  it('raw search', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    const result = await branchController.Search(req, res)
    responseSearch = result.json.mock.calls[0][0]

    expect(responseSearch).toHaveProperty('totalRow')
    expect(responseSearch).toHaveProperty('body')

    expect(typeof responseSearch.totalRow).toBe('number')
    expect(Array.isArray(responseSearch.body)).toBe(true)

    expect(responseSearch.totalRow).toBeGreaterThanOrEqual(2)

    const keys = Object.keys(responseSearch.body[0])
    expect(keys).toHaveLength(8)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'nameTH', 'nameEN', 'address', 'email', 'officeNumber1', 'officeNumber2']))
  })

  it('search with condition', async () => {
    const expectResponse = (response) => {
      expect(response).toHaveProperty('totalRow')
      expect(response).toHaveProperty('body')

      expect(typeof response.totalRow).toBe('number')
      expect(Array.isArray(response.body)).toBe(true)

      expect(response.totalRow).toBeGreaterThanOrEqual(1)

      const keys = Object.keys(response.body[0])
      expect(keys).toHaveLength(8)
      expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'nameTH', 'nameEN', 'address', 'email', 'officeNumber1', 'officeNumber2']))
    }

    const req = util.mockRequest()
    const res = util.mockResponse()

    const searchColumn = ['code', 'nameTH', 'nameEN', 'address', 'email', 'officeNumber1', 'officeNumber2']
    searchColumn.forEach(async (column) => {
      req.query = { pageNo: '1', pageSize: '50' }
      req.query[column] = testData[column]
      const resultSearch = await branchController.Search(req, res)
      const responseSearch = resultSearch.json.mock.calls[0][0]
      expectResponse(responseSearch)
      responseSearch.body.forEach((brach) => {
        expect(brach[column]).toMatch(testData[column])
      })
    })
  })

  it('search with ordering', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.query.pageNo = '1'
    req.query.pageSize = '50'
    req.query.ordering = 'id,desc'

    const resultOrdering = await branchController.Search(req, res)
    const responseSearch = resultOrdering.json.mock.calls[0][0]

    expect(responseSearch).toHaveProperty('totalRow')
    expect(responseSearch).toHaveProperty('body')

    expect(typeof responseSearch.totalRow).toBe('number')
    expect(Array.isArray(responseSearch.body)).toBe(true)

    expect(responseSearch.totalRow).toBeGreaterThanOrEqual(2)

    const keys = Object.keys(responseSearch.body[0])
    expect(keys).toHaveLength(8)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'nameTH', 'nameEN', 'address', 'email', 'officeNumber1', 'officeNumber2']))

    const sorted = responseSearch.body.map((brach) => brach.id)
    let cid = sorted[0]

    sorted.forEach((id) => {
      expect(id).toBeLessThanOrEqual(cid)
      cid = id
    })
  })
})

describe('GET /api/branch/:branchId', () => {
  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    await branchController.SearchByBrachId(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id is required' })

    req.params.branchId = '1a'
    await branchController.SearchByBrachId(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id must be an integer' })
  })

  it('search by branch id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = testData.id

    const resultSearchByBranchId = await branchController.SearchByBrachId(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')

    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(8)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'nameTH', 'nameEN', 'address', 'email', 'officeNumber1', 'officeNumber2']))
  })

  it('search by not exists branch id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = 999999

    const resultSearchByBranchId = await branchController.SearchByBrachId(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]

    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_branch', message: 'There is not exists branch' })
  })
})

describe('POST /api/branch', () => {
  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    await branchController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })

    req.body.code = 'BB'
    req.body.managerId = 'aaa'
    await branchController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'manager id must be an integer' })

    req.body.managerId = 1
    req.body.email = 'awdawd'
    await branchController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'email format is invalid' })
  })

  it('create branch with exists code', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.body = { code: testData.code }
    const result = await branchController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'exists_branch_code', message: 'There is exists branch code' })
  })

  it('create branch with not exists managerId', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.body = { managerId: 2313131, code: testData.code }
    const resultCreated = await branchController.Create(req, res)
    const responseCreated = resultCreated.json.mock.calls[0][0]

    expect(responseCreated).toEqual({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })

  it('create branch', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.user = { id: 1 }
    req.body = {
      managerId: null,
      code: 'PKS',
      nameTH: 'เพชรเกษม',
      nameEN: 'Petchkasem',
      address: 'for test',
      email: 'petchkasem@gmail.com',
      officeNumber1: '02-66312404',
      officeNumber2: '02-65245841',
      faxNumber: '02-45618791'
    }

    const result = await branchController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })

    const branch = await entity.Branch.findOne({ where: { code: 'PKS' } })
    expect(branch).not.toBeNull()
  })
})

describe('PUT /api/branch/:id', () => {
  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    await branchController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id is required' })

    req.params.branchId = '1a'
    await branchController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id must be an integer' })

    req.params.branchId = 1
    await branchController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })

    req.body.code = 'BB'
    req.body.managerId = 'aaa'
    await branchController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'manager id must be an integer' })

    req.body.managerId = 1
    req.body.email = 'awdawd'
    await branchController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'email format is invalid' })
  })

  it('update branch not exists branch id', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = 999999
    req.body = { code: testData.code }
    const resultUpdated = await branchController.Update(req, res)
    const responseUpdated = resultUpdated.json.mock.calls[0][0]
    expect(responseUpdated).toEqual({ code: 'not_exists_branch', message: 'There is not exists branch' })
  })

  it('update branch with exists code in other branch', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = testData.id
    req.body = { code: 'NONE' }
    const resultUpdated = await branchController.Update(req, res)
    const responseUpdated = resultUpdated.json.mock.calls[0][0]
    expect(responseUpdated).toEqual({ code: 'exists_branch_code', message: 'There is exists branch code' })
  })

  it('update branch with not exists managerId', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = testData.id
    req.body = { managerId: 2313131, code: testData.code }
    const resultUpdated = await branchController.Update(req, res)
    const responseUpdated = resultUpdated.json.mock.calls[0][0]
    expect(responseUpdated).toEqual({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })

  it('update branch', async () => {
    const req = util.mockRequest()
    const res = util.mockResponse()

    req.user = { id: 1 }
    req.params.branchId = testData.id
    req.body = {
      managerId: null,
      code: 'BB',
      nameTH: 'บางบอน',
      nameEN: 'Bangbon',
      address: 'for test',
      email: 'bangbon@gmail.com',
      officeNumber1: '02-66312404',
      officeNumber2: '02-65245841',
      faxNumber: '02-45618791'
    }

    const resultUpdated = await branchController.Update(req, res)
    const responseUpdated = resultUpdated.json.mock.calls[0][0]
    expect(responseUpdated).toEqual({ code: 'update_success', message: 'Update successfully' })

    const branch = await entity.Branch.findOne({ where: { id: testData.id , code: req.body.code } })
    expect(branch).not.toBeNull()
  })
})

describe('DELETE /api/branch/:brachId', () => {
  it('validate input', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()

    await branchController.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id is required' })

    req.params.branchId = '1a'
    await branchController.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id must be an integer' })
  })

  it('delete branch not exists branch id', async () => {

    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = 999999
    const resultDeleted = await branchController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]

    expect(responseDeleted).toEqual({ code: 'not_exists_branch', message: 'There is not exists branch' })
  })

  it('delete default branch', async () => {

    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = 1
    const resultDeleted = await branchController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default branch' })
  })

  it('delete branch', async () => {

    const req = util.mockRequest()
    const res = util.mockResponse()

    req.params.branchId = testData.id
    const resultDeleted = await branchController.Delete(req, res)

    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const branch = await entity.Branch.findOne({ where: { id: testData.id } })
    expect(branch).toBeNull()
    const branchEmployee = await entity.Employee.findOne({ where: { branchId: testData.id } })
    expect(branchEmployee).toBeNull()
  })
})
