/**
 * Created by aschneider on 10/18/2015.
 */
var express = require('express');
var router = express.Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../persistence/cookbookHandler');
var helpers = require('../utils/helpers');
var util = require('util');

var rootUrl='/';
var recipeIdUrl = rootUrl + ':recipeId';

/* GET home page. */
router.get(recipeIdUrl, function(req, res, next) {
    getRecipe(req, res, next);
    next();
});

router.post(rootUrl, function(req, res) {
    addRecipe(req, res);
});

router.put(recipeIdUrl, function(req, res) {
    updateRecipe(req, res);
});

router.delete(recipeIdUrl, function(req, res) {
    deleteRecipe(req, res);
});

module.exports = router;

var getRecipe = function(req, res) {
    try {
        var recipe = cookbookHandler.getRecipe(req.params.recipeId);
        if (recipe) {
            res.status(200).json(recipe);
        }
        else {
            logger.debug("recipe id:%s was not found in the cookbook", req.params.recipeId);
            res.sendStatus(404);
        }
    }
    catch(err) {
        logger.error("Failed to get recipe", req.params.recipeId, err);
        next(err);
    }
 }

var addRecipe = function(req, res, next) {
    var recipe = req.body;
    try {
        cookbookHandler.addRecipe(recipe);
        logger.info('created recipe:'+util.inspect(recipe));
        res.sendStatus(201);
    }
    catch(err) {
        logger.error("Failed to add recipe", recipe, err);
        next(err);
    }
}

var updateRecipe = function(req, res) {
    var recipe = req.body;
    try {
        if (cookbookHandler.updateRecipe(recipe)) {
            logger.info('updated recipe', recipe);
            res.sendStatus(200);
        }
        else {
            next(new Error("Failed to update"));
        }
    }
    catch(err) {
        logger.error("Failed to update recipe ", recipe, err);
        next(err);
    }
}

var deleteRecipe = function(req, res) {
    try {
        cookbookHandler.deleteRecipe(req.params.recipeId);
        logger.info('deleted recipe');
        res.sendStatus(200);
    }
    catch(err) {
        logger.error("Failed to delete recipe", req.params.recipeId, err);
        next(err);
    }
}

//function logEnd(req, res, next) {
//    logger.info(helpers.endReqHandlingString(req, res));
//    next();
//}
