const request = require('supertest')
const app = require('./_app')
const user = require('./_user')

const SignIn = async (selectedUser) => {
  const response = await request(app).post('/api/sign-in').send(user[selectedUser])

  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('code')
  expect(response.body.code).toBe('login_success')

  return response
}

const mockRequest = () => {
  const req = {}
  req.body = jest.fn().mockReturnValue(req)
  req.query = jest.fn().mockReturnValue(req)
  req.params = jest.fn().mockReturnValue(req)
  return req
}

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

module.exports = {
  SignIn,
  mockRequest,
  mockResponse
}
