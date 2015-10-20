/**
 * Created by aschneider on 10/20/2015.
 */

var dto = require('../persistence/model/DTO');
var cookbooksData = require('../mocks/cookbookData.json');

console.log("Loaded mockdata:", JSON.stringify(cookbooksData));

function CookbookMock() {

    this.cookbooks = [];

    this.createCookbook = function (inputData, index, array) {
        var cookbook = new dto.Cookbook(inputData.id, inputData.name, inputData.cuisines);
        this.cookbooks.push(cookbook);
    }

    this.populate = function() {
        cookbooksData.forEach(this.createCookbook.bind(this));
    }

}

var mocks = new CookbookMock();
mocks.populate();
console.log('hi');
module.exports = mocks.cookbooks;