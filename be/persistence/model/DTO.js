/**
 * Created by aschneider on 9/22/2015.
 */

'use strict';

var uuid = require('node-uuid');
var logger = require('../../utils/logger')(module);

function Ingredient(name, qty, units) {
    this.name = name;
    this.qty = qty;
    this.units = units;
}

function Recipe(name) {
    this.id = uuid.v1();
    this.name = name;
    this.cuisine = "";
    this.ingredients = [];
    this.method = [];
    logger.debug("Created recipe with id:", this.id);
}

function Cuisine(name) {
    this.id = uuid.v1();
    this.name = name;
    this.recipes = [];// of RecipeShortcut

    this.addRecipe = function(recipe) {
        recipe.cuisine = this.name;
        if (!recipe.id) {
            recipe.id = uuid.v1();
        }
        this.recipes.push(recipe);
    }

    this.getRecipeById = function(recipeId) {
        var recipe = null;
        this.recipes.forEach(function(current, i, recipes) {
            if (current.id === recipeId) {
                recipe = current;
            }
        });
        return recipe;
    }

    this.getRecipeIndexById = function(recipeId) {
        var recipe = null;
        for (var i = 0; i< this.recipes.length; i++) {
            if (this.recipes[i].id === recipeId) {
                return i;
            }
        };
        return -1;
    }

    this.hasRecipe = function(recipe) {
        return this.recipes.indexOf(recipe) != -1;
    }

    this.replaceRecipe = function(recipe) {
        this.removeRecipeById(recipe.id);
        this.addRecipe(recipe);
    }

    this.removeRecipeById = function(recipeId) {
        var i = this.getRecipeIndexById(recipeId);
        if (i > -1) {
            this.recipes.splice(i, 1);
        }
    }

    this.removeRecipe = function(recipe) {
        var i = this.recipes.indexOf(recipe);
        if (i > -1) {
            logger.debug("Removing recipe:%s with index:%s from %s", recipe.id, i, this.name);
            this.recipes.splice(i, 1);
        }
        else {
            logger.debug("Not found recipe:%s in %s", recipe.id, this.name);
        }
    }

    this.isEmpty = function() {
        return this.recipes.length;
    }
}

function Cookbook(id, name, cuisines) {

    this.id = id;
    this.name = name;
    this.cuisines = cuisines;
    this.defaultCuisine="default";

    this.getCuisineAsString = function() {
        var result =[];
        this.cuisines.forEach(function(element, index, array) {
            result[index] = element.name;
        });
        logger.debug("collected cuisines:%s", result);
        return result;
    }

    this.getCuisines = function() {
        return this.cuisines;
    }

    this.getCuisine = function(cuisineName) {
        var cuisine = null;
        this.cuisines.forEach(function(element, index, array) {
            logger.debug("Current ", element.name);
            if (element.name == cuisineName) {
                logger.debug("Matching given ", cuisineName);
                cuisine = element;
            }
        })
        return cuisine;
    }

    this.getRecipe = function(recipeId) {
        var recipe = null;
        this.cuisines.forEach(function(cuisine, i, array ) {
            var found = cuisine.getRecipeById(recipeId);
            if (found) {
                logger.debug("recipe id:%s found in cuisine:%s", recipeId, cuisine.name);
                recipe = found;
            }
        });
        return recipe;
    }

    this.addCuisine = function(cuisineName) {
        var dishType = new Cuisine(cuisineName);
        var index = this.cuisines.push(dishType) -1;
        logger.debug("Added a new dish type", this.cuisines[index].name);
    }

    this.addRecipe = function(recipe) {
        logger.debug("Adding recipe"+ JSON.stringify(recipe));
        //recipe.id = uuid.v1();
        logger.debug("Assigned id:", recipe.id);
        if (recipe.cuisine !== "") {
            this.addCuisineRecipe(recipe.cuisine, recipe);
        }
        else {
            recipe.cuisine = this.defaultCuisine;
            this.addCuisineRecipe(this.defaultCuisine, recipe);
        }
    }

    this.addCuisineRecipe = function(cuisineName, recipe) {
        logger.debug("Adding to cuisine:%s recipe:%s", cuisine, JSON.stringify(recipe));
        if (!this.getCuisine(cuisineName)) {
            this.addCuisine(cuisineName);
        }
        var cuisine = this.getCuisine(cuisineName);
        cuisine.addRecipe(recipe);
        logger.debug("Added ", recipe," to ", cuisine.name);
    }

    this.updateRecipe = function(recipe) {
        logger.debug("Updating recipe "+ JSON.stringify(recipe));
        var oldRecipe = this.getRecipe(recipe.id);
        if (!oldRecipe){
            logger.debug("Recipe does not exist");
            return false;
        }
        else {
            if (oldRecipe.cuisine === recipe.cuisine) {
                var cuisine = this.getCuisine(recipe.cuisine);
                logger.debug("Replace recipe:%s of cuisine:%s", recipe.name, recipe.cuisine);
                cuisine.replaceRecipe(recipe);
            }
            else {
                var oldCuisine = this.getCuisine(oldRecipe.cuisine);
                oldCuisine.removeRecipe(recipe);
                logger.debug("Move recipe:% from cuisine:%s to cuisine:%s",
                    recipe.name, oldRecipe.cuisine, recipe.cuisine);
                this.addRecipe(recipe);
            }
            return true;
        }
    }

    this.deleteRecipe = function(recipeId) {
        var recipe = this.getRecipe(recipeId);
        if (recipe) {
            var cuisine = this.getCuisine(recipe.cuisine);
            cuisine.removeRecipe(recipe);
            return true;
        }
        else return false;
    }

    this.toStringCuisineNames = function() {
        var buffer = 'Dish.types: ';
        this.cuisines.forEach(function(element, index, array) {
            buffer += element.name + ' ';
        });
        logger.debug(buffer);
        return buffer;
    }

    this.printContent = function() {
        var buffer = [];
        this.cuisines.forEach(function(element, index, array) {
            logger.debug('[%s]:%s', index, element);
        });
    }
}

exports.Cookbook = Cookbook;
exports.Recipe = Recipe;