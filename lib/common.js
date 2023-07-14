const path = require('path')
const { PROFIT_PERCENT } = require('./constants')

const getTickUnitPrice = (price, tick_num) => {
  if (price == undefined || isNaN(price)) price = 0;
  if (tick_num == undefined || isNaN(tick_num)) tick_num = 0;
  if (price >= 2000000) { return price + 1000 * tick_num; }
  else if (price >= 1000000) { return price + 500 * tick_num; }
  else if (price >= 500000) { return price + 100 * tick_num; }
  else if (price >= 100000) { return price + 50 * tick_num; }
  else if (price >= 10000) { return price + 10 * tick_num; }
  else if (price >= 1000) { return price + 5 * tick_num; }
  else if (price >= 100) { return price + 1 * tick_num; }
  else if (price >= 10) { return price + 0.1 * tick_num; }
  else { return price + 0.01 * tick_num; }
}

const getProfitPrice = (price) => {
  if (price == undefined || isNaN(price)) return 0;
  if (price >= 2000000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 1000) * 1000).toFixed() }
  else if (price >= 1000000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 500) * 500).toFixed() }
  else if (price >= 500000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 100) * 100).toFixed() }
  else if (price >= 100000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 50) * 50).toFixed() }
  else if (price >= 10000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 10) * 10).toFixed() }
  else if (price >= 1000) { return (Math.ceil((price + price * PROFIT_PERCENT) / 5) * 5).toFixed() }
  else if (price >= 100) { return (Math.ceil((price + price * PROFIT_PERCENT) / 1) * 1).toFixed() }
  else if (price >= 10) { return (Math.ceil((price + price * PROFIT_PERCENT) / 0.1) * 0.1).toFixed(1) }
  else { return (Math.ceil((price + price * PROFIT_PERCENT) / 0.01) * 0.01).toFixed(2) }
}

module.exports = {
  CANDLE_SAVED_PATH: path.join(__dirname, '..', 'public', 'json'),
  IS_INIT_MARKETS: false,
  MARKETS_CSV: '',
  //MARKETS_ARRAYS: [],
  PREV_TICK: [],
  PREV_ORDER: [],
  CRON_INDEX: 0,
  PUMP_COUNT: {},
  ORDER_LIST: [],
  getTickUnitPrice: getTickUnitPrice,
  getProfitPrice: getProfitPrice
}