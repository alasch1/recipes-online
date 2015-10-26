/**
 * Created by aschneider on 10/18/2015.
 */
var express = require('express');
var router = express.Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../persistence/cookbookHandler');
var helpers = require('../utils/helpers');

var rootUrl='/';
var recipeIdUrl = rootUrl + ':recipeId';

/* GET home page. */
router.get(recipeIdUrl, function(req, res, next) {
    getRecipe(req, res, next);
    next();
});

router.post(rootUrl, function(req, res, next) {
    addRecipe(req, res);
    next();
});

router.put(recipeIdUrl, function(req, res, next) {
    updateRecipe(req, res);
    next();
});

router.delete(recipeIdUrl, function(req, res, next) {
    deleteRecipe(req, res);
    next();
});

module.exports = router;

var getRecipe = function(req, res) {
    var recipe = cookbookHandler.getRecipe(req.params.recipeId);
    if (recipe) {
        res.end(JSON.stringify(recipe));
    }
    else {
        logger.debug("recipe id:%s was not found in the cookbook", req.params.recipeId);
        res.sendStatus(404);
    }
}

var addRecipe = function(req, res) {
    var recipe = req.body;
    cookbookHandler.addRecipe(recipe);
    logger.info('created recipe');
    res.sendStatus(201);
}

var updateRecipe = function(req, res) {
    if ( cookbookHandler.updateRecipe(req.body)) {
        logger.info('updated recipe');
        res.sendStatus(200);
    }
    else {
        logger.error("Failed to update");
        res.sendStatus(404);
    }
}

var deleteRecipe = function(req, res) {
    cookbookHandler.deleteRecipe(req.params.recipeId);
    logger.info('deleted recipe');
    res.sendStatus(200);
}

function logEnd(req, res, next) {
    logger.info(helpers.endReqHandlingString(req, res));
    next();
}
