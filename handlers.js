const { handleCreate } = require('./handlers/create.js');
const { handleEnroll } = require('./handlers/enroll.js');
const { handleInit } = require('./handlers/init.js');
const { handleInvalidCommand } = require('./handlers/invalidCommand.js');
const { handleSubmit } = require('./handlers/submit.js');
const { handleView } = require('./handlers/view.js');

module.exports = {
    handleCreate,
    handleEnroll,
    handleInit,
    handleView,
    handleSubmit,
    handleInvalidCommand
};