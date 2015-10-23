/**
 * Created by aschneider on 10/19/2015.
 */

var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var util = require('util');

// temporary
var cookbooks = require('../mocks/cookbookMock');

function CookbookHandler() {

    // temporary
    this.cookbook = cookbooks[0];

    this.getContent = function() {
        //var content = this.cookbook.cuisines;
        //var ccc = "dummy";
        //logger.debug("content:" , JSON.stringify(ccc));
        return this.cookbook.cuisines;
    }

    this.getRecipe = function(recipeId) {
        logger.debug("received %s", recipeId);
        var recipe = this.cookbook.getRecipe(recipeId);
        if (recipe) {
            logger.debug("Found in cookbook " + JSON.stringify(recipe));
        }
        else {
            logger.debug("recipe id:%s was not found in the cookbook", recipeId);
        }
        return recipe;
    }

    this.addRecipe = function(recipe){
        this.cookbook.addRecipe(recipe);
        logger.debug("Added to cookbook a new recipe" + JSON.stringify(recipe));
        return true;
    }

    this.updateRecipe = function(recipe) {
        logger.debug("Updating recipe:%s", JSON.stringify(recipe));
        var result =  this.cookbook.updateRecipe(recipe);
        if (result) {
            logger.debug("Recipe was updated");
        }
        else {
            logger.error('Failed to update recipe by id:%s; probably it was not found', recipe.id);
        }
        return result;
    }

    this.deleteRecipe = function(recipeId) {
        logger.debug("Deleting recipe by id:%s", recipeId);
        if ( this.cookbook.deleteRecipe(recipeId)) {
            logger.debug("Recipe was deleted");
        }
        else {
            logger.debug("Was not deleted; probably was not found");
        }
        return true;
    }

}

var handler = new CookbookHandler();

module.exports = handler;

var test = function() {
    var content = handler.getContent();
    console.log('>>>>>> Here is a content', JSON.stringify(content));
}

test();