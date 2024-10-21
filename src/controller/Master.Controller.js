const entity = require('../entity')
const { logger, utils } = require('../utils')

module.exports.Warehouse = async (req, res) => {
  try {
    // Search employee by condition
    const body = req.query
    const displayColumn = ['id', 'isHeadquarter', 'code', 'name', 'tel', 'email', 'address', 'googleMap']
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })

    const result = await entity.Warehouse.findAll({
      attributes: displayColumn,
      where: whereCondition,
      order: sortCondition
    })
    res.send({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}

module.exports.WarehouseStorage = async (req, res) => {
  try {
    // Search employee by condition
    const body = req.query
    const displayColumn = ['id', 'warehouseId', 'code', 'name', 'description']
    const whereCondition = utils.FilterSearchString(displayColumn, body)
    const sortCondition = utils.SortColumn(displayColumn, body.ordering)
    if (!sortCondition) return res.json({ isError: true, message: 'Some ordering column is not allow' })

    const result = await entity.WarehouseStorage.findAll({
      attributes: displayColumn,
      where: whereCondition,
      order: sortCondition
    })
    res.send({ isError: false, body: result })
  } catch (error) {
    logger.error(error)
    return res.status(500).json({ isError: true, message: 'Something wrong, please try again later' })
  }
}
