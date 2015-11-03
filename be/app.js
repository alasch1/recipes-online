var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// api
var index = require('./routes/index');
var content = require('./routes/content');
var recipe = require('./routes/recipe');

var helpers = require('./utils/helpers');
var app = express();

// Logs
var morgan = require('morgan');
var logfactory = require('./utils/logger')(module);
var logger = logfactory.createLogger();
var expressWinston = require('express-winston');
var expressWinstonLog = expressWinston.logger({transports:logfactory.createTransports()});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// logging
// Generated option (default)
app.use(morgan('dev'));

// Morgan to winston
logger.debug('Overriding express-logger');
//app.use(morgan('combined', {"stream":logger.stream}));
//app.use(morgan({"stream": logger.stream}));
app.use(morgan('{"remote_addr": ":remote-addr", "remote_user": ":remote-user", "date": ":date[clf]", "method": ":method", "url": ":url", "http_version": ":http-version", "status": ":status", "result_length": ":res[content-length]", "referrer": ":referrer", "user_agent": ":user-agent", "response_time": ":response-time"}',
    {"stream": logger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

function logStart(req, res, next) {
    logger.info(helpers.startReqHandlingString(req));
    next();
}

// This is not in use -cause errors
function logEnd(req,res,next) {
    logger.info(helpers.endReqHandlingString(req,res));
    if (next) next();
}

app.use(logStart);
// Place the express-winston logger before the router.
app.use(expressWinstonLog);

app.use('/', index);
app.use('/cookbook', index);
app.use('/content', content);
app.use('/recipe', recipe);
app.use('/cuisine', require('./routes/cuisine'));

// Place the express-winston errorLogger after the router.
app.use(expressWinstonLog);

/** Examples of local data, visible for each ejs
app.locals.cuisines = [
  {name:'pizza'},
  {name:'indian'}
];

app.locals.cookbookData = require('./cookbookData.json');
**/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('pages/error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('pages/error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;


