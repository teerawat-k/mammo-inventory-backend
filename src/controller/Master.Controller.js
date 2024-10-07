const entity = require('../entity')
const { logger } = require('../utils')

module.exports.ProductCategory = async (req, res) => {
  try {
    res.send({ isError: false, body: 'data' })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
