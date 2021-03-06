const { handleCreate } = require('./handlers/create.js')
const { handleEnroll } = require('./handlers/enroll.js')
const { handleInit } = require('./handlers/init.js')
const { handleInvalidCommand } = require('./handlers/invalidCommand.js')
const { handleSubmit } = require('./handlers/submit.js')
const { handleView } = require('./handlers/view.js')
const { handleHelp } = require('./handlers/help.js')
const { handleDestroy } = require('./handlers/destroy.js')
const { handleRemove } = require('./handlers/remove.js')
const { handleGet } = require('./handlers/get.js')

module.exports = {
    handleCreate,
    handleEnroll,
    handleInit,
    handleView,
    handleSubmit,
    handleInvalidCommand,
    handleHelp,
    handleDestroy,
    handleRemove,
    handleGet
}
