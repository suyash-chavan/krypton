const axios = require('axios');
const config = require('../config.json');

async function sendRequest(reqData){
    var request = {
        method: 'post',
        url: config.HARPER_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.HARPER_AUTH
        },
        data: reqData
    };
    
    var response = await axios(request);
    return response;
}

module.exports = { sendRequest };