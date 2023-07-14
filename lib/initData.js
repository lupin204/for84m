const fs = require('fs')
const path = require('path')
const express = require('express');
const request = require('request-promise-native');

const common = require('./common');
const bot = require('../utils/telegrambot');



const initMarkets = () => {
  const requestOption = {
    method: 'GET',
    uri:  'https://api.upbit.com/v1/market/all',
    headers: {"Content-Type":" application/json"},
  };
  request(requestOption).then((data) => {
    const markets = JSON.parse(data);
    const krwMarkets = markets
      .filter((elem) => elem.market.startsWith('KRW'));
    const krwMarketsToCsv = krwMarkets
      .map((elem) => elem.market)
      .join();

    //common.MARKETS_ARRAYS = krwMarkets;
    common.MARKETS_CSV = krwMarketsToCsv;
    common.isInitMarkets = true;

    // Init Pump count
    // PUMP_COUNT = {'KRW-BTC':[3,4,7,8,9], 'KRW-XRP':[2,4,5]}
    krwMarkets.forEach(elem => {
      common.PUMP_COUNT[elem.market] = [];
    })
    
    
  }).catch((err) => {
    console.error(err)
  })
}

const initWriteFile = () => {
  console.log(__dirname)
  // const jsonpath = path.join('../', 'public/json', '/candle.json')
  // fs.access(jsonpath, fs.constants.F_OK, (err, jsonString) => {
  //   if (err) {
  //       fs.open(jsonpath, 'w', (err) => {
  //         if (err) throw Error(err);
  //       })
  //   }
  // })
}

const initTelegramBot = () => {
  bot.telegrambot.sendMessage(bot.channedId_lupin204, "[NOTICE] Sever Restart");
  bot.telegrambot.sendMessage(bot.channedId_lupin204usdt, "[NOTICE] Sever Restart");
}




module.exports = {
  'initMarkets': initMarkets,
  'initWriteFile': initWriteFile,
  'initTelegramBot': initTelegramBot
}