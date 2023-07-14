const schedule = require("node-schedule");
const moment = require('moment');
const request = require('request');
const fs = require('fs');
const common = require('../lib/common')
const constants = require('../lib/constants')
const fileUtils = require('../utils/fileUtils')
const Ticker = require('../models/ticker');
const Orderbook = require('../models/orderbook');
const bot = require('../utils/telegrambot');
const { setComma } = require('../utils/stringUtils');
const { ask, bid } = require('../lib/order');
const { findAndRemove } = require('../utils/arrayUtils');
const _maxby = require('lodash.maxby');

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

//const tickersJob = schedule.scheduleJob('*/10 * * * * *', function(){
const tickersJob = schedule.scheduleJob('* * * * * 1', function(){

  //var arr_krw_markets = 'KRW-BTC';
  const arr_krw_markets = common.MARKETS_CSV;
  const reqUrl = 'https://api.upbit.com/v1/ticker?markets='+arr_krw_markets;
  const now = moment().utcOffset(9).format('YYYY-MM-DD HH:mm');
  const fileName = 'candle_' + moment().utcOffset(9).format('YYYYMMDDHH') + '.json';
  const fullPath = common.CANDLE_SAVED_PATH + '/' + fileName;

  fileUtils.checkFile(fullPath);

  request(reqUrl, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const newJson = JSON.parse(body);
        //console.log("[" + moment().format() + "] " + Object.keys(newJson).length + " tickers is selected");

        try {
          let data = fs.readFileSync(fullPath, 'utf8');
          let json = [];
          if (fileUtils.isJsonString(data)) {
            const oldJson = JSON.parse(data);
            json = json.concat(oldJson, newJson);
          } else {
            json = json.concat(newJson);
          }
  
          const str = JSON.stringify(json);
  
          fs.writeFileSync(fullPath, str, 'utf8');
          //console.log("[" + moment().format() + "] " + "write file success");
        } catch(e) {
          throw e;
        }

      }
  });
});



