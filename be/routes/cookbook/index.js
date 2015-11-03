/**
 * Created by aschneider on 11/3/2015.
 */
var router = require('express').Router();
var cookbookController = require('./cookbook.controller');

var rootUrl='/';

router.get(rootUrl, cookbookController.getCookbookContent);

module.exports = router;