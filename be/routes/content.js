/**
 * Created by aschneider on 10/19/2015.
 */

var express = require('express');
var router = express.Router();
var cookbookHandler = require('../persistence/cookbookHandler');
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();

/* GET home page. */
router.get('/', function (req, res, next) {
    getCookbookContent(req, res);
    logger.debug("get: almost finish")
    next();
});

module.exports = router;

var getCookbookContent = function (req, res) {
    var content = cookbookHandler.getContent();
    if (content) {
        var contentJson = JSON.stringify(content);
        logger.info("received cookbook content");
        res.end(contentJson);
        //res.send(contentJson);
    }
    else {
        logger.error('failed to read cookbook content');
        res.sendStatus(404);
    }
}