const orderbookJob = schedule.scheduleJob('*/15 * * * * *', function(){
//const orderbookJob = schedule.scheduleJob('* * 1 * * *', function(){
  
  common.CRON_INDEX += 1;
  const now = moment().format();

  //var arr_krw_markets = 'KRW-BTC';
  const arr_krw_markets = common.MARKETS_CSV;
  const reqUrl = 'https://api.upbit.com/v1/orderbook?markets='+arr_krw_markets;
  //const now = moment().utcOffset(9).format('YYYY-MM-DD HH:mm');
  
  
  
  // 로그 남기기 주석 
  //fileUtils.checkFile(fullPath);
  
  request(reqUrl, (err, res, body) => {
      if (!err && res.statusCode === 200) {
        const newJson = JSON.parse(body);
        //console.log("[" + moment().format() + "] " + Object.keys(newJson).length + " orderbooks is selected");

        // 로그 남기기
        //writeOrderbookFile(newJson);

        let sumAllVolumePrices = 0;
        newJson.forEach((elem) => {
          sumAllVolumePrices += elem.total_bid_size * elem.orderbook_units[0].bid_price;
        })
        const avgAllVolumePrices = Math.round(sumAllVolumePrices / arr_krw_markets.split(',').length);

        if (common.PREV_ORDER.length < 1) {
          common.PREV_ORDER = newJson;
        // ==== START OF LOOP =================================================
        } else {
          newJson.forEach(cur => {
            const prevData = common.PREV_ORDER.find(prev => prev.market == cur.market);
            const curData = cur;
            const askPrice = curData.orderbook_units[0].ask_price;
            const bidPrice = curData.orderbook_units[0].bid_price;

            const riseRate = (((askPrice - prevData.orderbook_units[0].ask_price) / prevData.orderbook_units[0].ask_price)*100).toFixed(2);
            //const askVolume = curData.orderbook_units.reduce((a,b) => ({ask_size: a.ask_size + b.ask_size}))
            const askVolume = curData.total_ask_size;
            const askPriceVolume = curData.total_ask_size * askPrice;
            //const bidVolume = curData.orderbook_units.reduce((a,b) => ({ask_size: a.bid_size + b.bid_size}))
            const bidVolume = curData.total_bid_size;
            const bidPriceVolume = curData.total_bid_size * bidPrice;

            // #1.
            // (x) ask매도 price volume 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
            // bid매수 price volume 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
            // bid매수가 ask매도보다 2배 더 많을때
            // 가격상승 0.5% 이상 체크
            if (bidPriceVolume > avgAllVolumePrices
              && askVolume * 3 < bidVolume
              //&& askPriceVolume > 100000000 && bidPrbidPriceVolumeice > 100000000
              //&& riseRate > 0.5
              ) {
              // 펌핑 인덱스 기록..
              common.PUMP_COUNT[curData.market].push(common.CRON_INDEX);
              // 5회이상 펌핑 인덱스 감지시..
              if (common.PUMP_COUNT[curData.market].length >= constants.MIN_PUMP_COUNT_SEQ_CHECK) {
                // 가장 예전에 기록한 펌핑 인덱스가 최근 크론잡 10회 이내일때.. --> 최근 10회 크론잡 동안 5회 이상 펌핑 시
                if (common.PUMP_COUNT[curData.market][0] >= common.CRON_INDEX - constants.MIN_PUMP_COUNT_CHECK) {
                  
                  const orderMarketList = common.ORDER_LIST.map(elem => elem.market);
                  // market당 1번만 매수. 
                  if (!orderMarketList.includes(curData.market)) {

                    // ask(매수)영역에서 volume이 제일 큰 가격 바로 위 2틱 의 가격을 매수..
                    const priceOfMaxAskVolume = _maxby(curData.orderbook_units, function(obj) { return obj.bid_size }).bid_price;

                    // bid거래 체결
                    setTimeout(function() {
                      bid(curData.market, common.getTickUnitPrice(priceOfMaxAskVolume, 2));
                      //bid(curData.market, common.getTickUnitPrice(askPrice, 0));
                    }, 200)
                    common.PUMP_COUNT[curData.market] = [];   // 해당 마켓 bid거래 후 펌핑감지 초기화.
                    

                    const rtnMsg1 = "[" + moment().utcOffset(9).format('MM-DD HH:mm:ss') + "] Double-Bid (" + common.PUMP_COUNT[curData.market].length + " ticks)\n"
                    + "[" + curData.market + "] " + 'bid 거래체결'
                    //bot.telegrambot.sendMessage(bot.channedId_lupin204usdt, rtnMsg1);

                    const rtnMsg = "[" + moment().utcOffset(9).format('MM-DD HH:mm:ss') + "] Double-Bid (" + common.PUMP_COUNT[curData.market].length + " ticks)\n"
                    + "[" + curData.market + "] " + prevData.orderbook_units[0].bid_price + " => " + curData.orderbook_units[0].bid_price + "\n"
                    + "( " + Math.round(askPriceVolume/10000000) + 'k - ' + Math.round(bidPriceVolume/10000000)+'k / ' + Math.round(sumAllVolumePrices/10000000) + "k )";
                    bot.telegrambot.sendMessage(bot.channedId_lupin204usdt, rtnMsg);
                    
                  } else {
                    // (단, 매수가격에서 10% 이하로 떨어지면 추가매수)

                    // 매수한 가격중 가장 낮은 가격
                    const minBidPriceOfMarket = common.ORDER_LIST
                    .filter(elem => elem.market == curData.market)
                    .sort((a,b) => { return (a.price < b.price) ? 1 : -1; })[0];

                    // 추매 가격 = 매수한 가격중 가장 낮은 가격에서 5% 이상 떡락했을때..
                    const moreBidPrice = minBidPriceOfMarket - minBidPriceOfMarket * constants.PICK_UP_LOWER_PERCENT;

                    if (moreBidPrice > askPrice) {
                      // 추매 bid거래 체결
                      setTimeout(function() {
                        //bid(curData.market, common.getTickUnitPrice(priceOfMaxAskVolume));
                      }, 200)
                      common.PUMP_COUNT[curData.market] = [];   // 해당 마켓 bid거래 후 펌핑감지 초기화.
                      
                    }
                  }


                // 가장 예전 기록 펌핑 인덱스가 최근 10회 크론잡을 벗어날때.. 펌핑이 띄엄띄엄 체크될때..
                // 제일 마지막에 체크된 펌핑 기록을 지우고(shift)..
                } else {
                  common.PUMP_COUNT[curData.market].shift();
                }
              }
                


              
              // save mongo db
              //saveOrderbookDB(prevData, curData);

              /* < send telegram bot message >
              [05-24 16:43:02] dbl-bid
              [KRW-TFUEL] 23.2 => 23.4
              ( 38k - 95k / 1272k )
              */
              // const rtnMsg = "[" + moment().utcOffset(9).format('MM-DD HH:mm:ss') + "] Double-Bid (" + common.PUMP_COUNT[curData.market].length + " ticks)\n"
              // + "[" + curData.market + "] " + prevData.orderbook_units[0].bid_price + " => " + curData.orderbook_units[0].bid_price + "\n"
              // + "( " + Math.round(askPriceVolume/10000000) + 'k - ' + Math.round(bidPriceVolume/10000000)+'k / ' + Math.round(sumAllVolumePrices/10000000) + "k )";
              // bot.telegrambot.sendMessage(bot.channedId_lupin204usdt, rtnMsg);
          

            // #2. 
            // 가격상승 5% 이상 체크
            // bid매수 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
            // bid매수가 ask매도보다 더 많을때
            // 호가창에서 bid매수와 ask매도가 2틱(바로 연결)일때
            } else if (riseRate > 2
              && bidPriceVolume > avgAllVolumePrices
              && askVolume < bidVolume
              && common.getTickUnitPrice(askPrice, -2) <= bidPrice) {


                setTimeout(function() {
                  bid(curData.market, common.getTickUnitPrice(askPrice, 0));
                }, 200)

              /* < send telegram bot message >
              [05-24 16:43:02] 2%-price
              [KRW-TFUEL] 23.2 => 23.4
              ( 38k - 95k / 1272k )
              */
             const rtnMsg = "[" + moment().utcOffset(9).format('MM-DD HH:mm:ss') + "] 5% PUMP\n"
              + "[" + curData.market + "] " + prevData.orderbook_units[0].bid_price + " => " + curData.orderbook_units[0].bid_price + "\n"
              + "( " + Math.round(askPriceVolume/10000000) + 'k - ' + Math.round(bidPriceVolume/10000000)+'k / ' + Math.round(sumAllVolumePrices/10000000) + "k )";
              bot.telegrambot.sendMessage(bot.channedId_lupin204, rtnMsg);

            }

            // save mongo db
            if (common.CRON_INDEX % 4) {
              saveOrderbookDB(prevData, curData);
            }
            
          })
          // ==== END OF LOOP =================================================

        }
      }
  });
});




