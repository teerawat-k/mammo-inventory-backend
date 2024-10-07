'use strict'

const { logger } = require('../utils')
const jwt = require('jsonwebtoken')
const entity = require('../entity')

module.exports.AccessSession = async (req, res, next) => {
  try {
    // Check request session
    const session = req.cookies[process.env.SESSION_NAME]
    if (!session) {
      res.clearCookie(process.env.SESSION_NAME)
      return res.status(401).json({ isError: true, message: '(1) Unauthorized, please sign in' })
    }

    jwt.verify(session, process.env.ACCESS_SECRET, async (err, decoded) => {
      if (err) {
        console.log(err);
        res.clearCookie(process.env.SESSION_NAME)
        return res.status(401).json({ isError: true, message: '(2) Unauthorized, please sign in' })
      }

      // check user session in database
      const decodedUser = decoded?.user
      const userSession = await entity.UserSession.findOne({ where: { userId: decodedUser.id, uuid: decoded.uuid } })
      if (!userSession) {
        res.clearCookie(process.env.SESSION_NAME)
        return res.status(401).json({ isError: true, message: '(3) Unauthorized, please sign in' })
      }
      const role = await entity.UserRole.findOne({ where: { id: decodedUser.roleId } })
      if (!role) {
        res.clearCookie(process.env.SESSION_NAME)
        return res.status(401).json({ isError: true, message: '(4) Unauthorized, please sign in' })
      }

      req.user = {
        id: decodedUser.id,
        roleId: decodedUser.roleId,
        roleName: role.name,
        permission: role.permission
      }
      next()
    })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.Permission = (permission) => {
  return async (req, res, next) => {
    try {
      if (permission && !req.user.permission.includes(permission)) {
        return res.status(403).json({ isError: true, message: 'คุณไม่มีสิทธิ์การเข้าใช้งาน (' + permission + ')' })
      }

      next()
    } catch (error) {
      logger.error(error)
      return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
    }
  }
}
