var express = require('express');
var router = express.Router();
const common = require('../lib/common')

router.get('/order-list', function(req, res, next) {
  
  res.status(200).json(common.ORDER_LIST);
  //res.render('index', { title: 'Express' });
});

router.get('/pump-count', function(req, res, next) {
  
  var result = Object.keys(common.PUMP_COUNT)
  .filter(key => common.PUMP_COUNT[key].length > 0)
  .reduce((obj, key) => { obj[key] = common.PUMP_COUNT[key]; return obj;}, {});

  res.status(200).json(result);

  //res.render('index', { title: 'Express' });
});

router.get('/cron-index', function(req, res, next) {
  
  res.status(200).json(common.CRON_INDEX);
  //res.render('index', { title: 'Express' });
});

router.get('/markets-csv', function(req, res, next) {
  
  res.status(200).json(common.MARKETS_CSV);
  //res.render('index', { title: 'Express' });
});

router.get('/ask', function(req, res, next) {
  
  const accessKey = process.env.UPBIT_ACCESS_KEY;
  const secretKey = process.env.UPBIT_SECRET_KEY;

  const request = require("request")
  const sign = require("jsonwebtoken").sign
  const queryEncode = require("querystring").encode
  
  const uuidArrays = common.ORDER_LIST.map(elem => elem.uuid);

  const query = queryEncode({ uuids: uuidArrays });
  const payload = {
    access_key: accessKey,
    nonce: (new Date).getTime(),
    query: query
  };
  const token = sign(payload, secretKey);
  
  var options = {
    method: "GET",
    url: "https://api.upbit.com/v1/orders?" + query,
    headers: {Authorization: `Bearer ${token}`}
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
    res.status(200).json(body);
  });
  
});

module.exports = router;
