/**
 * Created by aschneider on 10/20/2015.
 */

var dto = require('../persistence/model/DTO');
var cookbooksData = require('../mocks/cookbookData.json');
var logfactory = require('../utils/logger')(module);
var logger = logfactory.createLogger();

//console.log("Loaded cookbooksData:", JSON.stringify(cookbooksData));
logger.info("Loaded cookbooksData");

function CookbookMock() {

    this.cookbooks = [];

    this.createCookbook = function (inputData, index, array) {
        var cookbook = new dto.Cookbook(inputData.id, inputData.name, inputData.cuisines);
        this.cookbooks.push(cookbook);
    }

    this.populate = function() {
        cookbooksData.forEach(this.createCookbook.bind(this));
        //console.log("Populated cookbooks:", JSON.stringify(this.cookbooks));
    }

}

var mocks = new CookbookMock();
mocks.populate();
logger.info("mock was populated");

(function test() {
    var cookbook = mocks.cookbooks[0];
    console.log(JSON.stringify(cookbook));
})();
module.exports = mocks.cookbooks;