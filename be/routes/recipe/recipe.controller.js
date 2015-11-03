/**
 * Created by aschneider on 10/18/2015.
 */
var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../../persistence/cookbookHandler');

exports.getRecipe = function(req, res, next) {
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
        logger.error("Failed to get recipe %s", req.params.recipeId, err);
        next(err);
    }
  }

exports.addRecipe = function(req, res, next) {
    try {
        var recipe = req.body;
        cookbookHandler.addRecipe(recipe);
        logger.info('created recipe:', recipe);
        res.sendStatus(201);
    }
    catch(err) {
        logger.error("Failed to add recipe", err);
        next(err);
    }
}

exports.updateRecipe = function(req, res) {
    try {
        var recipe = req.body;
        if (cookbookHandler.updateRecipe(recipe)) {
            logger.info('updated recipe', recipe);
            res.sendStatus(200);
        }
        else {
            res.sendStatus(404);
        }
    }
    catch(err) {
        logger.error("Failed to update recipe %s", req.params.recipeId, err);
        next(err);
    }
}

exports.deleteRecipe = function(req, res) {
    try {
        cookbookHandler.deleteRecipe(req.params.recipeId);
        logger.info('recipe %s was deleted', req.params.recipeId);
        res.sendStatus(200);
    }
    catch(err) {
        logger.error("Failed to delete recipe %s", req.params.recipeId, err);
        next(err);
    }
}
