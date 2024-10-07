const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/Employee.Controller')

let testData = null

beforeAll(async () => {
  await entity.User.destroy({ where: { activeRemark: 'for test' } })
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  const mockupEmployee = [
    {
      employeeNo: 'EMP100',
      idcardNo: '1234567890123',
      firstNameTH: 'John',
      lastNameTH: 'Doe',
      departmentId: 1,
      genderId: 1,
      branchId: 1,
      titleNameId: 1,
      remark: 'for test'
    },
    {
      employeeNo: 'EMP101',
      idcardNo: '1234567890124',
      firstNameTH: 'Jane',
      lastNameTH: 'Luk',
      departmentId: 1,
      genderId: 2,
      branchId: 1,
      titleNameId: 2,
      remark: 'for test'
    },
    {
      employeeNo: 'EMP102',
      idcardNo: '1234567890125',
      firstNameTH: 'John',
      lastNameTH: 'Smit',
      departmentId: 2,
      genderId: 1,
      branchId: 2,
      titleNameId: 1,
      remark: 'for test'
    }
  ]

  const result = await entity.Employee.bulkCreate(mockupEmployee)
  testData = result[0].dataValues

  const mockupUser = {
    employeeId: testData.id,
    roleId: 1,
    username: 'john',
    password: '1234',
    activeStatus: 'active',
    activeRemark: 'for test'
  }

  await entity.User.create(mockupUser)
})

afterAll(async () => {
  await entity.User.destroy({ where: { activeRemark: 'for test' } })
  await entity.Employee.destroy({ where: { remark: 'for test' } })
})

describe('GET /api/employee', () => {
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
        'employeeNo',
        'firstNameTH',
        'lastNameTH',
        'branchId',
        'branchNameTH',
        'departmentId',
        'departmentName',
        'position',
        'createdAt',
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
  it('search by employee no', async () => {
    expectSearchCondition('employeeNo')
  })
  it('search by department id', async () => {
    expectSearchCondition('departmentId')
  })
  it('search by branch id', async () => {
    expectSearchCondition('branchId')
  })
})

