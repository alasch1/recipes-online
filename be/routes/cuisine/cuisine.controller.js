/**
 * Created by aschneider on 11/3/2015.
 */

var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');
var httpCodes = require('../../constants/httpCodes');

exports.getCuisine = function(req, res, next) {
    try {
        logger.info("getCuisine");
        var cuisine = cookbookHandler.getCuisine(req.params.cookbookId, req.params.cuisineId);
        if (cuisine) {
            res.status(httpCodes.OK).json(cuisine);
        }
        else {
            logger.debug("cuisine %s was not found in cookbook %s", req.params.cuisineId, req.params.cookbookId);
            res.sendStatus(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to get cuisine %s in cookbook %s", req.params.cuisineId, req.params.cookbookId, err);
        next(err);
    }

}

exports.updateCuisine = function(req, res, err, next) {
    logger.info("updateCuisine");
    logger.error("updateCuisine is not supported");
    next(err);
}

exports.deleteCuisine = function(req, res, next) {
    try {
        logger.info("deleteCuisine");
        if (cookbookHandler.deleteCuisine(req.params.cookbookId, req.params.cuisineId)) {
            res.sendStatus(httpCodes.OK);
        }
        else {
            logger.debug("cuisine %s was not deleted from %s", req.params.cuisineId, req.params.cookbookId);
            res.sendStatus(httpCodes.CONFLICT);
        }
    }
    catch(err) {
        logger.error("Failed to delete cuisine %s from %s", req.params.cuisineId, req.params.cookbookId, err);
        next(err);
    }
}