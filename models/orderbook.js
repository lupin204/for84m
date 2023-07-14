const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* Schema Type  http://mongoosejs.com/docs/schematypes.html
String
Number
Date
Buffer
Boolean
Mixed
Objectid
Array
*/
const orderbookSchema = new Schema({
    
    /*created: { type: String, required: true, unique: true, index: true},*/
    market: { type: String, required: false },    // BTC-KRW
    prePrice: {type: String, required: false },     // 10000
    price: {type: String, required: false },     // 10000
    priceGap: {type: String, required: false },
    askVolume: {type: String, required: false },
    bidVolume: {type: String, required: false },
    askVolumeGap: {type: String, required: false },                     // 486.1245
    bidVolumeGap: {type: String, required: false },                     // 486.1245
    dataTimestamp : {type: String, required: false},    // server unixtimestamp
    created: { type: String, required: true},   // yyyymmddhh24mi00
    createdDate: {type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('orderbook', orderbookSchema);


/*
upbitObj: {
    marketState: String,
    changeRate: String,
    changePrice: String,
    marketStateForIOS: String,
    accTradeVolume: String,
    tradeStatus: String,
    createdAt: String,
    highPrice: String,
    lowest52WeekPrice: String,
    code: String,
    signedChangeRate: String,
    highest52WeekPrice: String,
    tradeDateKst: String,
    accBidVolume: String,
    tradeVolume: String,
    signedChangePrice: String,
    accTradePrice24h: String,
    timestamp: String,
    delistingDate: String,
    prevClosingPrice: String,
    tradeTime: String,
    openingPrice: String,
    accTradeVolume24h: String,
    tradePrice: String,
    tradeTimestamp: String,
    isTradingSuspended: String,
    change: String,
    askBid: String,
    lowest52WeekDate: String,
    tradeTimeKst: String,
    accTradePrice: String,
    tradeDate: String,
    lowPrice: String,
    modifiedAt: String,
    accAskVolume: String,
    highest52WeekDate: String,
    rank: String
}*/