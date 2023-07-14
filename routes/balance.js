const express = require('express');
const request = require('request');
const router = express.Router();

const sign = require("jsonwebtoken").sign
const queryEncode = require("querystring").encode
const constants = require('../lib/constants');


/* GET all markets */
router.get(['/balance'], function(req, res, next) {

  const accessKey = process.env.UPBIT_ACCESS_KEY;
  const secretKey = process.env.UPBIT_SECRET_KEY;

  const payload = {access_key: accessKey, nonce: (new Date).getTime()};
  const token = sign(payload, secretKey);

  var options = {
    method: "GET",
    url: "https://api.upbit.com/v1/accounts",
    headers: {Authorization: `Bearer ${token}`}
  };

  request(options, function (error, response, body) {
    if (error) res.status(500).json({message: '500 error'})

    const balance = JSON.parse(body);
    const realBalance = balance
      .filter(elem => !constants.IGNORE_BALANCE_CURRENCY.includes(elem.currency))
      .forEach(elem => {
          elem.avg_buy_price = Number(elem.avg_buy_price);
          elem.avg_krw_buy_price = Number(elem.avg_krw_buy_price);
          elem.balance = Number(elem.balance);
          elem.locked = Number(elem.locked);
      })
    res.status(200).json(realBalance);
  });


});



module.exports = router;
