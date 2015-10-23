var express = require('express');
var router = express.Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('pages/index');
});

module.exports = router;