//==================================================
const writeOrderbookJob = schedule.scheduleJob('5 * * * * *', function(){
    
    const arr_krw_markets = common.MARKETS_CSV;
    const reqUrl = 'https://api.upbit.com/v1/orderbook?markets='+arr_krw_markets;
    
    
    request(reqUrl, (err, res, body) => {
        if (!err && res.statusCode === 200) {
          const newJson = JSON.parse(body);
          //console.log("[" + moment().format() + "] " + Object.keys(newJson).length + " orderbooks is selected");
  
          // 로그 남기기
          //writeOrderbookFile(newJson);
  
          let sumAllVolumePrices = 0;
          newJson.forEach((elem) => {
            sumAllVolumePrices += elem.total_bid_size * elem.orderbook_units[0].bid_price;
          })
          const avgAllVolumePrices = Math.round(sumAllVolumePrices / arr_krw_markets.split(',').length);
  
          if (common.PREV_ORDER.length < 1) {
            common.PREV_ORDER = newJson;
          // ==== START OF LOOP =================================================
          } else {
            newJson.forEach(cur => {
              const prevData = common.PREV_ORDER.find(prev => prev.market == cur.market);
              const curData = cur;
              const askPrice = curData.orderbook_units[0].ask_price;
              const bidPrice = curData.orderbook_units[0].bid_price;
  
              const riseRate = (((askPrice - prevData.orderbook_units[0].ask_price) / prevData.orderbook_units[0].ask_price)*100).toFixed(2);
              //const askVolume = curData.orderbook_units.reduce((a,b) => ({ask_size: a.ask_size + b.ask_size}))
              const askVolume = curData.total_ask_size;
              const askPriceVolume = curData.total_ask_size * askPrice;
              //const bidVolume = curData.orderbook_units.reduce((a,b) => ({ask_size: a.bid_size + b.bid_size}))
              const bidVolume = curData.total_bid_size;
              const bidPriceVolume = curData.total_bid_size * bidPrice;
  
              // #1.
              // (x) ask매도 price volume 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
              // bid매수 price volume 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
              // bid매수가 ask매도보다 2배 더 많을때
              // 가격상승 0.5% 이상 체크
              if (bidPriceVolume > avgAllVolumePrices
                && askVolume * 3 < bidVolume
                //&& askPriceVolume > 100000000 && bidPrbidPriceVolumeice > 100000000
                //&& riseRate > 0.5
                ) {

                // save mongo db
                saveOrderbookDB(prevData, curData);
  
  
              // #2. 
              // 가격상승 5% 이상 체크
              // bid매수 86개 코인 평균 거래량(sumAllVolumePrices) 보다 많을때
              // bid매수가 ask매도보다 더 많을때
              // 호가창에서 bid매수와 ask매도가 2틱(바로 연결)일때
              } else if (riseRate > 2
                && bidPriceVolume > avgAllVolumePrices
                && askVolume < bidVolume
                && common.getTickUnitPrice(askPrice, -2) <= bidPrice) {
  
              }
            })
            // ==== END OF LOOP =================================================
  
          }
        }
    });
  });

