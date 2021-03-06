/**
 * Created by aschneider on 10/19/2015.
 */

var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var util = require('util');
var uuid = require('node-uuid');
var _ =  require('lodash');
var model = require('./model/DTO');
var cookbookLookup = require('./cookbookLookup');

// temporary
var cookbooks = require('../mocks/cookbookMock');

function CookbookHandler() {

    this.defaultCuisine="????";

    //============================================
    // Cookbook methods
    //============================================

    this.getCookbooks = function() {
        var cookbooksMetaData = [];
        cookbooks.forEach(function(current, index, array) {
            cookbooksMetaData.push({id: current.id, name: current.name});
        });
        return cookbooksMetaData;
    }

    this.createCookbook = function(cookbook) {
        logger.debug("Creating cookbook %s", JSON.stringify(cookbook));
        cookbook.id = "cb-" + uuid.v1();
        cookbook.cuisines = [];
        cookbooks.push(cookbook);
    }

    this.getCookbook = function(cookbookId) {
        logger.debug("received %s", cookbookId);
        var cookbook = cookbookLookup.cookbook(cookbooks, cookbookId);
        if (cookbook) {
            logger.debug("Found cookbook " + cookbook.name);
        }
        else {
            logger.debug("cookbook id:%s was not found ", cookbookId);
        }
        return cookbook;
    }

    this.deleteCookbook = function(cookbookId) {
        logger.debug("Deleting cookbook by id:%s", cookbookId);
        var cookbookIndex = cookbookLookup.cookbookIndex(cookbooks, cookbookId);
        if (cookbookIndex !== -1) {
            var deleted = cookbooks.splice(cookbookIndex, 1);
            if (deleted.length === 1) {
                logger.info("Cookbook %s was deleted", cookbookId);
                return true;
            }
        }
        else {
            logger.error("Index of %s was not found in the cookbooks", cookbookId);
        }
        return false;
    }

    this.renameCookbook = function(modifiedCookbook) {
        // Only name may be changed upon update
        logger.debug("Updating cookbook:%s", JSON.stringify(modifiedCookbook));
        var cookbook = cookbookLookup.cookbook(modifiedCookbook.id);
        if (cookbook) {
            cookbook.name = modifiedCookbook.name;
            this.deleteCookbook(cookbook.id);
            cookbooks.push(cookbook);
            return true;
        }
        else {
            logger.debug("Cookbook %s does not exist", modifiedCookbook.id);
            return false;
        }
    }

    //============================================
    // Recipe methods
    //============================================

    this.getRecipe = function(cookbookId, recipeId) {
        logger.debug("received %s", recipeId);
        var cookbook = this.getCookbook(cookbookId);
        var recipe = cookbookLookup.recipeAtCookbook(cookbook, recipeId);
        if (recipe) {
            logger.debug("Found in cookbook " + JSON.stringify(recipe));
        }
        else {
            logger.debug("recipe id:%s was not found in the cookbook", recipeId);
        }
        return recipe;
    }

    this.addRecipe = function(cookbookId, recipe){
        var cookbook = this.getCookbook(cookbookId);
        this.addRecipe2Cookbook(cookbook, recipe);
        logger.debug("Added to cookbook a new recipe" + JSON.stringify(recipe));
        return true;
    }

    this.deleteRecipe = function(cookbookId, recipeId) {
        logger.debug("Deleting recipe by id:%s", recipeId);
        var cookbook = this.getCookbook(cookbookId);
        if ( this.deleteRecipe4Cookbook(cookbook, recipeId)) {
            logger.debug("Recipe was deleted");
        }
        else {
            logger.debug("Was not deleted; probably was not found");
        }
        return true;
    }

    this.updateRecipe = function(cookbookId, recipe) {
        logger.debug("Updating recipe:%s", JSON.stringify(recipe));
        var cookbook = this.getCookbook(cookbookId);
        var result =  this.updateCookbookRecipe(cookbook, recipe);
        if (result) {
            logger.debug("Recipe was updated");
        }
        else {
            logger.error('Failed to update recipe by id:%s; probably it was not found', recipe.id);
        }
        return result;
    }

    //============================================
    // Cuisine methods
    //============================================

    this.getCuisine = function(cookbookId, cuisineId) {
        var cookbook = this.getCookbook(cookbookId);
        return cookbookLookup.cuisineAtCookbook(cookbook, cuisineId);
    }

    this.deleteCuisine = function(cookbookId, cuisineId) {
        logger.debug("Deleting cuisine by id:%s", cuisineId);
        var cookbook = this.getCookbook(cookbookId);
        var result =  this.deleteCuisine4Cookbook(cookbook, cuisineId);
        if (result) {
            logger.debug("Cuisine was deleted");
        }
        else {
            logger.error('Failed to delete cuisine by id:%s; probably it is not empty', cuisineId);
        }
        return result;
    }

    //============================================
    // Add stuff
    //============================================

    this.addCuisine2Cookbook = function(cookbook, cuisineName) {
        var cuisine = new model.Cuisine(cuisineName);
        cuisine.id = "cu-" + uuid.v1();
        var index = cookbook.cuisines.push(cuisine) -1;
        logger.debug("Added a new dish type", cookbook.cuisines[index].name);
        return cuisine;
    }

    this.addRecipe2Cookbook = function(cookbook, recipe) {
        logger.debug("Adding recipe"+ JSON.stringify(recipe));
        recipe.id = "re-" + uuid.v1();
        logger.debug("Assigned id:", recipe.id);
        if (recipe.cuisine !== "") {
            this.addCuisineAndRecipe2Cookbook(cookbook, recipe.cuisine, recipe);
        }
        else {
            recipe.cuisine = this.defaultCuisine;
            this.addCuisineAndRecipe2Cookbook(cookbook, this.defaultCuisine, recipe);
        }
    }

    this.addCuisineAndRecipe2Cookbook = function(cookbook, cuisineName, recipe) {
        logger.debug("Adding to cuisine:%s recipe:%s", cuisineName, JSON.stringify(recipe));
        var cuisine = cookbookLookup.cuisineAtCookbookByName(cookbook, cuisineName);
        if (!cuisine) {
            cuisine = this.addCuisine2Cookbook(cookbook, cuisineName);
        }
        this.addRecipe2Cuisine(cuisine, recipe);
        logger.debug("Added ", recipe," to ", cuisine.name);
    }

    this.addRecipe2Cuisine = function(cuisine, recipe) {
        recipe.cuisine = cuisine.name;
        if (!recipe.id) {
            recipe.id = uuid.v1();
        }
        cuisine.recipes.push(recipe);
    }

    //============================================
    // Delete stuff
    //============================================

    this.deleteCuisine4Cookbook = function(cookbook, cuisineId) {
        var cuisine = cookbookLookup.cuisineAtCookbook(cookbook, cuisineId);
        if (cuisine && cuisine.recipes.length===0) {
            var cuisineIndex = cookbookLookup.cuisineIndexAtCookbook(cookbook, cuisineId);
            if (cuisineIndex !== -1) {
                var deleted = cookbook.cuisines.splice(cuisineIndex, 1);
                if (deleted.length === 1) {
                    logger.info("Empty cuisine %s was deleted from cookbook", cuisineId);
                    return true;
                }
            }
            else {
                logger.error("Index of %s was not found in the cookbook", cuisineId);
            }
        }
        else {
            logger.error("Cannot delete not empty cuisine", cuisineId);
        }
        return false;
    }

    this.deleteRecipe4Cookbook = function(cookbook, recipeId) {
        var recipe = cookbookLookup.recipeAtCookbook(cookbook, recipeId);
        if (recipe) {
            var cuisine = cookbookLookup.cuisineAtCookbookByName(cookbook, recipe.cuisine);
            this.deleteRecipe4Cuisine(cuisine, recipe);
            return true;
        }
        else return false;
    }

    this.deleteRecipe4Cuisine = function(cuisine, recipe) {
        var i = cookbookLookup.recipeIndexAtCuisine(cuisine, recipe.id);
        if (i > -1) {
            logger.debug("Removing recipe:%s with index:%s from %s", recipe.id, i, cuisine.name);
            cuisine.recipes.splice(i, 1);
        }
        else {
            logger.debug("Not found recipe:%s in %s", recipe.id, this.name);
        }
    }

    this.deleteRecipe4CuisineById = function(cuisine, recipeId) {
        var i = cookbookLookup.recipeIndexAtCuisine(cuisine, recipeId);
        if (i > -1) {
            cuisine.recipes.splice(i, 1);
        }
    }

    //============================================
    // Update stuff
    //============================================

    this.updateCookbookRecipe = function(cookbook, recipe) {
        logger.debug("Updating recipe "+ JSON.stringify(recipe));
        var oldRecipe = cookbookLookup.recipeAtCookbook(cookbook, recipe.id);
        if (!oldRecipe){
            logger.debug("Recipe does not exist");
            return false;
        }
        else {
            if (oldRecipe.cuisine === recipe.cuisine) {
                var cuisine = cookbookLookup.cuisineAtCookbookByName(cookbook, recipe.cuisine);
                logger.debug("Replace recipe:%s of cuisine:%s", recipe.name, recipe.cuisine);
                this.replaceCuisineRecipe(cuisine, recipe);
            }
            else {
                var oldCuisine = cookbookLookup.cuisineAtCookbookByName(cookbook, oldRecipe.cuisine);
                this.deleteRecipe4Cuisine(oldCuisine, recipe);
                logger.debug("Move recipe:% from cuisine:%s to cuisine:%s",
                    recipe.name, oldRecipe.cuisine, recipe.cuisine);
                this.addRecipe2Cookbook(cookbook, recipe);
            }
            return true;
        }
    }

    this.replaceCuisineRecipe = function(cuisine, recipe) {
        this.deleteRecipe4CuisineById(cuisine, recipe.id);
        this.addRecipe2Cuisine(cuisine, recipe);
    }

}

