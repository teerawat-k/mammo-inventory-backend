'use strict'

const Validator = require('validatorjs')
const messageValidator = require('../../config/validation')
Validator.setMessages('th', messageValidator)
Validator.useLang('th')

Validator.register(
  'time',
  function (value, _, __) {
    let time = value.split(':')
    time = `${parseInt(time[0]) >= 10 ? time[0] : '0' + parseInt(time[0])}:${parseInt(time[1]) >= 10 ? time[1] : '0' + parseInt(time[1])}:${
      parseInt(time[2]) >= 10 ? time[2] : '0' + parseInt(time[2])
    }`
    value = time
    return value.match(/(?:[01]\d|2[0123]):(?:[012345]\d):(?:[012345]\d)/)
  },
  ':attribute is not a valid time format'
)

Validator.register(
  'array',
  function (value, _, __) {
    return Array.isArray(value)
  },
  ':attribute is not a valid array'
)

Validator.register(
  'object',
  function (value, _, __) {
    return typeof value === 'object'
  },
  ':attribute is not a valid object'
)

module.exports = (body, rules) => {
  const validate = new Validator(body, rules)

  if (validate.fails()) {
    const message = validate.errors.errors[Object.keys(validate.errors.errors)[0]][0]
    return { status: false, message }
  }

  return { status: true }
}
