const express = require('express');
const request = require('request-promise-native');
const moment = require('moment');
const fs = require('fs')
const path = require('path')
const fileUtils = require('../utils/fileUtils')
const router = express.Router();

const common = require('../lib/common');

router.get(['/order'], function(req, res, next) {

  res.status(200).json({message: 'under construction..'});
});



module.exports = router;
