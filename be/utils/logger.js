/**
 * Created by aschneider on 10/9/2015.
 */
var winston = require('winston');
//var getModule = require('./getModule');
var fs = require('fs');
var logDir = process.cwd() + '/logs';
env = process.env.NODE_ENV || 'development';
//var logger;

winston.emitErrs = true;
winston.setLevels(winston.config.npm.levels);
winston.addColors(winston.config.npm.colors);

if (!fs.existsSync(logDir) ) {
    fs.mkdirSync(logDir);
}

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
            new (winston.transports.File)({
                level: env=== 'development' ? 'debug' : 'info',
                prettyPrint: true,
                filename: logDir + '/beLogs.log',
                timestamp: true,
                handleExceptions: true,
                json: false,
                maxsize: 1024 *1024 * 10 //  10MB
            }),
            new winston.transports.Console({
                level: env=== 'development' ? 'debug' : 'info',
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

    createExceptionHandlers = function() {
        return [
            new winston.transports.File({
                prettyPrint: true,
                json: false,
                timestamp: true,
                filename: logDir + '/exceptions.log'
            })
        ]
    }

    createLogger = function() {
        var logger = new (winston.Logger) ({
            transports: this.createTransports(),
            exceptionHandlers: this.createExceptionHandlers(),
            exitOnError: false,
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
