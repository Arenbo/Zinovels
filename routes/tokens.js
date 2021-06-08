var express = require('express');
var router = express.Router();

const axios = require('axios');
const { Zilliqa } = require('@zilliqa-js/zilliqa');
const zilliqaMainnet = 'https://api.zilliqa.com';

/* GET users listing. */
router.get('/', function(req, res, next) {
	// https://zinovels.com/tokens/mainnet/zil1yq7vda8ryfhl3s8askm3t7qpmqrh3nz3vlj2p9/5
  res.send('respond with a resource');
});


router.get('/:provider/:adr/:id', function(req, res, next) {
  let provider = '';
  if (req.params.provider=='mainnet') {
    provider = zilliqaMainnet
  } else {
    provider = zilliqaMainnet
  }
  let adr = req.params.adr;
  let id = req.params.id;


  const zilliqa = new Zilliqa(provider);
  const contract = zilliqa.contracts.at(adr);

  let idsArr = [];
  idsArr.push(id);

  (async () => {
    try {
      let state3 = await contract.getSubState('token_uris', idsArr);
      let uriArr = Object.values(state3.token_uris);
      let url = uriArr[0];

      if (url.endsWith('.png') || url.endsWith('.jpg')) {
      // if not a json - but image (check ,jpg or .png in the end) - send url
        res.json({ status: 'ok', imageUrl: url, name: '', data: {} });
      } else {
        axios.get(url)
        .then(response => {
          res.json({ status: 'ok', url: url, imageUrl: response.data.image, name: response.data.name, data: response.data });
          // res.json({ data: response.data, url: response.data.url })
        })
        .catch(error => {
          res.json({ status: 'ok', error: error })
        });
      }
    } catch (e) {
      res.json({ status: 'error', error: e })
      console.log(e);
    } finally {
    }
  })();
});

module.exports = router;
