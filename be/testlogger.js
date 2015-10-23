/**
 * Created by aschneider on 10/9/2015.
 */
var logfactory = require('./utils/logger')(module);
var logger = logfactory.createLogger();

logger.info('This is info message');
logger.debug('This is debug message');

var transports =  logfactory.createTransports();
logger.info("transports size:"+ transports.length);


//exports.test = function() {
//    return 'test';
//}