describe('GET /api/employee/:employeeId', () => {
  it('validate input employee id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id is required' })
  })
  it('validate input employee id must be an integer', async () => {
    let req = { params: { employeeId: '1a' } }
    let res = util.mockResponse()
    await controller.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id must be an integer' })
  })
  it('search by employee id not exists', async () => {
    const req = { params: { employeeId: 999999 } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })
  it('search by employee id', async () => {
    const req = { params: { employeeId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(34)
    expect(keys).toEqual(
      expect.arrayContaining([
        'id',
        'image',
        'activeStatus',
        'activeStatusReason',
        'remark',
        'employeeNo',
        'dateOfBirth',
        'genderId',
        'titleNameId',
        'firstNameTH',
        'lastNameTH',
        'firstNameEN',
        'lastNameEN',
        'height',
        'weight',
        'nationalityId',
        'religionId',
        'militaryServiceStatus',
        'bloodTypeId',
        'tel',
        'email',
        'emsContact1',
        'emsContact2',
        'address1',
        'address2',
        'address3',
        'branchId',
        'departmentId',
        'position',
        'idcardNo',
        'idcardExpire',
        'idcardPlace',
        'passportNo',
        'passportExpire'
      ])
    )
  })
})

describe('POST /api/employee', () => {
  const fullPayload = {
    employeeNo: 'EMP999',
    firstNameTH: 'JohnSS',
    lastNameTH: 'DoeSS',
    email: 'test@test.com',
    remark: 'for test',
    genderId: 1,
    titleNameId: 1,
    nationalityId: 1,
    religionId: 1,
    bloodTypeId: 1,
    branchId: 1,
    departmentId: 1
  }
  it('validate input employee no required', async () => {
    let payload = { ...fullPayload }
    delete payload.employeeNo
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee no is required' })
  })
  it('validate input gender id required', async () => {
    let payload = { ...fullPayload }
    delete payload.genderId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'gender id is required' })
  })
  it('validate input gender id must be an integer', async () => {
    let payload = { ...fullPayload, genderId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'gender id must be an integer' })
  })
  it('validate input title name id required', async () => {
    let payload = { ...fullPayload }
    delete payload.titleNameId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id is required' })
  })
  it('validate input title name id must be an integer', async () => {
    let payload = { ...fullPayload, titleNameId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id must be an integer' })
  })
  it('validate input nationality id required', async () => {
    let payload = { ...fullPayload }
    delete payload.nationalityId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'nationality id is required' })
  })
  it('validate input nationality id must be an integer', async () => {
    let payload = { ...fullPayload, nationalityId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'nationality id must be an integer' })
  })
  it('validate input religion id required', async () => {
    let payload = { ...fullPayload }
    delete payload.religionId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'religion id is required' })
  })
  it('validate input religion id must be an integer', async () => {
    let payload = { ...fullPayload, religionId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'religion id must be an integer' })
  })
  it('validate input blood type id required', async () => {
    let payload = { ...fullPayload }
    delete payload.bloodTypeId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'blood type id is required' })
  })
  it('validate input blood type id must be an integer', async () => {
    let payload = { ...fullPayload, bloodTypeId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'blood type id must be an integer' })
  })
  it('validate input branch id required', async () => {
    let payload = { ...fullPayload }
    delete payload.branchId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id is required' })
  })
  it('validate input branch id must be an integer', async () => {
    let payload = { ...fullPayload, branchId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id must be an integer' })
  })
  it('validate input department id required', async () => {
    let payload = { ...fullPayload }
    delete payload.departmentId
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id is required' })
  })
  it('validate input department id must be an integer', async () => {
    let payload = { ...fullPayload, departmentId: '1a' }
    let req = { body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id must be an integer' })
  })
  it('create with exists employee no', async () => {
    let payload = { ...fullPayload, employeeNo: testData.employeeNo }
    let req = { user: { id: 1 }, body: payload }
    let res = util.mockResponse()
    await controller.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_employee_no', message: 'There is exists employee no' })
  })
  it('create successfully', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = fullPayload
    const result = await controller.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })
    const data = await entity.Employee.findOne({ where: { employeeNo: 'EMP999' } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/employee', () => {
  const fullPayload = {
    employeeNo: 'EMP888',
    firstNameTH: 'JohnSS',
    lastNameTH: 'DoeSS',
    email: 'test@test.com',
    remark: 'for test',
    genderId: 1,
    titleNameId: 1,
    nationalityId: 1,
    religionId: 1,
    bloodTypeId: 1,
    branchId: 1,
    departmentId: 1
  }

  it('validate params employee id must be integer', async () => {
    let req = { user: { id: 99 }, params: { employeeId: '1a' }, body: fullPayload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id must be an integer' })
  })

  it('validate input employee no required', async () => {
    let payload = { ...fullPayload }
    delete payload.employeeNo
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee no is required' })
  })
  it('validate input gender id required', async () => {
    let payload = { ...fullPayload }
    delete payload.genderId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'gender id is required' })
  })
  it('validate input gender id must be an integer', async () => {
    let payload = { ...fullPayload, genderId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'gender id must be an integer' })
  })
  it('validate input title name id required', async () => {
    let payload = { ...fullPayload }
    delete payload.titleNameId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id is required' })
  })
  it('validate input title name id must be an integer', async () => {
    let payload = { ...fullPayload, titleNameId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'title name id must be an integer' })
  })
  it('validate input nationality id required', async () => {
    let payload = { ...fullPayload }
    delete payload.nationalityId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'nationality id is required' })
  })
  it('validate input nationality id must be an integer', async () => {
    let payload = { ...fullPayload, nationalityId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'nationality id must be an integer' })
  })
  it('validate input religion id required', async () => {
    let payload = { ...fullPayload }
    delete payload.religionId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'religion id is required' })
  })
  it('validate input religion id must be an integer', async () => {
    let payload = { ...fullPayload, religionId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'religion id must be an integer' })
  })
  it('validate input blood type id required', async () => {
    let payload = { ...fullPayload }
    delete payload.bloodTypeId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'blood type id is required' })
  })
  it('validate input blood type id must be an integer', async () => {
    let payload = { ...fullPayload, bloodTypeId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'blood type id must be an integer' })
  })
  it('validate input branch id required', async () => {
    let payload = { ...fullPayload }
    delete payload.branchId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id is required' })
  })
  it('validate input branch id must be an integer', async () => {
    let payload = { ...fullPayload, branchId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'branch id must be an integer' })
  })
  it('validate input department id required', async () => {
    let payload = { ...fullPayload }
    delete payload.departmentId
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id is required' })
  })
  it('validate input department id must be an integer', async () => {
    let payload = { ...fullPayload, departmentId: '1a' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id must be an integer' })
  })
  it('update with exists employee no', async () => {
    let payload = { ...fullPayload, employeeNo: 'EMP101' }
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: payload }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_employee_no', message: 'There is exists employee no' })
  })

  it('update with not exists record', async () => {
    let req = {
      user: { id: 1 },
      params: { employeeId: 999999 },
      body: fullPayload
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })

  it('update successfully', async () => {
    let req = { user: { id: 1 }, params: { employeeId: testData.id }, body: fullPayload }
    let res = util.mockResponse()
    req.body.employeeNo = 'EMP555'
    const result = await controller.Update(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Employee.findOne({ where: { employeeNo: 'EMP555' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/employee/:employeeId', () => {
  it('validate params employee id must be integer', async () => {
    let req = { user: { id: 99 }, params: { employeeId: '1a' } }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'employee id must be an integer' })
  })
  it('delete with not exists record', async () => {
    let req = {
      user: { id: 1 },
      params: { employeeId: 999999 }
    }
    let res = util.mockResponse()
    await controller.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_employee', message: 'There is not exists employee' })
  })
  it('delete successfully', async () => {
    const req = { user: { id: 99 }, params: { employeeId: testData.id } }
    const res = util.mockResponse()

    const resultDeleted = await controller.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const recheckRecordCount = await entity.Employee.count({ where: { id: testData.id } })
    expect(recheckRecordCount).toBe(0)
    const recheckUser = await entity.User.count({ where: { employeeId: testData.id } })
    expect(recheckUser).toBe(0)
  })
})
