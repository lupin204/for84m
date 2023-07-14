const express = require('express');
const request = require('request-promise-native');
const moment = require('moment');
const fs = require('fs')
const path = require('path')
const fileUtils = require('../utils/fileUtils')
const router = express.Router();

const common = require('../lib/common');

/* GET all markets */
router.get(['', '/tickers'], function(req, res, next) {
  const requestOption = {
    method: 'GET',
    uri:  'https://api.upbit.com/v1/ticker?markets=' + common.MARKETS_CSV,
    headers: {"Content-Type":" application/json"},
  };
  request(requestOption)
    .then((data) => {
      res.status(200).json(JSON.parse(data));
    }).catch((err) => {
      console.log(err)
      res.status(500).json({message: '500 error'})
    })
});

router.get('/gap/:coin', function(req, res, next) {
  
  var coin = req.params.coin;
  if (!coin) coin = 'KRW-BTC';
  var from = req.query.from;
  if (!from) { from = moment().add(-1, 'hours').unix() }
  else { from = moment(from, 'YYYYMMDDHH').unix() }
  var to = req.query.to;
  if (!to) { to = moment().unix() }
  else { to = moment(to, 'YYYYMMDDHH').unix() }

  let ticks = [];
  for (var i=from; i<=to; i=i+3600) {
    let fileName = moment.unix(i).format('YYYYMMDDHH');
    let folderPath = path.join(__dirname, '..', 'public', 'json');
    let filePath = 'candle_' + fileName + '.json';
    let isExistsFile = fileUtils.isExistsFile(folderPath, filePath);
    console.log(isExistsFile);
    if (isExistsFile) {
      let hoursData = fs.readFileSync(path.join(folderPath, filePath), 'utf8');
      hoursData = JSON.parse(hoursData).filter(elem => elem.market == coin);
      ticks = ticks.concat(hoursData);
    }
  }
  console.log(ticks[0]);

  ticks.sort((a,b) => {
    return (a.acc_trade_price_24h < b.acc_trade_price_24h) ? -1 : 1;
  })

  var result = [];
  for(var i=0; i<ticks.length; i++) {
    var obj = {
      market: ticks[i].market,
      trade_time_kst: ticks[i].trade_time_kst,
      trade_price: ticks[i].trade_price,
      change: ticks[i].change,
      signed_change_price: ticks[i].signed_change_price,
      signed_change_rate: ticks[i].signed_change_rate,
      trade_volume: ticks[i].trade_volume,
      acc_trade_price_24h: ticks[i].acc_trade_price_24h,
      price_gap_24h: (i==0) ? 0 : ticks[i].acc_trade_price_24h - ticks[i-1].acc_trade_price_24h,
      acc_trade_volume_24h: ticks[i].acc_trade_volume_24h,
      volume_gap_24h: (i==0) ? 0 : ticks[i].acc_trade_volume_24h - ticks[i-1].acc_trade_volume_24h,
      timestamp: moment(ticks[i].timestamp).utcOffset(9).format('HH:mm:ss')
    };
    result.push(obj);
  }



  res.status(200).json(result);
});

router.get('/orderbook/:coin', function(req, res, next) {
  
  var coin = req.params.coin;
  if (!coin) coin = 'KRW-BTC';
  var from = req.query.from;
  if (!from) { from = moment().add(-1, 'hours').unix() }
  else { from = moment(from, 'YYYYMMDDHH').unix() }
  var to = req.query.to;
  if (!to) { to = moment().unix() }
  else { to = moment(to, 'YYYYMMDDHH').unix() }

  let orderbooks = [];
  for (var i=from; i<=to; i=i+3600) {
    let fileName = moment.unix(i).format('YYYYMMDDHH');
    let folderPath = path.join(__dirname, '..', 'public', 'json');
    let filePath = 'order_' + fileName + '.json';
    let isExistsFile = fileUtils.isExistsFile(folderPath, filePath);
    if (isExistsFile) {
      let hoursData = fs.readFileSync(path.join(folderPath, filePath), 'utf8');
      hoursData = JSON.parse(hoursData).filter(elem => elem.market == coin);
      orderbooks = orderbooks.concat(hoursData);
    }
  }

  orderbooks.sort((a,b) => {
    return (a.timestamp < b.timestamp) ? -1 : 1;
  })

  orderbooks.forEach(elem => {
    elem.created = moment(elem.timestamp).format();
  })

  // var result = [];
  // for(var i=0; i<orderbooks.length; i++) {
  //   var obj = {
  //     market: ticks[i].market,
  //     trade_time_kst: ticks[i].trade_time_kst,
  //     trade_price: ticks[i].trade_price,
  //     change: ticks[i].change,
  //     signed_change_price: ticks[i].signed_change_price,
  //     signed_change_rate: ticks[i].signed_change_rate,
  //     trade_volume: ticks[i].trade_volume,
  //     acc_trade_price_24h: ticks[i].acc_trade_price_24h,
  //     price_gap_24h: (i==0) ? 0 : ticks[i].acc_trade_price_24h - ticks[i-1].acc_trade_price_24h,
  //     acc_trade_volume_24h: ticks[i].acc_trade_volume_24h,
  //     volume_gap_24h: (i==0) ? 0 : ticks[i].acc_trade_volume_24h - ticks[i-1].acc_trade_volume_24h,
  //     timestamp: moment(ticks[i].timestamp).utcOffset(9).format('HH:mm:ss')
  //   };
  //   result.push(obj);
  // }



  res.status(200).json(orderbooks);
});



module.exports = router;
