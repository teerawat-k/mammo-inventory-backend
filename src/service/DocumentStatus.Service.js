const entity = require('../entity')

module.exports.GenerateNextStatus = async (data) => {
  if (!Array.isArray(data) && !typeof data === 'object') {
    throw new Error('[DocumentStatus.Service][GenerateNextStatus] : Data must be an array or object')
  }

  const isArray = Array.isArray(data)
  const documentStatus = await entity.DocumentStatus.findAll()

  if (!isArray) {
    data = [data]
  }

  const _result = data.map((item) => {
    // If there is no documentStatusId, then return the default data
    if (!item.documentStatusId) item

    const recordDocumentStatus = documentStatus.find((status) => status.id == item.documentStatusId)

    item.nextDocumentStatus = []
    if (recordDocumentStatus && recordDocumentStatus.next && recordDocumentStatus.next.length > 0) {
      recordDocumentStatus.next.map((next) => {
        const _nextStatus = documentStatus.find((status) => status.code == next)
        if (_nextStatus) {
          item.nextDocumentStatus = [...item.nextDocumentStatus, { id: _nextStatus.id, code: _nextStatus.code, name: _nextStatus.name, exten: _nextStatus.exten }]
        }
      })
    }

    return item
  })

  return isArray ? _result : _result[0]
}
