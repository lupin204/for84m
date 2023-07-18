var express = require('express');
var fs = require('fs');
const path = require('path');
var router = express.Router();

/* GET home page. */
// router.get('', function(req, res, next) {
//   var filePath = path.join(__dirname, '..', 'public', 'json', 'candle_2019052110.json');
//   //var file = 'public/json/candle_2019052110.json';
//   res.download(filePath);
// });

router.get(['/:id'], function(req, res, next) {
  let fileName = req.params.id;
  if (!fileName) res.render('index', { title: 'no file' });
  
  var filePath = path.join(__dirname, '..', 'public', 'json', 'candle_'+fileName+'.json');
  console.log(filePath)
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.render('index', { title: 'no such file : ' + fileName })
    }
    res.download(filePath);
  })

});

router.get(['/read/:id'], function(req, res, next) {
  let fileName = req.params.id;
  if (!fileName) res.render('index', { title: 'no file' });
  
  var filePath = path.join(__dirname, '..', 'public', 'json', 'candle_'+fileName+'.json');
  console.log(filePath)
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      res.render('index', { title: 'no such file : ' + fileName })
    }
    res.download(filePath);
  })

});

module.exports = router;