const writeOrderbookFile = (newJson) => {
  try {
    const fileName = 'order_' + moment().utcOffset(9).format('YYYYMMDDHH') + '.json';
    const fullPath = common.CANDLE_SAVED_PATH + '/' + fileName;
    let data = fs.readFileSync(fullPath, 'utf8');
    let json = [];
    if (fileUtils.isJsonString(data)) {
      const oldJson = JSON.parse(data);
      json = json.concat(oldJson, newJson);
    } else {
      json = json.concat(newJson);
    }

    const str = JSON.stringify(json);

    fs.writeFileSync(fullPath, str, 'utf8');
    //console.log("[" + moment().format() + "] " + "write orderbook file success");
  } catch(e) {
    throw e;
  }
}

const saveOrderbookDB = (prevData, curData, sumAllVolumePrices) => {
  var orderbookCollection = new Orderbook();
  orderbookCollection.market = curData.market;
  orderbookCollection.prePrice = prevData.orderbook_units[0].bid_price;
  orderbookCollection.price = curData.orderbook_units[0].bid_price;
  orderbookCollection.priceGap = ((curData.orderbook_units[0].bid_price - prevData.orderbook_units[0].bid_price) / prevData.orderbook_units[0].bid_price).toFixed(2);
  orderbookCollection.askVolume = curData.total_ask_size.toFixed(2);
  orderbookCollection.bidVolume = curData.total_bid_size.toFixed(2);
  orderbookCollection.askVolumeGap = (curData.total_ask_size - prevData.total_ask_size).toFixed(2);
  orderbookCollection.bidVolumeGap = (curData.total_bid_size - prevData.total_bid_size).toFixed(2);
  orderbookCollection.dataTimestamp = curData.timestamp;
  orderbookCollection.created = moment().utcOffset(9).format('YYYYMMDD HHmmss');

  orderbookCollection.save((err) => {
    if (err) { console.log(err); }
  })
}



