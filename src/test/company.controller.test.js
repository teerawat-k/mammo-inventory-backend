const util = require('./_util')
const entity = require('../entity')
const { Op } = require('sequelize')
const controller = require('../controller/Company.Controller')

const testData = {
  nameTH: 'บริษัท ก',
  nameEN: 'Company A',
  taxId: '1234567890123',
  email: 'companya@example.com',
  officeNumber1: '0123456789',
  officeNumber2: '0987654321',
  faxNumber: '9876543210'
}

beforeAll(async () => {
  await entity.Company.update(testData, { where: { id: 1 } })
})

afterAll(async () => {
  await entity.Company.update(testData, { where: { id: 1 } })
})

describe('GET /api/company', () => {
  it('search', async () => {
    const req = {}
    const res = util.mockResponse()
    const resultSearchByBranchId = await controller.SearchDetail(req, res)
    const responseSearchByBranchId = resultSearchByBranchId.json.mock.calls[0][0]
    expect(responseSearchByBranchId).toHaveProperty('body')
    const keys = Object.keys(responseSearchByBranchId.body)
    expect(keys).toHaveLength(8)
    expect(keys).toEqual(
      expect.arrayContaining(['id', 'nameTH', 'nameEN', 'taxId', 'email', 'officeNumber1', 'officeNumber2', 'faxNumber'])
    )
  })
})

describe('PUT /api/company', () => {
  it('update successfully', async () => {
    let req = {
      user: { id: 99 },
      body: {
        nameTH: 'บริษัท new',
        nameEN: 'Company new',
        taxId: '1234567890123 a',
        email: 'companya@example.com b',
        officeNumber1: '0123456789 c',
        officeNumber2: '0987654321 d',
        faxNumber: '9876543210 e'
      }
    }
    let res = util.mockResponse()
    await controller.Update(req, res)
    expect(res.json).toHaveBeenCalledWith({ code: 'update_success', message: 'Update successfully' })
    const data = await entity.Company.findOne({
      where: {
        nameTH: 'บริษัท new',
        nameEN: 'Company new',
        taxId: '1234567890123 a',
        email: 'companya@example.com b',
        officeNumber1: '0123456789 c',
        officeNumber2: '0987654321 d',
        faxNumber: '9876543210 e'
      }
    })
    expect(data).not.toBeNull()
  })
})
