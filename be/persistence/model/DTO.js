/**
 * Created by aschneider on 9/22/2015.
 */

'use strict';

var logfactory = require('../../utils/logger')(module);
var logger = logfactory.createLogger();

function Ingredient(name, qty, units) {
    this.name = name;
    this.qty = qty;
    this.units = units;
}

function Recipe() {
    this.id;// = uuid.v1();
    this.name;// = name;
    this.cuisine;// = "";
    this.ingredients = [];
    this.method = [];
    logger.debug("Created recipe with id:", this.id);
}

function Cuisine(name) {
    this.id = uuid.v1();
    this.name = name;
    this.recipes = [];
}

function Cookbook(id, name, cuisines) {

    this.id = id;
    this.name = name;
    this.cuisines = cuisines;

    this.getCuisineAsString = function() {
        var result =[];
        this.cuisines.forEach(function(element, index, array) {
            result[index] = element.name;
        });
        logger.debug("collected cuisines:%s", result);
        return result;
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