var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// [204] - CORS
const cors = require('cors');

// [204] - user-defined modules
///const initData = require('./lib/initData');

// [204] - routes
const index = require('./routes/index');
const naverLandApi = require('./routes/naverLand');


const upbitApi = require('./routes/api');
const upbitOrderApi = require('./routes/order');
const upbitBalanceApi = require('./routes/balance');
const fileDown = require('./routes/fileDown');
const dataApi = require('./routes/dataApi');

// [204] - scheduler
//const pumpScheduler = require('./batch/pumpScheduler');
//const scheduler = require('./batch/scheduler');
// [204] - mongodb
///const mongoose = require('./lib/mongo');
// [start MongoDB]
// mongoose 기본 promise를 node의 promise로 교체
// mongoose.Promise = require('bluebird');
///mongoose.Promise = global.Promise;
///mongoose();


var app = express();


// [204] - CORS
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/land', naverLandApi);


app.use('/api', upbitApi);
app.use('/api', upbitOrderApi);
app.use('/api', upbitBalanceApi);
app.use('/down', fileDown);
app.use('/api/data', dataApi);


// [204] - 서버 최초구동시
// market정보 초기화 - 이후 매일0시 업데이트(cron)
// candle.json 초기화
// 텔레그램봇 서버재시작 메시지 전송
///initData.initMarkets();
///initData.initWriteFile();
///initData.initTelegramBot();

// [204]- Before Routing Interceptor...
app.use(function(req, res, next) {
  //console.log('[interceptor - before routing]');
  next();
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

console.log('server is ready!!');
module.exports = app;
