const request = require("request")
const sign = require("jsonwebtoken").sign
const queryEncode = require("querystring").encode

const accessKey = process.env.UPBIT_ACCESS_KEY;
const secretKey = process.env.UPBIT_SECRET_KEY;

const getBalance = () => {
  const payload = {access_key: accessKey, nonce: (new Date).getTime()};
  const token = sign(payload, secretKey);

  const requestOption = {
    method: 'GET',
    uri:  'https://api.upbit.com/v1/accounts',
    headers: {Authorization: `Bearer ${token}`}
  };
  request(requestOption, function (error, response, body) {
    if (error) throw new Error(error);
    //console.log(body);
    return body;
  });
}








module.exports = {
  getBalance: getBalance
}