var express = require('express');
var router = express.Router();

const axios = require('axios');
const viewblockAPIKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

router.get('/', function(req, res, next) {
  // example contract just for testing
	let adr = 'zil1cyck4za8yrxryxs6h0mupu5w3j72a3as6e5lqz';
  axios.get('https://api.viewblock.io/v1/zilliqa/addresses/' + adr + '?showTokens=true', {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'X-APIKEY': viewblockAPIKey,
    }
  })
  .then(response => {
    res.json({ status: 'ok', data: response.data, url: response.data.url, explanation: response.data.explanation })
  })
  .catch(error => {
    res.json({ status: 'error', error: error })
  });
});

router.get('/:page/:adr', function(req, res, next) {
  var adr = req.params.adr;
  var page = req.params.page;
  axios.get('https://api.viewblock.io/v1/zilliqa/addresses/' + adr + '?showTokens=true&page=' + page, {
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'X-APIKEY': viewblockAPIKey,
    }
  })
  .then(response => {
    res.json({ status: 'ok', data: response.data, url: response.data.url, explanation: response.data.explanation })
  })
  .catch(error => {
    res.json({ status: 'error', error: error })
  });
});

module.exports = router;
