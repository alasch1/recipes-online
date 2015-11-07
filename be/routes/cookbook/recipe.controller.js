/**
 * Created by aschneider on 10/18/2015.
 */
var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');
var httpCodes = require('../../constants/httpCodes');

exports.getRecipe = function(req, res, next) {
    try {
        var recipe = cookbookHandler.getRecipe(req.params.cookbookId, req.params.recipeId);
        if (recipe) {
            res.status(httpCodes.OK).json(recipe);
        }
        else {
            logger.debug("recipe id:%s was not found in the cookbook", req.params.recipeId);
            res.sendStatus(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to get recipe %s", req.params.recipeId, err);
        next(err);
    }
  }

exports.addRecipe = function(req, res, next) {
    try {
        var recipe = req.body;
        cookbookHandler.addRecipe(req.params.cookbookId, recipe);
        logger.info('created recipe:', recipe);
        res.sendStatus(httpCodes.CREATED);
    }
    catch(err) {
        logger.error("Failed to add recipe to ", req.params.cookbookId, err);
        next(err);
    }
}

exports.updateRecipe = function(req, res) {
    var recipe = req.body;
    try {
        if (cookbookHandler.updateRecipe(req.params.cookbookId, recipe)) {
            logger.info('Updated recipe ', recipe.id);
            res.sendStatus(httpCodes.OK);
        }
        else {
            res.sendStatus(httpCodes.NOT_FOUND);
        }
    }
    catch(err) {
        logger.error("Failed to update recipe %s at %s", recipe.id, req.params.cookbookId, err);
        next(err);
    }
}

exports.deleteRecipe = function(req, res) {
    try {
        cookbookHandler.deleteRecipe(req.params.cookbookId, req.params.recipeId);
        logger.info('recipe %s was deleted', req.params.recipeId);
        res.sendStatus(httpCodes.OK);
    }
    catch(err) {
        logger.error("Failed to delete recipe %s from %s", req.params.recipeId, req.params.cookbookId, err);
        next(err);
    }
}
