/**
 * Created by aschneider on 10/23/2015.
 */
var util = require('util');

var separatorLine='\n-----------------------------------------\n';

exports.getModule = function(callingModule) {
    // Returns the last folder name in the path and the calling
    // module's filename.
    var parts = callingModule.filename.split('\\');
    return parts[parts.length - 2] + '\\' + parts.pop();
}

var toStringRequestUrlInfo = function(req) {
    var str =
        ('' + req.method +
        ', url:' + req.originalUrl +
        ', params:' + JSON.stringify(req.params) +
        ', query:' + JSON.stringify(req.query));
    return str;
}

var toStringRequest = function(req) {
    var str =
        ('req:[' + toStringRequestUrlInfo(req) + ']');
    return str;
}
exports.toStringRequest = toStringRequest;

var toStringRequestWithBody = function(req) {
    var str =
    ('req:[' + toStringRequestUrlInfo(req) + ', body:' + JSON.stringify(req.body) + ']');
    return str;
}
exports.toStringRequestWithBody = toStringRequestWithBody;

var toStringResult = function(res) {
    return
    ('res:[status:' + res.statusCode +  ', message:' + res.statusMessage +
       ', contentLength:' + res._contentLength + ', hasBody:' + res._hasBody + ']');
}
exports.toStringResult = toStringResult;

var startReqHandlingString = function(req) {
    var str =
        separatorLine +
        "START handling " + toStringRequestWithBody(req) + separatorLine;
    return str;
}
exports.startReqHandlingString = startReqHandlingString;

var endReqHandlingString = function(req, res) {
    return separatorLine +
        "END handling " + toStringRequest(req) +
        ', ' + toStringResult(res) +
        separatorLine;
}
exports.endReqHandlingString = endReqHandlingString;
