require('dotenv').config();

module.exports = Object.freeze({
  MY_CONSTANT: 'some value',
  ANOTHER_CONSTANT: 'another value',
  IGNORE_BALANCE_CURRENCY: ['HORUS', 'ADD', 'MEETONE', 'CHL', 'BLACK'],
  ORDER_MAX_PRICE: process.env.ORDER_MAX_PRICE,
  MIN_PUMP_COUNT_CHECK: process.env.MIN_PUMP_COUNT_CHECK,    // CRON INDEX에서 최소 n회 이내에서 펌핑 감지
  MIN_PUMP_COUNT_SEQ_CHECK: process.env.MIN_PUMP_COUNT_SEQ_CHECK, // 최소 MIN_PUMP_COUNT_CHECK횟수 이내 중에서 n번 이상 감지하면 매수 함..
  PROFIT_PERCENT: process.env.PROFIT_PERCENT,    // 수익 실현률 3% 먹기..  (0.03)
  PICK_UP_LOWER_PERCENT: process.env.PICK_UP_LOWER_PERCENT  // 5% 떡락했을때 추매... (0.05)
});