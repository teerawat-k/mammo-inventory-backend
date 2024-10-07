const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const departmentController = require('../controller/Department.Controller')

let testData = null
let parentId = null

beforeAll(async () => {
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  await entity.Department.destroy({ where: { updatedBy: 99 } })
  const mockupParentDepartments = [
    {
      parentId: 0,
      code: 'COM100',
      name: 'Computer',
      updatedBy: 99
    },
    {
      parentId: 0,
      code: 'HR100',
      name: 'Human Resource',
      updatedBy: 99
    }
  ]
  const resultParent = await entity.Department.bulkCreate(mockupParentDepartments)
  const mockupDepartments = [
    {
      parentId: resultParent[0].id,
      code: 'COM110',
      name: 'Software',
      updatedBy: 99
    },
    {
      parentId: resultParent[0].id,
      code: 'COM120',
      name: 'Hardware',
      updatedBy: 99
    },
    {
      parentId: resultParent[1].id,
      code: 'HR110',
      name: 'Recruitment',
      updatedBy: 99
    },
    {
      parentId: resultParent[1].id,
      code: 'HR120',
      name: 'Training',
      updatedBy: 99
    }
  ]
  const resultDepartment = await entity.Department.bulkCreate(mockupDepartments)
  const mockupSubDepartments = [
    {
      parentId: resultDepartment[0].id,
      code: 'COM111',
      name: 'Java',
      updatedBy: 99
    },
    {
      parentId: resultDepartment[0].id,
      code: 'COM112',
      name: 'DotNet',
      updatedBy: 99
    }
  ]
  const resultSubDepartment = await entity.Department.bulkCreate(mockupSubDepartments)
  testData = resultParent[0]

  parentId = resultParent[0].id
  departmentId = resultDepartment[0].id
  subDepartmentId = resultSubDepartment[0].id

  const mockupEmployee = [
    {
      code: 'EMP100',
      name: 'John',
      genderId: 0,
      titleNameId: 0,
      departmentId: resultParent[0].id,
      remark: 'for test'
    },
    {
      code: 'EMP200',
      name: 'Jane',
      genderId: 0,
      titleNameId: 0,
      departmentId: resultDepartment[1].id,
      remark: 'for test'
    },
    {
      code: 'EMP300',
      name: 'Jim',
      genderId: 0,
      titleNameId: 0,
      departmentId: resultSubDepartment[0].id,
      remark: 'for test'
    }
  ]
  await entity.Employee.bulkCreate(mockupEmployee)
})

afterAll(async () => {
  await entity.Employee.destroy({ where: { remark: 'for test' } })
  await entity.Department.destroy({ where: { updatedBy: 99 } })
})

