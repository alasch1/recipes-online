/**
 * Created by aschneider on 11/2/2015.
 */

var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();
var _ =  require('lodash');

function CookbookLookUp() {

    this.cookbook = function(cookbooks, cookbookId) {
        return _.find(cookbooks,{'id' : cookbookId});
    }

    this.cookbookByName = function(cookbooks, cookbookName) {
        return _.find(cookbooks,{'name' : cookbookName});
    }

    this.cookbookIndex = function(cookbooks, cookbookId) {
        return _.findIndex(cookbooks,{'id' : cookbookId});
    }

    this.cuisineAtCookbook = function(cookbook, cuisineId) {
        return _.find(cookbook.cuisines,{'id' : cuisineId});
    }

    this.cuisineAtCookbookByName = function(cookbook, cuisineName) {
        return _.find(cookbook.cuisines,{'name' : cuisineName});
    }

    this.cuisineIndexAtCookbook = function(cookbook, cuisineId) {
        return _.findIndex(cookbook.cuisines,{'id' : cuisineId});
    }

    this.recipeAtCookbook = function(cookbook, recipeId) {
        var recipe = null;
        cookbook.cuisines.forEach(function(cuisine, i, array) {
            var found = this.recipeAtCuisine(cuisine, recipeId);
            if (found) {
                logger.debug("recipe id:%s found in cuisine:%s", recipeId, cuisine.name);
                recipe = found;
            }
        }.bind(this));
        return recipe;
    }

    this.recipeAtCuisine = function(cuisine, recipeId) {
        return _.find(cuisine.recipes,{'id' : recipeId});
    }

    this.recipeIndexAtCuisine = function(cuisine, recipeId) {
        return _.findIndex(cuisine.recipes,{'id' : recipeId});
    }
}

var lookup = new CookbookLookUp();
module.exports = lookup;
