/**
 * Created by aschneider on 10/18/2015.
 */
var router = require('express').Router();
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var cookbookHandler = require('../persistence/cookbookHandler');
var helpers = require('../utils/helpers');
var util = require('util');

var rootUrl='/';
var recipeIdUrl = rootUrl + ':recipeId';

/* GET home page. */
router.get(recipeIdUrl, function(req, res, next) {
    try {
        getRecipe(req, res);
    }
    catch(err) {
        logger.error("Failed to get recipe", req.params.recipeId, err);
        next(err);
    }
});

router.post(rootUrl, function(req, res, next) {
    try {
        addRecipe(req, res);
    }
    catch(err) {
        logger.error("Failed to add recipe", err);
        next(err);
    }
});

router.put(recipeIdUrl, function(req, res, next) {
    try {
        updateRecipe(req, res);
    }
    catch(err) {
        logger.error("Failed to update recipe", err);
        next(err);
    }
});

router.delete(recipeIdUrl, function(req, res, next) {
    try {
        deleteRecipe(req, res);
    }
    catch(err) {
        logger.error("Failed to delete recipe", req.params.recipeId, err);
        next(err);
    }
});

module.exports = router;

var getRecipe = function(req, res) {
    var recipe = cookbookHandler.getRecipe(req.params.recipeId);
    if (recipe) {
        res.status(200).json(recipe);
    }
    else {
        logger.debug("recipe id:%s was not found in the cookbook", req.params.recipeId);
        res.sendStatus(404);
    }
  }

var addRecipe = function(req, res) {
    var recipe = req.body;
    cookbookHandler.addRecipe(recipe);
    logger.info('created recipe:', recipe);
    res.sendStatus(201);
}

var updateRecipe = function(req, res) {
    var recipe = req.body;
    if (cookbookHandler.updateRecipe(recipe)) {
        logger.info('updated recipe', recipe);
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
}

var deleteRecipe = function(req, res) {
    cookbookHandler.deleteRecipe(req.params.recipeId);
    logger.info('recipe %s was deleted', req.params.recipeId);
    res.sendStatus(200);
}