describe('GET /api/department', () => {
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
    const resultSearch = await departmentController.Search(req, res)
    const responseSearch = resultSearch.json.mock.calls[0][0]
    expectResponse(responseSearch)
    responseSearch.body.forEach((data) => {
      expect(data[column]).toBe(testData[column])
    })
  }
  it('validate input pageNo required', async () => {
    const req = { query: { pageSize: 50 } }
    const res = util.mockResponse()
    await departmentController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no is required' })
  })
  it('validate input pageNo must be an integer', async () => {
    const req = { query: { pageNo: 'abc', pageSize: 50 } }
    const res = util.mockResponse()
    await departmentController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page no must be an integer' })
  })
  it('validate input pageSize required', async () => {
    const req = { query: { pageNo: 1 } }
    const res = util.mockResponse()
    await departmentController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size is required' })
  })
  it('validate input pageSize must be an integer', async () => {
    const req = { query: { pageNo: 1, pageSize: 'abc' } }
    const res = util.mockResponse()
    await departmentController.Search(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'page size must be an integer' })
  })
  it('raw search', async () => {
    const req = { query: { pageNo: 1, pageSize: 50 } }
    const res = util.mockResponse()
    const result = await departmentController.Search(req, res)
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

describe('GET /api/department/:departmentId', () => {
  it('validate input department id required', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    await departmentController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id is required' })
  })
  it('validate input department id must be an integer', async () => {
    let req = { params: { departmentId: '1a' } }
    let res = util.mockResponse()
    await departmentController.SearchDetail(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id must be an integer' })
  })
  it('search by department id', async () => {
    const req = { params: { departmentId: testData.id } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await departmentController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(3)
    expect(keys).toEqual(expect.arrayContaining(['id', 'code', 'name']))
  })
  it('search by department id not exists', async () => {
    const req = { params: { departmentId: 999999 } }
    const res = util.mockResponse()
    const resultSearchByBranchId = await departmentController.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toEqual({ code: 'not_exists_department', message: 'There is not exists department' })
  })
})

describe('POST /api/department', () => {
  it('validate input parent id required', async () => {
    let req = { body: { name: 'DEP-01', code: 'DEP-01' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'parent id is required' })
  })
  it('validate input parent id must be an integer', async () => {
    let req = { body: { parentId: 'abc', name: 'DEP-01', code: 'DEP-01' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'parent id must be an integer' })
  })
  it('validate input code required', async () => {
    let req = { body: { parentId: 1, name: 'DEP-01' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })
  })
  it('validate input name required', async () => {
    let req = { body: { parentId: 1, code: 'DEP-01' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })
  it('create department with exists code', async () => {
    let req = { body: { parentId: testData.id, name: testData.name, code: testData.code } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_department_code', message: 'There is exists department code' })
  })
  it('create department', async () => {
    let req = util.mockRequest()
    let res = util.mockResponse()
    req.user = { id: 1 }
    req.body = {
      parentId: testData.id,
      code: 'DEP-01',
      name: 'DEP-01',
      updatedBy: 99
    }

    const result = await departmentController.Create(req, res)
    const responseCreated = result.json.mock.calls[0][0]
    expect(responseCreated).toEqual({ code: 'create_success', message: 'Create successfully' })

    const data = await entity.Department.findOne({ where: { code: 'DEP-01' } })
    expect(data).not.toBeNull()
  })
})

describe('PUT /api/department/:departmentId', () => {
  it('validate input parent id required', async () => {
    let req = { user: { id: 99 }, params: { departmentId: testData.id }, body: { name: 'DEP-55', code: 'DEP-55' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'parent id is required' })
  })
  it('validate input parent id must be an integer', async () => {
    let req = { user: { id: 99 }, params: { departmentId: testData.id }, body: { parentId: 'abc', name: 'DEP-55', code: 'DEP-55' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'parent id must be an integer' })
  })
  it('validate input code required', async () => {
    let req = { user: { id: 99 }, params: { departmentId: testData.id }, body: { parentId: 1, name: 'DEP-55' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'code is required' })
  })
  it('validate input name required', async () => {
    let req = { user: { id: 99 }, params: { departmentId: testData.id }, body: { parentId: 1, code: 'DEP-55' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'name is required' })
  })

  it('update department with exists code in other record', async () => {
    let req = { user: { id: 99 }, params: { departmentId: testData.id }, body: { parentId: parentId, code: 'HR110', name: 'DEP-55' } }
    let res = util.mockResponse()
    await departmentController.Create(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'exists_department_code', message: 'There is exists department code' })
  })

  it('update department with not exists record', async () => {
    let req = {
      user: { id: 99 },
      params: { departmentId: 999999 },
      body: {
        parentId: testData.id,
        code: 'DEP-55',
        name: 'DEP-55'
      }
    }
    let res = util.mockResponse()
    await departmentController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'not_exists_department', message: 'There is not exists department' })
  })
  it('update department', async () => {
    let req = {
      user: { id: 99 },
      params: { departmentId: testData.id },
      body: {
        parentId: testData.id,
        code: 'DEP-55',
        name: 'DEP-55'
      }
    }
    let res = util.mockResponse()
    await departmentController.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Department.findOne({ where: { code: 'DEP-55' } })
    expect(data).not.toBeNull()
  })
})

describe('DELETE /api/department/:departmentId', () => {
  it('validate params department id must be integer', async () => {
    let req = { user: { id: 99 }, params: { departmentId: '1a' } }
    let res = util.mockResponse()
    await departmentController.Delete(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'validate_error', message: 'department id must be an integer' })
  })
  it('delete department not exists department id', async () => {
    const req = { user: { id: 99 }, params: { departmentId: 999999 } }
    const res = util.mockResponse()
    const resultDeleted = await departmentController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'not_exists_department', message: 'There is not exists department' })
  })
  it('delete default department', async () => {
    const req = { user: { id: 99 }, params: { departmentId: 1 } }
    const res = util.mockResponse()
    const resultDeleted = await departmentController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'cant_delete_default', message: 'You can not delete default department' })
  })

  it('delete department', async () => {
    const req = { user: { id: 99 }, params: { departmentId: parentId } }
    const res = util.mockResponse()

    let recursiveId = []

    const getSubDepartmentsRecursive = async (id) => {
      const subDepartment = await entity.Department.findAll({ attributes: ['id', 'parentId', 'name'], where: { parentId: id } })
      if (recursiveId.includes(id)) return
      recursiveId.push(id)
      let arr = []
      for (let i = 0; i < subDepartment.length; i++) {
        arr.push(subDepartment[i].id)
        const sub = await getSubDepartmentsRecursive(subDepartment[i].id)
        arr = arr.concat(sub)
      }
      return [...new Set(arr)]
    }

    await getSubDepartmentsRecursive(parentId)

    const resultDeleted = await departmentController.Delete(req, res)
    const responseDeleted = resultDeleted.json.mock.calls[0][0]
    expect(responseDeleted).toEqual({ code: 'delete_success', message: 'Delete successfully' })

    const recheckDepartment = await entity.Department.count({ where: { id: { [Op.in]: recursiveId } } })
    expect(recheckDepartment).toBe(0)
    const recheckEmployee = await entity.Employee.count({ where: { departmentId: { [Op.in]: recursiveId } } })
    expect(recheckEmployee).toBe(0)
  })
})
