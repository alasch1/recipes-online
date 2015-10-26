/**
 * Created by aschneider on 10/19/2015.
 */

var express = require('express');
var router = express.Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../persistence/cookbookHandler');
var helpers = require('../utils/helpers');

/* GET home page. */
router.get('/', function (req, res) {
    getCookbookContent(req, res);
});

module.exports = router;

var getCookbookContent = function (req, res) {
    var content = cookbookHandler.getCoookbook().cuisines;
    if (content) {
        var contentJson = JSON.stringify(content);
        logger.info("received cookbook content");
        res.json(content);
        //logger.info(helpers.endReqHandlingString(req,res));
    }
    else {
        logger.error('failed to read cookbook content');
        res.sendStatus(404);
        //logger.info(helpers.endReqHandlingString(req,res));
    }
}
