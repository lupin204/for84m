const schedule = require("node-schedule");
const moment = require('moment');
const request = require('request');
const requestPromise = require('request-promise-native');
const fs = require('fs');
const sign = require("jsonwebtoken").sign
const queryEncode = require("querystring").encode

const common = require('../lib/common')
const constants = require('../lib/constants')
const { ask, bid } = require('../lib/order');
const { findAndRemove } = require('../utils/arrayUtils');
const _union = require('lodash.union');
const _difference = require('lodash.difference');

const accessKey = process.env.UPBIT_ACCESS_KEY;
const secretKey = process.env.UPBIT_SECRET_KEY;

// models
// const Exchange = require('../models/exchange');
// const Market = require('../models/market');
// const Ticker = require('../models/ticker');


/*
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
--> scheduleJob('* * * * * *', function(){
*/
const orderAskJob = schedule.scheduleJob('* */10 * * * *', function(){
  common.ORDER_LIST.forEach(elem => {

    // status:'bid' = 매수 시도
    if (elem.status == 'bid') {
      const query = queryEncode({ uuid: elem.uuid_bid });
      const payload = {
        access_key: accessKey,
        nonce: (new Date).getTime(),
        query: query
      };
      const token = sign(payload, secretKey);
      
      var options = {
        method: "GET",
        url: "https://api.upbit.com/v1/order?" + query,
        headers: {Authorization: `Bearer ${token}`}
      };
  
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const bodyJson = JSON.parse(body);
  
        // state = {"wait":"체결중", "done":"체결완료", "cancel":"주문취소"}
        if (bodyJson.state == "done") {
          ask(bodyJson.market, common.getProfitPrice(Number(bodyJson.price)), bodyJson.volume, bodyJson.uuid);
        }
      })

    // status:'ask' = 매도 시도
    } else if (elem.status == 'ask') {
      const query = queryEncode({ uuid: elem.uuid_ask });
      const payload = {
        access_key: accessKey,
        nonce: (new Date).getTime(),
        query: query
      };
      const token = sign(payload, secretKey);
      
      var options = {
        method: "GET",
        url: "https://api.upbit.com/v1/order?" + query,
        headers: {Authorization: `Bearer ${token}`}
      };
  
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        const bodyJson = JSON.parse(body);
  
        // state = {"wait":"체결중", "done":"체결완료", "cancel":"주문취소"}
        // ask(매도) 후 체결완료(done) 되면 리스트에서 최종삭제
        if (bodyJson.state == "done") {
          findAndRemove(common.ORDER_LIST, 'uuid_ask', bodyJson.uuid);
        }
      })
    }

  })
});

// 매일 18시 0분 40초에 마켓정보 갱신
const updateMarket = schedule.scheduleJob('40 0 18 * * *', function(){

  const requestOption = {
    method: 'GET',
    uri:  'https://api.upbit.com/v1/market/all',
    headers: {"Content-Type":" application/json"},
  };
  requestPromise(requestOption).then((data) => {
    const markets = JSON.parse(data);
    const krwMarkets = markets
      .filter((elem) => elem.market.startsWith('KRW'))
      .map((elem) => elem.market);
      
    const previousMarket = common.MARKETS_CSV.split(',');
    const updatedMarket = _union(previousMarket, krwMarkets);
    common.MARKETS_CSV = updatedMarket;

    // add market of Pump count
    // PUMP_COUNT = {'KRW-BTC':[3,4,7,8,9], 'KRW-NEWCOIN': []}
    const addedMarket = _difference(updatedMarket, previousMarket);
    if (addedMarket.length > 0) {
      addedMarket.forEach(elem => {
        common.PUMPCOUNT[elem] = [];
      })
    }
    
  }).catch((err) => {
    console.error(err)
  })

})


  