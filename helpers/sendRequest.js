const axios = require('axios')
const config = require('../config.json')

async function sendRequest (reqData) {
    const request = {
        method: 'post',
        url: config.HARPER_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: config.HARPER_AUTH
        },
        data: reqData
    }

    const response = await axios(request)
    return response
}

function syncRequest (reqData) {
    const request = {
        method: 'post',
        url: config.HARPER_URL,
        headers: {
            'Content-Type': 'application/json',
            Authorization: config.HARPER_AUTH
        },
        data: reqData
    }

    return axios(request)
}

module.exports = { sendRequest, syncRequest }
