/**
 * Created by aschneider on 10/19/2015.
 */

var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var util = require('util');
var uuid = require('node-uuid');

// temporary
var cookbooks = require('../mocks/cookbookMock');

function CookbookHandler() {

    // temporary
    this.cookbook = cookbooks[0];

    this.defaultCuisine="????";

    this.getCoookbook = function() {
        return this.cookbook;
    }

    this.getRecipe = function(recipeId) {
        logger.debug("received %s", recipeId);
        var recipe = this.getCookbookRecipe(this.cookbook, recipeId);
        if (recipe) {
            logger.debug("Found in cookbook " + JSON.stringify(recipe));
        }
        else {
            logger.debug("recipe id:%s was not found in the cookbook", recipeId);
        }
        return recipe;
    }

    this.addRecipe = function(recipe){
        this.addRecipe2Cookbook(this.cookbook, recipe);
        logger.debug("Added to cookbook a new recipe" + JSON.stringify(recipe));
        return true;
    }

    this.deleteRecipe = function(recipeId) {
        logger.debug("Deleting recipe by id:%s", recipeId);
        if ( this.deleteRecipe4Cookbook(this.cookbook, recipeId)) {
            logger.debug("Recipe was deleted");
        }
        else {
            logger.debug("Was not deleted; probably was not found");
        }
        return true;
    }

    this.updateRecipe = function(recipe) {
        logger.debug("Updating recipe:%s", JSON.stringify(recipe));
        var result =  this.updateCookbookRecipe(this.cookbook, recipe);
        if (result) {
            logger.debug("Recipe was updated");
        }
        else {
            logger.error('Failed to update recipe by id:%s; probably it was not found', recipe.id);
        }
        return result;
    }

    // Get stuff
    this.getCookbookCuisine = function(cookbook, cuisineName) {
        var cuisine = null;
        cookbook.cuisines.forEach(function(element, index, array) {
            logger.debug("Current ", element.name);
            if (element.name == cuisineName) {
                logger.debug("Matching given ", cuisineName);
                cuisine = element;
            }
        })
        return cuisine;
    }

    this.getCookbookRecipe = function(cookbook, recipeId) {
        var recipe = null;
        cookbook.cuisines.forEach(function(cuisine, i, array) {
            var found = this.getCuisineRecipe(cuisine, recipeId);
            if (found) {
                logger.debug("recipe id:%s found in cuisine:%s", recipeId, cuisine.name);
                recipe = found;
            }
        }.bind(this));
        return recipe;
    }

    this.getCuisineRecipe = function(cuisine, recipeId) {
        var recipe = null;
        cuisine.recipes.forEach(function(current, i, recipes) {
            if (current.id === recipeId) {
                recipe = current;
            }
        });
        return recipe;
    }

    this.getCuisineRecipeIndex = function(cuisine, recipeId) {
        var recipe = null;
        for (var i = 0; i< cuisine.recipes.length; i++) {
            if (cuisine.recipes[i].id === recipeId) {
                return i;
            }
        };
        return -1;
    }

    // Add stuff
    this.addCuisine2Cookbook = function(cookbook, cuisineName) {
        var cuisine = new Cuisine(cuisineName);
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
        var cuisine = this.getCookbookCuisine(cookbook, cuisineName);
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

    // Delete stuff
    this.deleteRecipe4Cookbook = function(cookbook, recipeId) {
        var recipe = this.getCookbookRecipe(cookbook, recipeId);
        if (recipe) {
            var cuisine = this.getCookbookCuisine(cookbook, recipe.cuisine);
            this.deleteRecipe4Cuisine(cuisine, recipe);
            return true;
        }
        else return false;
    }

    this.deleteRecipe4Cuisine = function(cuisine, recipe) {
        var i = cuisine.recipes.indexOf(recipe);
        if (i > -1) {
            logger.debug("Removing recipe:%s with index:%s from %s", recipe.id, i, cuisine.name);
            cuisine.recipes.splice(i, 1);
        }
        else {
            logger.debug("Not found recipe:%s in %s", recipe.id, this.name);
        }
    }

    this.deleteRecipe4CuisineById = function(cuisine, recipeId) {
        var i = this.getCuisineRecipeIndex(cuisine, recipeId);
        if (i > -1) {
            cuisine.recipes.splice(i, 1);
        }
    }

    // Update stuff
    this.updateCookbookRecipe = function(cookbook, recipe) {
        logger.debug("Updating recipe "+ JSON.stringify(recipe));
        var oldRecipe = this.getCookbookRecipe(cookbook, recipe.id);
        if (!oldRecipe){
            logger.debug("Recipe does not exist");
            return false;
        }
        else {
            if (oldRecipe.cuisine === recipe.cuisine) {
                var cuisine = this.getCookbookCuisine(cookbook, recipe.cuisine);
                logger.debug("Replace recipe:%s of cuisine:%s", recipe.name, recipe.cuisine);
                this.replaceCuisineRecipe(cuisine, recipe);
            }
            else {
                var oldCuisine = this.getCookbookCuisine(cookbook, oldRecipe.cuisine);
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

// Tests
function testGetRecipe(content) {
    var recipe = handler.getRecipe('re-1');
    console.log('>>>>>> Here is a recipe', JSON.stringify(recipe));
}

(function test() {
    var content = handler.getCoookbook();
    console.log('>>>>>> Here is a content', JSON.stringify(content));

    testGetRecipe(content);

})();