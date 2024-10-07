'use strict'
const { Op } = require('sequelize')

module.exports.getClientIp = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'] || ''
  const ip = forwardedIps.split(',')[0].trim()
  return ip
}

module.exports.FilterSearchString = (allowColumn, body) => {
  let payload = {}
  allowColumn.forEach((key) => {
    if (body[key]) {
      payload[key] = { [Op.like]: body[key] + '%' }
    }
  })
  return payload
}

module.exports.SortColumn = (allowColumn, orderingInput) => {
  let payload = []
  if (orderingInput) {
    orderingInput.split('|').forEach((key) => {
      let _key = key.split(',')[0]
      let ordering = key.split(',')[1]

      if (payload && allowColumn.includes(_key) && (ordering === 'asc' || ordering === 'desc')) {
        payload.push([_key, ordering])
      } else {
        payload = null
      }
    })
  }

  if (payload && payload.length === 0) {
    payload = [['id', 'DESC']]
  }

  return payload
}

module.exports.CompareObject = (object1, object2) => {
  let beforeChange = {}
  let afterChange = {}
  for (const key in object1) {
    if (object1[key] !== object2[key] && object2[key] && !['updatedAt', 'updatedBy', 'createdAt', 'createdBy'].includes(key)) {
      beforeChange[key] = object1[key]
      afterChange[key] = object2[key]
    }
  }
  return { beforeChange, afterChange }
}

module.exports.GenerateUserActivity = (
  userId,
  service,
  targetId,
  action,
  description,
  compare,
  beforeChange = {},
  afterChange = {},
  customCompare
) => {
  let _compare = { beforeChange, afterChange }
  if (compare) {
    if (customCompare) {
      _compare = customCompare(beforeChange, afterChange)
    } else {
      _compare = this.CompareObject(beforeChange, afterChange)
    }
  } else {
    delete _compare.beforeChange.updatedBy
    delete _compare.afterChange.updatedBy
    delete _compare.beforeChange.updatedAt
    delete _compare.afterChange.updatedAt
    delete _compare.beforeChange.createdAt
    delete _compare.afterChange.createdAt
    delete _compare.beforeChange.createdBy
    delete _compare.afterChange.createdBy
  }

  return {
    userId: userId,
    module: process.env.MODULE_NAME || 'unknown',
    service: service || 'unknown',
    targetId: targetId,
    action: action || 'unknown',
    description: description,
    beforeChange: _compare.beforeChange,
    afterChange: _compare.afterChange
  }
}
