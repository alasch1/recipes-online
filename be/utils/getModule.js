/**
 * Created by aschneider on 10/23/2015.
 */

var getModule = function(callingModule) {
    // Returns the last folder name in the path and the calling
    // module's filename.
    var parts = callingModule.filename.split('\\');
    return parts[parts.length - 2] + '\\' + parts.pop();
}

module.exports = getModule;