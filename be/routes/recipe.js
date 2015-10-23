/**
 * Created by aschneider on 10/18/2015.
 */
var express = require('express');
var router = express.Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('This is from get recipe');
});

module.exports = router;
