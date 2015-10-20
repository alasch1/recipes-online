/**
 * Created by aschneider on 10/9/2015.
 */
var winston = require('winston');
winston.emitErrs = true;

//var logger1 = new winston.Logger({
//   transports:[
//       new winston.transports.File({
//           level:'debug',
//           filename:'./logs/cookbook-service.log',
//           handleExceptions: true,
//           json: false,
//           maxsize:5242880, // 5MB
//           colorize: false
//       }),
//       new winston.transports.Console({
//           level:'debug',
//           handleExceptions: true,
//           json: false,
//           colorize:true
//       })
//   ],
//    exitOnError: false
//});

var logger = function(callingModule) {
    return new (winston.Logger) ({
    transports:[
        new (winston.transports.DailyRotateFile)({
            level: 'debug',
            filename: './logs/cookbook.log',
            datePattern: '.dd-MM-yyyy',
            timestamp: true,
            handleExceptions: true,
            json: false,
            label: getModule(callingModule)
        }),
        new winston.transports.Console({
            level: 'debug',
            prettyPrint: true,
            colorize: true,
            json: false,
            label: getModule(callingModule)
        })
    ],
    colors: {
        debug: 'green',
        info: 'blue',
        error: 'red'    }
    })
}

function getModule (callingModule) {
    // Returns the last folder name in the path and the calling
    // module's filename.
    var parts = callingModule.filename.split('\\');
    return parts[parts.length - 2] + '\\' + parts.pop();
}
module.exports = logger;

module.exports.stream = {
    write:function(message, encoding) {
        logger.info(message);
    }
};