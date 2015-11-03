/**
 * Created by aschneider on 10/19/2015.
 */

var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');

exports.getCookbookContent = function (req, res, next) {
    try {
        var content = cookbookHandler.getCoookbook().cuisines;
        if (content) {
            var contentJson = JSON.stringify(content);
            logger.info("received cookbook content");
            res.status(200).json(content);
            //logger.info(helpers.endReqHandlingString(req,res));
        }
        else {
            logger.error('failed to read cookbook content');
            res.status(404);
            //logger.info(helpers.endReqHandlingString(req,res));
        }
    }
    catch(err) {
        logger.error("Failed to get cookbook content", err);
        next(err);
    }
}