var handler = new CookbookHandler();

module.exports = handler;

//=====================================================
// Temporary tests are here
//=====================================================

function testGetRecipe() {
    var recipe = handler.getRecipe('re-1');
    console.log('>>>>>> Here is a recipe', JSON.stringify(recipe));
}

function testLookup(cookbook) {
    var cuisineId = 'cu-4';
    var recipeId = 're-3';

    var cuisine = cookbookLookup.cuisineAtCookbook(cookbook, cuisineId);
    console.log('*** Found a cuisine', JSON.stringify(cuisine));

    var cuisineIndex = cookbookLookup.cuisineIndexAtCookbook(cookbook, cuisine.id);
    console.log('*** Received cuisine index:', cuisineIndex);

    var recipe = cookbookLookup.recipeAtCookbook(cookbook, recipeId);
    console.log('*** Found a recipe', JSON.stringify(recipe));

    var recipeIndex = cookbookLookup.recipeIndexAtCuisine(cuisine, recipeId);
    console.log('*** Received recipe index %d in cuisine:%s', recipeIndex, cuisine.name);
}

//(function test() {
//    var cbs = handler.getCookbooks();
//    //console.log('>>>>>> Here is a content', JSON.stringify(content));
//
//    testGetRecipe();
//
//    testLookup(content);
//
//})();

// tests
console.log("------All cookbooks:", JSON.stringify(handler.getCookbooks()));
console.log("------ala's cookbook:", JSON.stringify(handler.getCookbook('cb-2')));
console.log("------recipe:", JSON.stringify(handler.getRecipe('cb-2','re-3')));
//console.log("------ala's cookbook:", JSON.stringify(handler.getCookbook('cb-2')));