const init = require('log4js')
const create = require('log4js')
const destroy = require('log4js')
const enroll = require('log4js')
const submit = require('log4js')
const view = require('log4js')

init.configure({
    appenders: {
        init: { type: 'file', filename: './logs/init.log' }
    },
    categories: {
        default: { appenders: ['init'], level: 'error' }
    }
})

create.configure({
    appenders: {
        create: { type: 'file', filename: './logs/create.log' }
    },
    categories: {
        default: { appenders: ['create'], level: 'error' }
    }
})

enroll.configure({
    appenders: {
        enroll: { type: 'file', filename: './logs/enroll.log' }
    },
    categories: {
        default: { appenders: ['enroll'], level: 'error' }
    }
})

submit.configure({
    appenders: {
        submit: { type: 'file', filename: './logs/submit.log' }
    },
    categories: {
        default: { appenders: ['submit'], level: 'error' }
    }
})

view.configure({
    appenders: {
        view: { type: 'file', filename: './logs/view.log' }
    },
    categories: {
        default: { appenders: ['view'], level: 'error' }
    }
})

destroy.configure({
    appenders: {
        destroy: { type: 'file', filename: './logs/destroy.log' }
    },
    categories: {
        default: { appenders: ['destroy'], level: 'error' }
    }
})

module.exports = { init, create, enroll, submit, view, destroy }
