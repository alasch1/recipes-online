/**
 * Created by aschneider on 10/9/2015.
 */
var winston = require('winston');
//var getModule = require('./getModule');

winston.emitErrs = true;

var getModule = function(callingModule) {
    // Returns the last folder name in the path and the calling
    // module's filename.
    var parts = callingModule.filename.split('\\');
    return parts[parts.length - 2] + '\\' + parts.pop();
}

var logFactory = function(callingModule) {

    this.callingModule = callingModule;

    createTransports = function() {
        var transports = [
            new (winston.transports.DailyRotateFile)({
                level: 'debug',
                prettyPrint: true,
                filename: '../logs/cookbook.log',
                datePattern: '.dd-MM-yyyy',
                timestamp: true,
                handleExceptions: true,
                json: false,
            }),
            new winston.transports.Console({
                level: 'debug',
                prettyPrint: true,
                colorize: true,
                json: false,
            })
        ];
        transports.forEach(function (transport) {
            transport.label = getModule(callingModule);
        });
        return transports;
    }

    createLogger = function() {
        var logger = new (winston.Logger) ({
            transports: this.createTransports(),
            exitOnError: false,
            colors: {
                debug: 'green',
                info: 'blue',
                error: 'red'    }
        });
        logger.stream = {
            write: function (message, encoding) {
                logger.info(message);
            }
        }
        return logger;
    }


    return this;
}

module.exports = logFactory;
//module.exports.stream = {
//    write:function(message, encoding) {
//        logger.info(message);
//    }
//};
