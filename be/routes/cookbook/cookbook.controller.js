/**
 * Created by aschneider on 10/19/2015.
 */

var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');
var httpCodes = require('../../constants/httpCodes');

exports.getCookbooks = function(req, res, next) {
    try {
        var cookbooks = cookbookHandler.getCookbooks();
        if (cookbooks) {
            logger.info("found %s cookbooks", cookbooks.length);
            res.status(httpCodes.OK).json(cookbooks);
        }
        else {
            logger.error('failed to get cookbooks');
            res.status(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to get cookbooks", err);
        next(err);
    }
}

exports.openCookbook = function(req, res, next) {
    res.render('pages/cookbookContent');
}

exports.createCookbook = function(req, res, next) {
    try {
        var cookbook = req.body;
        cookbookHandler.createCookbook(cookbook);
        logger.info('created cookbook:', cookbook);
        res.sendStatus(httpCodes.CREATED);
    }
    catch(err) {
        logger.error("Failed to create cookbook %s", JSON.stringify(cookbook), err);
        next(err);
    }
}

exports.getCookbookContent = function (req, res, next) {
    try {
        var content = cookbookHandler.getCookbook(req.params.cookbookId).cuisines;
        if (content) {
            logger.info("received cookbook content");
            res.status(httpCodes.OK).json(content);
        }
        else {
            logger.error('failed to read cookbook content');
            res.status(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to get content of ",req.params.cookbookId, err);
        next(err);
    }
}

exports.renameCookbook = function(req, res, next) {
    var cookbook = req.body;
    try {
        if (cookbookHandler.renameCookbook(cookbook)) {
            logger.info('Renamed cookbook ', cookbook.id);
            res.sendStatus(httpCodes.OK);
        }
        else {
            res.sendStatus(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to update cookbook ", cookbook.id, err);
        next(err);
    }
}

exports.deleteCookbook = function(req, res, next) {
    try {
        cookbookHandler.deleteCookbook(req.params.cookbookId);
        logger.info('cookbook %s was deleted', req.params.cookbookId);
        res.sendStatus(httpCodes.OK);
    }
    catch(err) {
        logger.error("Failed to delete cookbook ", req.params.cookbookId, err);
        next(err);
    }
}
