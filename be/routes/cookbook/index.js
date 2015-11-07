/**
 * Created by aschneider on 11/3/2015.
 */
var router = require('express').Router();
var cookbookController = require('./cookbook.controller');
var cuisineController = require('./cuisine.controller.js');
var recipeController = require('./recipe.controller.js');

var rootUrl='/';
var cookbookIdUrl = rootUrl + ':cookbookId';
var cuisineRootUrl = cookbookIdUrl + "/cuisine"
var cuisineIdUrl = cuisineRootUrl + '/:cuisineId';
var recipeRootUrl = cookbookIdUrl + '/recipe';
var recipeIdUrl = recipeRootUrl + '/:recipeId';

// Cookbook methods
router.get(rootUrl, cookbookController.getCookbooks);
router.post(rootUrl, cookbookController.createCookbook);
router.get(cookbookIdUrl, cookbookController.getCookbookContent);
router.put(cookbookIdUrl, cookbookController.renameCookbook);
router.delete(cookbookIdUrl, cookbookController.deleteCookbook);

// Cuisine methods
router.get(cuisineIdUrl, cuisineController.getCuisine);
router.put(cuisineIdUrl, cuisineController.updateCuisine);
router.delete(cuisineIdUrl, cuisineController.deleteCuisine);

// Recipe methods

router.post(recipeRootUrl, recipeController.addRecipe);
router.get(recipeIdUrl, recipeController.getRecipe);
router.put(recipeIdUrl, recipeController.updateRecipe);
router.delete(recipeIdUrl, recipeController.deleteRecipe);

module.exports = router;