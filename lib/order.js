const request = require("request")
const sign = require("jsonwebtoken").sign
const queryEncode = require("querystring").encode

const { ORDER_MAX_PRICE } = require('../lib/constants');
const common = require('../lib/common');
const constants = require('../lib/constants');

const _findIndex = require('lodash.findindex');


const accessKey = process.env.UPBIT_ACCESS_KEY;
const secretKey = process.env.UPBIT_SECRET_KEY;

const bid = (marketParam, priceParam) => {

  const volume = (priceParam <= ORDER_MAX_PRICE) ? Math.floor(ORDER_MAX_PRICE / priceParam) : Number((ORDER_MAX_PRICE / priceParam).toFixed(5));

  const body = {
    market: marketParam, 
    side: 'bid',    // bid매수 ask매도 
    volume: volume, 
    price: priceParam, 
    ord_type: 'limit'
  };
  const payload = {
    access_key: accessKey,
    nonce: (new Date).getTime(),
    query: queryEncode(body)
  };
  const token = sign(payload, secretKey);
  
  var options = {
    method: "POST",
    url: "https://api.upbit.com/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const orderInfo = {
      uuid_bid: body.uuid,
      uuid_ask: '',
      market: body.market,
      price: body.price,
      volume: body.volume,
      status: 'bid',
      created_at: body.created_at
    }
    console.log(JSON.stringify(orderInfo));
    common.ORDER_LIST.push(orderInfo);
    return body;
  });
}

const ask = (marketParam, priceParam, volumeParam, uuidBidParam) => {

  const body = {
    market: marketParam, 
    side: 'ask',    // bid매수 ask매도 
    volume: volumeParam, 
    price: priceParam,
    ord_type: 'limit'
  };
  const payload = {
    access_key: accessKey,
    nonce: (new Date).getTime(),
    query: queryEncode(body)
  };
  const token = sign(payload, secretKey);
  
  var options = {
    method: "POST",
    url: "https://api.upbit.com/v1/orders",
    headers: {Authorization: `Bearer ${token}`},
    json: body
  };
  
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);

    const idx = _findIndex(common.ORDER_LIST, function(obj) { return obj.uuid_bid == uuidBidParam; });

    common.ORDER_LIST[idx].uuid_ask = body.uuid;
    common.ORDER_LIST[idx].status = 'ask';

    return body;
  });
}

const cancel = async (uuid) => {
  const body = {
    uuid: uuid
  };
  const query = queryEncode(body);

  const payload = {
    access_key: accessKey,
    nonce: (new Date).getTime(),
    query: query
  };
  const token = sign(payload, secretKey);

  var options = {
    method: "DELETE",
    url: "https://api.upbit.com/v1/order?" + query,
    headers: {Authorization: `Bearer ${token}`}
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    //console.log(JSON.parse(body));
    return JSON.parse(body);
  });
}





module.exports = {
  bid: bid,
  ask: ask,
  cancel: cancel
}