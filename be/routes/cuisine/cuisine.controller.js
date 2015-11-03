/**
 * Created by aschneider on 11/3/2015.
 */

var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');

exports.getCuisine = function(req, res, next) {
    try {
        logger.info("getCuisine");
        var cuisine = cookbookHandler.getCuisine(req.params.cuisineId);
        if (cuisine) {
            res.status(200).json(cuisine);
        }
        else {
            logger.debug("cuisine id:%s was not found in the cookbook", req.params.cuisineId);
            res.sendStatus(404);
        }
    }
    catch(err) {
        logger.error("Failed to get cuisine", req.params.cuisineId, err);
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
        if (cookbookHandler.deleteCuisine(req.params.cuisineId)) {
            res.sendStatus(200);
        }
        else {
            logger.debug("cuisine id:%s was not deleted", req.params.cuisineId);
            res.sendStatus(409);
        }
    }
    catch(err) {
        logger.error("Failed to delete cuisine", req.params.cuisineId, err);
        next(err);
    }
}