/// <reference path="../definitions/jquery.d.ts" />
/**
 * Created by naviyehezkel on 19/07/2015.
 */
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var http;
            (function (http) {
                (function (HttpMethod) {
                    HttpMethod[HttpMethod["GET"] = 0] = "GET";
                    HttpMethod[HttpMethod["POST"] = 1] = "POST";
                    HttpMethod[HttpMethod["PUT"] = 2] = "PUT";
                    HttpMethod[HttpMethod["DELETE"] = 3] = "DELETE";
                })(http.HttpMethod || (http.HttpMethod = {}));
                var HttpMethod = http.HttpMethod;
                ;
                var WebServiceRequest = (function () {
                    function WebServiceRequest() {
                    }
                    return WebServiceRequest;
                })();
                http.WebServiceRequest = WebServiceRequest;
                ;
                var WebServiceResponse = (function () {
                    function WebServiceResponse() {
                    }
                    WebServiceResponse.prototype.isPlainText = function () {
                        var contenTypeHeader = this.headers['Content-Type'];
                        return (contenTypeHeader && contenTypeHeader.indexOf('text/plain') != -1);
                    };
                    return WebServiceResponse;
                })();
                http.WebServiceResponse = WebServiceResponse;
                ;
                var WebServiceProxy = (function () {
                    function WebServiceProxy() {
                    }
                    WebServiceProxy.prototype.invokeAsync = function (request, callback, errorCallback) {
                        var url = this.rootUrl;
                        if (request.route != null && request.route != undefined) {
                            url += "/" + request.route;
                        }
                        var requestBody;
                        if (request.parameters != null) {
                            if (request.httpMethod == HttpMethod.GET) {
                                url += "?" + jQuery.param(request.parameters);
                            }
                            else {
                                if (typeof (request.parameters) === "object") {
                                    requestBody = JSON.stringify(request.parameters);
                                }
                                else {
                                    requestBody = request.parameters;
                                }
                            }
                        }
                        var wrappedCallback = this.wrapCallback(this, callback, errorCallback);
                        var ajaxSettings = {
                            url: url,
                            type: HttpMethod[request.httpMethod],
                            complete: wrappedCallback,
                            timeout: 30 * 1000,
                            contentType: "application/json",
                            async: !request.isSynchronized
                        };
                        if (request.httpMethod != HttpMethod.GET) {
                            ajaxSettings.data = requestBody;
                        }
                        if (this.overrideRequestHeaders != null) {
                            ajaxSettings.headers = this.overrideRequestHeaders();
                        }
                        jQuery.ajax(ajaxSettings);
                    };
                    WebServiceProxy.prototype.wrapCallback = function (context, callback, errorCallback) {
                        return function (jqXhr, ajaxStatus) {
                            var response = new WebServiceResponse();
                            response.status = ajaxStatus;
                            response.statusCode = jqXhr.status;
                            response.statusText = jqXhr.statusText;
                            response.responseText = jqXhr.responseText;
                            response.headers = WebServiceProxy.parseResponseHeaders(jqXhr);
                            if (!WebServiceProxy.isSuccessStatus(response.statusCode)) {
                                //Not OK
                                if (errorCallback != null) {
                                    errorCallback(response);
                                }
                                return;
                            }
                            try {
                                if (!response.isPlainText()) {
                                    if (this.overrideDefaultSerializer == null) {
                                        response.returnValue = JSON.parse(response.responseText);
                                    }
                                    else {
                                        response.returnValue = context.overrideDefaultSerializer(jqXhr);
                                    }
                                }
                            }
                            catch (error) {
                                var errorMessage = "WebServiceProxy failed to process the response. Error: " + error;
                                if (errorCallback != null) {
                                    response.statusText += ". " + errorMessage;
                                    errorCallback(response);
                                }
                                else {
                                    throw new Error(errorMessage);
                                }
                            }
                            if (callback != null)
                                callback(response);
                        };
                    };
                    WebServiceProxy.parseResponseHeaders = function (jqXhr) {
                        var headersAsString = jqXhr.getAllResponseHeaders();
                        var headers = {};
                        if (headersAsString != null) {
                            var keyValuePairs = headersAsString.split("\n");
                            for (var i = 0; i < keyValuePairs.length; i++) {
                                var keyValue = keyValuePairs[i].split(":");
                                if (keyValue.length != 2)
                                    continue;
                                var key = jQuery.trim(keyValue[0]);
                                headers[key] = jQuery.trim(keyValue[1]);
                            }
                        }
                        return headers;
                    };
                    WebServiceProxy.isSuccessStatus = function (statusCode) {
                        switch (statusCode) {
                            case 200:
                            case 201:
                                return true;
                            default:
                                return false;
                        }
                    };
                    return WebServiceProxy;
                })();
                http.WebServiceProxy = WebServiceProxy;
            })(http = ui.http || (ui.http = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by naviyehezkel on 26/07/2015.
 */
/// <reference path="./WebServiceProxy.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var http;
            (function (http) {
                var CookbookRequest = (function () {
                    function CookbookRequest(data, httpMethod, route) {
                        this._data = data;
                        this._httpMethod = typeof (httpMethod) === "undefined" ? http.HttpMethod.POST : httpMethod;
                        this._route = route || "";
                    }
                    CookbookRequest.prototype.getData = function () {
                        return this._data;
                    };
                    CookbookRequest.prototype.setData = function (data) {
                        this._data = data;
                    };
                    CookbookRequest.prototype.getHttpMethod = function () {
                        return this._httpMethod;
                    };
                    CookbookRequest.prototype.setHttpMethod = function (httpMethod) {
                        this._httpMethod = httpMethod;
                    };
                    CookbookRequest.prototype.setRoute = function (route) {
                        this._route = route;
                    };
                    CookbookRequest.prototype.getRoute = function () {
                        return this._route;
                    };
                    CookbookRequest.prototype.validate = function () {
                        if (this._httpMethod == http.HttpMethod.GET && this.getRoute() == "") {
                            throw new Error("Invalid request. " +
                                "When invoking a service request with the 'Http GET' method, the deriving class must implement the getRoute() method.");
                        }
                    };
                    CookbookRequest.prototype.toString = function () {
                        return ('[' + this._httpMethod +
                            ', path:' + this.getRoute() +
                            ', data:' + JSON.stringify(this._data) + ']');
                    };
                    return CookbookRequest;
                })();
                http.CookbookRequest = CookbookRequest;
                var CookbookResponse = (function (_super) {
                    __extends(CookbookResponse, _super);
                    function CookbookResponse() {
                        _super.apply(this, arguments);
                    }
                    CookbookResponse.prototype.toString = function () {
                        return ('[' + JSON.stringify(this.data) + ']');
                    };
                    return CookbookResponse;
                })(http.WebServiceResponse);
                http.CookbookResponse = CookbookResponse;
            })(http = ui.http || (ui.http = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 8/10/2015.
 */
/// <reference path="../definitions/jquery.d.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var utils;
            (function (utils) {
                var LogLevel;
                (function (LogLevel) {
                    LogLevel[LogLevel["INFO"] = 0] = "INFO";
                    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
                    LogLevel[LogLevel["WARNING"] = 2] = "WARNING";
                    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
                })(LogLevel || (LogLevel = {}));
                var TraceEntity = (function () {
                    function TraceEntity(level, msg) {
                        this.level = level;
                        this.msg = msg;
                        this.time = new Date().toString().split(" ")[4];
                    }
                    return TraceEntity;
                })();
                var LoggerFactory = (function () {
                    function LoggerFactory() {
                    }
                    LoggerFactory.getLogger = function (name) {
                        return new Logger(name, LoggerFactory.getTraceConsole());
                    };
                    LoggerFactory.getTraceConsole = function () {
                        if (!LoggerFactory.traceConsole) {
                            LoggerFactory.traceConsole = new TraceConsole();
                        }
                        return LoggerFactory.traceConsole;
                    };
                    return LoggerFactory;
                })();
                utils.LoggerFactory = LoggerFactory;
                var TraceConsole = (function () {
                    function TraceConsole() {
                        this.logEntries = [];
                        this.isVisible = true;
                        this.hide();
                    }
                    TraceConsole.prototype.append2log = function (logMsg) {
                        if (this.logEntries.length >= TraceConsole.consoleLimit) {
                            this.logEntries.shift();
                        }
                        this.logEntries.push(logMsg);
                    };
                    TraceConsole.prototype.toggleDisplay = function () {
                        if (this.isVisible) {
                            this.hide();
                        }
                        else {
                            this.show();
                        }
                    };
                    TraceConsole.prototype.show = function () {
                        this.isVisible = true;
                        $(TraceConsole.traceContainerId).show();
                    };
                    TraceConsole.prototype.hide = function () {
                        this.isVisible = false;
                        $(TraceConsole.traceContainerId).hide();
                    };
                    TraceConsole.prototype.append2Dom = function (entity) {
                        var traceRow = document.createElement("div");
                        traceRow.className = TraceConsole.logLevel2CssClass(entity.level);
                        var node = document.createTextNode(entity.time + " " + entity.msg);
                        traceRow.appendChild(node);
                        if (!this.traceDivElement) {
                            // The lazy init to ensure that the DOM already exists
                            this.traceDivElement = $(TraceConsole.traceConsoleId).get(0);
                        }
                        this.traceDivElement.appendChild(traceRow);
                    };
                    // TraceConsole operation
                    TraceConsole.prototype.document_OnKeydown = function (keyEvent) {
                        var keyCode = (keyEvent.keyCode || keyEvent.which);
                        var targetKeyCode = "X".charCodeAt(0);
                        if (keyEvent.ctrlKey && keyEvent.shiftKey && keyCode == targetKeyCode) {
                            // shift+ctrl+X were pressed
                            LoggerFactory.getTraceConsole().toggleDisplay();
                        }
                    };
                    TraceConsole.logLevel2CssClass = function (level) {
                        var cssClass = "logItem ";
                        var defaultCssClass = "logLevelInfo";
                        switch (level) {
                            case LogLevel.INFO:
                                cssClass += "logLevelInfo";
                                break;
                            case LogLevel.DEBUG:
                                cssClass += "logLevelDebug";
                                break;
                            case LogLevel.WARNING:
                                cssClass += "logLevelWarning";
                                break;
                            case LogLevel.ERROR:
                                cssClass += "logLevelError";
                                break;
                            default:
                                cssClass += defaultCssClass;
                                break;
                        }
                        return cssClass;
                    };
                    TraceConsole.consoleLimit = 500;
                    TraceConsole.traceContainerId = "#TraceContainer";
                    TraceConsole.traceConsoleId = "#TraceConsole";
                    return TraceConsole;
                })();
                utils.TraceConsole = TraceConsole;
                // An individual _logger for a specific software component
                // Is responsible to format log message and put it to console
                var Logger = (function () {
                    function Logger(name, traceConsole) {
                        this.name = name;
                        this.traceConsole = traceConsole;
                    }
                    Logger.prototype.info = function (msg) {
                        this.log(LogLevel.INFO, msg);
                    };
                    Logger.prototype.debug = function (msg) {
                        this.log(LogLevel.DEBUG, msg);
                    };
                    Logger.prototype.warning = function (msg) {
                        this.log(LogLevel.WARNING, msg);
                    };
                    Logger.prototype.error = function (msg) {
                        this.log(LogLevel.ERROR, msg);
                    };
                    Logger.prototype.log = function (logLevel, msg) {
                        msg = "[" + this.name + "] " + msg;
                        var logMsg = new TraceEntity(logLevel, msg);
                        this.traceConsole.append2log(logMsg);
                        this.traceConsole.append2Dom(logMsg);
                    };
                    return Logger;
                })();
                utils.Logger = Logger;
            })(utils = ui.utils || (ui.utils = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
$(document).ready(function () {
    var traceConsole = alasch.cookbook.ui.utils.LoggerFactory.getTraceConsole();
    $(document).keydown(traceConsole.document_OnKeydown.bind(traceConsole));
});
/**
 * Created by naviyehezkel on 19/07/2015.
 */
/// <reference path="./WebServiceProxy.ts" />
/// <reference path="./CookbookRequestResponse.ts" />
/// <reference path="../utils/TraceConsole.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var http;
            (function (http) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger("CookbookServiceProxy");
                var CookbookServiceProxy = (function () {
                    function CookbookServiceProxy() {
                        this._proxy = new http.WebServiceProxy();
                    }
                    CookbookServiceProxy.prototype.init = function () {
                        this._proxy.rootUrl = CookbookServiceProxy._rootPath;
                    };
                    CookbookServiceProxy.prototype.getCookbooks = function (onSuccess, onError) {
                        var request = new http.CookbookRequest(null, http.HttpMethod.GET, CookbookServiceProxy._cookbookPath);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.getCookbookContent = function (cookbookId, onSuccess, onError) {
                        var route = this.buildCookbookIdUrl(cookbookId) + "/content";
                        var request = new http.CookbookRequest(null, http.HttpMethod.GET, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.addRecipe = function (cookbookId, input, onSuccess, onError) {
                        var route = this.buildRecipeUrl(cookbookId);
                        var request = new http.CookbookRequest(input, http.HttpMethod.POST, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.updateRecipe = function (cookbookId, input, onSuccess, onError) {
                        var route = this.buildRecipeIdUrl(cookbookId, input.id);
                        var request = new http.CookbookRequest(input, http.HttpMethod.PUT, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.getRecipe = function (cookbookId, recipeId, onSuccess, onError) {
                        var route = this.buildRecipeIdUrl(cookbookId, recipeId);
                        var request = new http.CookbookRequest(null, http.HttpMethod.PUT, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.deleteRecipe = function (cookbookId, recipeId, onSuccess, onError) {
                        var route = this.buildRecipeIdUrl(cookbookId, recipeId);
                        var request = new http.CookbookRequest(null, http.HttpMethod.DELETE, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.deleteCuisine = function (cookbookId, cuisineId, onSuccess, onError) {
                        var route = this.buildCuisineIdUrl(cookbookId, cuisineId);
                        var request = new http.CookbookRequest(null, http.HttpMethod.DELETE, route);
                        this.invokeRequest(request, onSuccess, onError);
                    };
                    CookbookServiceProxy.prototype.buildCookbookIdUrl = function (cookbookId) {
                        return CookbookServiceProxy._cookbookPath + "/" + cookbookId;
                    };
                    CookbookServiceProxy.prototype.buildRecipeUrl = function (cookbookId) {
                        return this.buildCookbookIdUrl(cookbookId) + "/" + CookbookServiceProxy._recipePath;
                    };
                    CookbookServiceProxy.prototype.buildCuisineIdUrl = function (cookbookId, cuisineId) {
                        return this.buildCookbookIdUrl(cookbookId) + "/" + CookbookServiceProxy._cuisinePath + "/" + cuisineId;
                    };
                    CookbookServiceProxy.prototype.buildRecipeIdUrl = function (cookbookId, recipeId) {
                        return this.buildRecipeUrl(cookbookId) + "/" + recipeId;
                    };
                    CookbookServiceProxy.prototype.invokeRequest = function (request, onSuccess, onError) {
                        try {
                            logger.info('Invoked request input:' + request.toString());
                            request.validate();
                            var wsRequest = new http.WebServiceRequest();
                            wsRequest.parameters = request.getData();
                            wsRequest.route = request.getRoute();
                            wsRequest.httpMethod = request.getHttpMethod();
                            logger.info("[TO CBK] - Sending request" + request.toString());
                            this._proxy.invokeAsync(wsRequest, function (result) {
                                CookbookServiceProxy.onSuccess(request, result, onSuccess, onError);
                            }, function (result) {
                                CookbookServiceProxy.onError(request, result, onError);
                            });
                        }
                        catch (e) {
                            if (onError != null)
                                onError();
                        }
                    };
                    CookbookServiceProxy.onSuccess = function (request, result, onSuccessCB, onErrorCB) {
                        if (result.statusCode === 200 || result.statusCode === 201) {
                            logger.info("[FROM CBK] - Recieved OK result - " + CookbookServiceProxy.toStringResultBody(result));
                            if (onSuccessCB != null) {
                                onSuccessCB(result.returnValue);
                            }
                        }
                        else if (onErrorCB != null) {
                            logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result));
                            onErrorCB(result.statusCode);
                        }
                        else {
                            logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result) +
                                "; no error callback is defined.");
                        }
                    };
                    CookbookServiceProxy.toStringResultBody = function (result) {
                        if (result.returnValue) {
                            return 'body:' + result.returnValue.toString();
                        }
                        else {
                            return 'body:none';
                        }
                    };
                    CookbookServiceProxy.onError = function (request, result, onErrorCB) {
                        logger.error("[FROM CBK] - Recieved failure result:" + CookbookServiceProxy.toStringResultBody(result));
                        //var rsvpResponse = <CookbookResponse<T>>JSON.parse(result.responseText);
                        if (onErrorCB != null) {
                            onErrorCB(result.statusCode);
                        }
                    };
                    // URLS
                    CookbookServiceProxy._rootPath = '';
                    CookbookServiceProxy._cookbookPath = 'cookbook';
                    CookbookServiceProxy._recipePath = 'recipe';
                    CookbookServiceProxy._cuisinePath = 'cuisine';
                    return CookbookServiceProxy;
                })();
                http.CookbookServiceProxy = CookbookServiceProxy;
            })(http = ui.http || (ui.http = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/24/2015.
 */
/// <reference path="../definitions/jquery.d.ts" />
///<reference path="../http/CookbookServiceProxy.ts"/>
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var AppEventListener = (function () {
                    function AppEventListener() {
                    }
                    return AppEventListener;
                })();
                views.AppEventListener = AppEventListener;
                ;
                var BaseWidget = (function () {
                    function BaseWidget(selector, appEventListener, cbkServiceProxy) {
                        this._element = $(selector);
                        this._cbkServiceProxy = cbkServiceProxy;
                        this._appEventListener = appEventListener;
                    }
                    BaseWidget.prototype.init = function () {
                        if (!this._cbkServiceProxy) {
                        }
                    };
                    return BaseWidget;
                })();
                views.BaseWidget = BaseWidget;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/26/2015.
 */
/// <reference path="../utils/TraceConsole.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var model;
            (function (model) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Cookbook');
                //export class IngredientDTO {
                //    name: string;
                //    qty: number;
                //    units:string;
                //
                //    constructor() {
                //        this.name = "";
                //        this.qty = 0;
                //        this.units = "";
                //    }
                //};
                var RecipeDTO = (function () {
                    function RecipeDTO() {
                        this.ingredients = new Array();
                    }
                    return RecipeDTO;
                })();
                model.RecipeDTO = RecipeDTO;
                ;
                var CuisineDTO = (function () {
                    function CuisineDTO(name) {
                        this.name = name;
                        this.recipes = new Array();
                    }
                    CuisineDTO.prototype.setRecipes = function (recipes) {
                        this.recipes = recipes;
                    };
                    return CuisineDTO;
                })();
                model.CuisineDTO = CuisineDTO;
                ;
                var CookbookDTO = (function () {
                    function CookbookDTO(id, name) {
                        this.id = id;
                        this.name = name;
                        this.cuisines = new Array();
                    }
                    return CookbookDTO;
                })();
                model.CookbookDTO = CookbookDTO;
                ;
            })(model = ui.model || (ui.model = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/28/2015.
 */
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var utils;
            (function (utils) {
                ;
                var GridCell = (function () {
                    function GridCell(element, data) {
                        this._cellData = data;
                        this._cellElement = element;
                    }
                    return GridCell;
                })();
                var Grid = (function () {
                    function Grid(templateSelector, gridContainer) {
                        this._cells = new Array();
                        this._cellTemplate = $(templateSelector);
                        this._gridContainer = gridContainer;
                    }
                    Grid.prototype.addCell = function (data, onBindTemplate) {
                        var cellElement;
                        cellElement = this._cellTemplate.clone();
                        if (onBindTemplate != null) {
                            onBindTemplate(cellElement, data);
                        }
                        // Save data in the internal grid collection
                        var cell = new GridCell(cellElement, data);
                        this._cells.push(cell);
                        this._gridContainer.append(cellElement);
                        return cellElement;
                    };
                    Grid.prototype.getCells = function () {
                        return this._cells;
                    };
                    Grid.prototype.clear = function () {
                        this._cells = [];
                    };
                    return Grid;
                })();
                utils.Grid = Grid;
                ;
            })(utils = ui.utils || (ui.utils = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 10/3/2015.
 */
/// <reference path="../utils/TraceConsole.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var utils;
            (function (utils) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Helpers');
                var Helpers = (function () {
                    function Helpers() {
                    }
                    Helpers.classSelector = function (className) {
                        return "." + className;
                    };
                    Helpers.idSelector = function (id) {
                        return "#" + id;
                    };
                    return Helpers;
                })();
                utils.Helpers = Helpers;
            })(utils = ui.utils || (ui.utils = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/29/2015.
 */
/// <reference path="./../BaseWidget.ts" />
/// <reference path="../../utils/TraceConsole.ts" />
/// <reference path="../../model/CookbookDTO.ts" />
/// <reference path="../../utils/Grid.ts" />
/// <reference path="../../utils/Helpers.ts" />
/// <reference path="../../definitions/bootstrap.d.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ViewRecipeWidget');
                var utils = alasch.cookbook.ui.utils;
                var model = alasch.cookbook.ui.model;
                var http = alasch.cookbook.ui.http;
                var RECIPE_TABS_CONTAINER_ID = 'recipe-views-container-id';
                var RECIPE_VIEW_NAV_BAR_ID = 'recipe-view-nav-id';
                var RECIPE_VIEW_TAB_CONTENT_CLASS = 'tab-content'; //"#recipe-view-tabs-id";
                var NO_RECIPE_VIEW_TAB_ID = 'no-recipe-tab';
                var RECIPE_VIEW_TEMPLATE_CLASS = 'recipe-view-template';
                var INGRED_TABLE_LABEL_SELECTOR = '.recipe-ingreds-table-label-js';
                var INGRED_TABLE_SELECTOR = '.recipe-ingreds-table-js';
                var INGRED_ROW_TEMPLATE_SELECTOR = '.ingred-row-template';
                var RecipeDataBinder = (function () {
                    function RecipeDataBinder() {
                    }
                    RecipeDataBinder.prototype.run = function (recipeDataView, recipe) {
                        logger.info("binding to tab content recipe:" + recipe.name);
                        recipeDataView.removeClass(RECIPE_VIEW_TEMPLATE_CLASS);
                        recipeDataView.find(".recipe-view-heading").text(recipe.name);
                        recipeDataView.find("#recipe-cuisine").text(recipe.cuisine);
                        var ingredTableId = "ingred-table-id-" + recipe.id;
                        var ingredTable = recipeDataView.find(INGRED_TABLE_SELECTOR);
                        ingredTable.attr("id", ingredTableId);
                        var ingredTabLabel = recipeDataView.find(INGRED_TABLE_LABEL_SELECTOR);
                        ingredTabLabel.attr("for", ingredTableId);
                        this.appendIngredientsTable(ingredTable, recipe);
                        recipeDataView.find("#recipe-method").text(recipe.method);
                    };
                    RecipeDataBinder.prototype.appendIngredientsTable = function (ingredTable, data) {
                        var ingredGrid = new utils.Grid(INGRED_ROW_TEMPLATE_SELECTOR, ingredTable);
                        if (data.ingredients.length > 0) {
                            data.ingredients.forEach(function (ingredient, index, array) {
                                ingredGrid.addCell(ingredient, this.appendIngredient);
                            }.bind(this));
                        }
                        else {
                            // Add no-data row
                            ingredGrid.addCell(null, this.appendIngredient);
                        }
                    };
                    RecipeDataBinder.prototype.appendIngredient = function (ingredTableRow, data) {
                        ingredTableRow.removeClass("ingred-row-template");
                        var noData = ' - ';
                        var dataElem = ingredTableRow.find(".ingred-data").text(noData);
                        if (data) {
                            //var buf:string = "";
                            //if (data.qty) {
                            //    buf += data.qty;
                            //    if (data.units) {
                            //        buf += " " + data.units;
                            //    }
                            //}
                            //buf += " " + data.name + "";
                            dataElem.text(data);
                        }
                    };
                    return RecipeDataBinder;
                })();
                ;
                var CloseButtonHelper = (function () {
                    function CloseButtonHelper() {
                    }
                    CloseButtonHelper.btnId = function (recipeId) {
                        var btnIdPrefix = 'btn-close-';
                        return btnIdPrefix + recipeId;
                    };
                    CloseButtonHelper.templatePattern = function (recipeId) {
                        //var pattern='<span><button type="button" id="btn-close-id-"' + recipe.id +
                        //    'class="btn-submit"><span class="glyphicon glyphicon-remove"></span></button></span>';
                        var pattern = '<span><button type="button" id="' + CloseButtonHelper.btnId(recipeId) +
                            '" class="btn-submit btn-close-recipe-view-js">x</span></button></span>';
                        return pattern;
                    };
                    CloseButtonHelper.bindOnClick = function (recipeId, onTabRemoved) {
                        var btnElement = $('#' + CloseButtonHelper.btnId(recipeId));
                        btnElement.click(CloseButtonHelper.onBtnClick);
                        btnElement.get(0)[CloseButtonHelper.TAB_REMOVED_HANDLER] = onTabRemoved;
                    };
                    CloseButtonHelper.onBtnClick = function () {
                        var onTabRemoved = $(this).prop(CloseButtonHelper.TAB_REMOVED_HANDLER);
                        //$(this).parents('li').remove('li');
                        var liParent = $(this).parents('li');
                        var tabId = $(this).parents('li').children('a').attr('href');
                        liParent.remove('li');
                        $(tabId).remove();
                        onTabRemoved();
                    };
                    CloseButtonHelper.TAB_REMOVED_HANDLER = "onTabRemoved";
                    return CloseButtonHelper;
                })();
                ;
                var ViewRecipeWidget = (function (_super) {
                    __extends(ViewRecipeWidget, _super);
                    function ViewRecipeWidget() {
                        _super.call(this, utils.Helpers.idSelector(RECIPE_TABS_CONTAINER_ID), null);
                        this._openViewsCtr = 0;
                        this._viewsTabContainer = $(utils.Helpers.idSelector(RECIPE_TABS_CONTAINER_ID));
                        this._navBarElement = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID));
                        this._tabContentElement = $(utils.Helpers.classSelector(RECIPE_VIEW_TAB_CONTENT_CLASS));
                        this._noRecipeTab = $(utils.Helpers.idSelector(NO_RECIPE_VIEW_TAB_ID));
                        this._element.click(this.onClick.bind(this));
                    }
                    ViewRecipeWidget.getInstance = function () {
                        if (!ViewRecipeWidget.singleton) {
                            ViewRecipeWidget.singleton = new ViewRecipeWidget();
                        }
                        return ViewRecipeWidget.singleton;
                    };
                    ViewRecipeWidget.viewRecipe = function (recipe) {
                        ViewRecipeWidget.getInstance().showRecipe(recipe);
                    };
                    ViewRecipeWidget.prototype.showRecipe = function (recipe) {
                        var recipeNavTab = this.findRecipeView(recipe.id);
                        if (!recipeNavTab) {
                            this.appendRecipeView(recipe);
                            this._openViewsCtr++;
                            logger.debug("this._openViewsCtr++:" + this._openViewsCtr);
                        }
                        else {
                            // select the recipe
                            this.selectTab(this.buildRecipeTabId(recipe.id));
                        }
                        this.hideDefaultTab();
                        // set focus on the tab
                        this._tabContentElement.focus();
                    };
                    ViewRecipeWidget.prototype.showDefaultTab = function () {
                        this._navBarElement.find(this.buildTabSelector(NO_RECIPE_VIEW_TAB_ID)).show();
                        this.selectTab(NO_RECIPE_VIEW_TAB_ID);
                    };
                    ViewRecipeWidget.prototype.selectTab = function (tabPaneId) {
                        this._navBarElement.find(this.buildTabSelector(tabPaneId)).tab('show');
                    };
                    ViewRecipeWidget.prototype.hideDefaultTab = function () {
                        this._navBarElement.find(this.buildTabSelector(NO_RECIPE_VIEW_TAB_ID)).hide();
                    };
                    ViewRecipeWidget.prototype.onTabRemoved = function () {
                        var lastTab = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last');
                        this._openViewsCtr--;
                        logger.debug("this._openViewsCtr--:" + this._openViewsCtr);
                        if (this._openViewsCtr > 0) {
                            lastTab.tab('show');
                        }
                        else {
                            this.showDefaultTab();
                        }
                    };
                    ViewRecipeWidget.prototype.findRecipeView = function (recipeId) {
                        //var look4selector =  '#recipe-view-nav-id .a[href="#recipe-tab-' + recipeId +'"]';
                        var recipeView = this._navBarElement.find(this.buildTabSelector(this.buildRecipeTabId(recipeId)));
                        //var recipeView:JQuery = $(look4selector);
                        if (recipeView.length > 0) {
                            logger.debug("Recipe:" + recipeId + " view is already opened");
                            return recipeView;
                        }
                        else
                            return null;
                    };
                    ViewRecipeWidget.prototype.appendRecipeView = function (recipe) {
                        // create the tab
                        //$('<li id="recipe-nav-' + recipe.id + '"><a data-toggle="tab" href="#recipe-tab-'+recipe.id+'">'+recipe.name+'</a></li>').appendTo(this._navBarElement);
                        var recipeNavTab = $('<li id="recipe-nav-' + recipe.id + '"><a data-toggle="tab" href="#recipe-tab-' + recipe.id + '">'
                            + CloseButtonHelper.templatePattern(recipe.id) + '&nbsp;' + recipe.name + '</a></li>');
                        if (recipeNavTab.length == 0) {
                            logger.error("Failed to create nav tab for recipe " + recipe.name);
                            return;
                        }
                        recipeNavTab.appendTo(this._navBarElement);
                        // create the tab content
                        //$('<div id=recipe-tab-'+recipe.id+' class="tab-pane"></div>').appendTo(this._tabContentElement);
                        var recipeViewContent = $('<div id=recipe-tab-' + recipe.id + ' class="tab-pane"></div>');
                        if (recipeViewContent.length == 0) {
                            logger.error("Failed to create tab content for recipe " + recipe.name);
                            return;
                        }
                        recipeViewContent.appendTo(this._tabContentElement);
                        this.appendRecipeViewTemplate(recipeViewContent, recipe);
                        CloseButtonHelper.bindOnClick(recipe.id, this.onTabRemoved.bind(this));
                        // make the new tab active
                        var lastTab = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last');
                        lastTab.tab('show');
                        //$(idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last').tab('show');
                    };
                    ViewRecipeWidget.prototype.appendRecipeViewTemplate = function (recipeTabContent, recipe) {
                        var grid = new utils.Grid(utils.Helpers.classSelector(RECIPE_VIEW_TEMPLATE_CLASS), recipeTabContent);
                        var recipeDataFill = new RecipeDataBinder();
                        var recipeDataView = grid.addCell(recipe, recipeDataFill.run.bind(recipeDataFill));
                    };
                    ViewRecipeWidget.prototype.buildRecipeTabId = function (recipeId) {
                        return 'recipe-tab-' + recipeId;
                    };
                    ViewRecipeWidget.prototype.buildTabSelector = function (tabPaneId) {
                        var recipeTabSelector = 'a[href="#' + tabPaneId + '"]';
                        return recipeTabSelector;
                    };
                    ViewRecipeWidget.prototype.onClick = function (eventObject) {
                        // If click is on close tab button - close the tab
                        var jqElement = $(eventObject.target);
                        if (jqElement) {
                            var closeBtn = jqElement.hasClass(" btn-close-recipe-view-js");
                            if (closeBtn) {
                                alert("Haha !");
                            }
                        }
                    };
                    return ViewRecipeWidget;
                })(views.BaseWidget);
                views.ViewRecipeWidget = ViewRecipeWidget;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 10/10/2015.
 */
/// <reference path="../utils/Helpers.ts" />
/// <reference path="../definitions/bootstrap.d.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ModalDialogs');
                var utils = alasch.cookbook.ui.utils;
                (function (OperationResultId) {
                    OperationResultId[OperationResultId["updateOk"] = 0] = "updateOk";
                    OperationResultId[OperationResultId["updateFailed"] = 1] = "updateFailed";
                    OperationResultId[OperationResultId["createOk"] = 2] = "createOk";
                    OperationResultId[OperationResultId["createFailed"] = 3] = "createFailed";
                    OperationResultId[OperationResultId["deleteOk"] = 4] = "deleteOk";
                    OperationResultId[OperationResultId["deleteFailed"] = 5] = "deleteFailed";
                })(views.OperationResultId || (views.OperationResultId = {}));
                var OperationResultId = views.OperationResultId;
                var OperationResultModals = (function () {
                    function OperationResultModals() {
                        this._dialogs = {};
                        this.init();
                    }
                    OperationResultModals.prototype.show = function (operationResultId) {
                        var dlg = this._dialogs[operationResultId];
                        dlg.modal('show');
                    };
                    OperationResultModals.prototype.init = function () {
                        // init dialogs
                        this._dialogs[OperationResultId.updateOk] = this.getDialog('update-ok-dlg');
                        this._dialogs[OperationResultId.updateFailed] = this.getDialog('update-err-dlg');
                        this._dialogs[OperationResultId.createOk] = this.getDialog('create-ok-dlg');
                        this._dialogs[OperationResultId.createFailed] = this.getDialog('create-err-dlg');
                        this._dialogs[OperationResultId.deleteOk] = this.getDialog('delete-ok-dlg');
                        this._dialogs[OperationResultId.deleteFailed] = this.getDialog('delete-err-dlg');
                    };
                    OperationResultModals.prototype.getDialog = function (dlgId) {
                        return $(utils.Helpers.idSelector(dlgId)).clone();
                    };
                    return OperationResultModals;
                })();
                var SubmitHandler = (function () {
                    function SubmitHandler(method, data) {
                        this.method = method;
                        this.data = data;
                    }
                    return SubmitHandler;
                })();
                views.SubmitHandler = SubmitHandler;
                ;
                var SubmitDeleteModal = (function () {
                    function SubmitDeleteModal() {
                        this._dlgId = 'submit-delete-recipe-dlg';
                        this._submitBtnPrefix = 'submit-btn-';
                        this.init();
                    }
                    SubmitDeleteModal.prototype.init = function () {
                        this._dialog = $(utils.Helpers.idSelector(this._dlgId)).clone();
                        this._submitBtn = $(utils.Helpers.idSelector(this._submitBtnPrefix + this._dlgId), this._dialog);
                        //this._cancelBtn = $(utils.Helpers.idSelector(this._cancelBtnPrefix+this._dlgId), this._dialog);
                        this._submitBtn.click(this.onSubmitClick.bind(this));
                    };
                    SubmitDeleteModal.prototype.show = function (submitHandler) {
                        this._submitHandler = submitHandler;
                        this._dialog.modal('show');
                    };
                    SubmitDeleteModal.prototype.onSubmitClick = function () {
                        this._dialog.modal('hide');
                        this._submitHandler.method(this._submitHandler.data);
                    };
                    return SubmitDeleteModal;
                })();
                var ModalDialogsHandler = (function () {
                    function ModalDialogsHandler() {
                    }
                    ModalDialogsHandler.showOperationResult = function (operationResultId) {
                        ModalDialogsHandler.init();
                        ModalDialogsHandler._operationResultDlgs.show(operationResultId);
                    };
                    ModalDialogsHandler.showSubmitDelete = function (onSubmit) {
                        ModalDialogsHandler.init();
                        ModalDialogsHandler._submitDeleteDlg.show(onSubmit);
                    };
                    ModalDialogsHandler.init = function () {
                        if (ModalDialogsHandler._isInitialized) {
                            return;
                        }
                        ModalDialogsHandler._operationResultDlgs = new OperationResultModals();
                        ModalDialogsHandler._submitDeleteDlg = new SubmitDeleteModal();
                        // I am not sure this code does something helpful
                        //$(document).on('show.bs.modal', '.modal', ModalDialogsHandler.centerModal);
                        //$(window).on("resize", function () {
                        //    $('.modal:visible').each(ModalDialogsHandler.centerModal);
                        //});
                        ModalDialogsHandler._isInitialized = true;
                    };
                    ModalDialogsHandler.centerModal = function () {
                        $(this).css('display', 'block');
                        var $dialog = $(this).find(".modal-dialog");
                        var offset = ($(window).height() - $dialog.height()) / 2;
                        var bottomMargin = parseInt($dialog.css('marginBottom'), 10);
                        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
                        if (offset < bottomMargin) {
                            offset = bottomMargin;
                        }
                        $dialog.css("margin-top", offset);
                    };
                    ModalDialogsHandler._isInitialized = false;
                    return ModalDialogsHandler;
                })();
                views.ModalDialogsHandler = ModalDialogsHandler;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 10/3/2015.
 */
/// <reference path="./../BaseWidget.ts" />
/// <reference path="../../utils/TraceConsole.ts" />
/// <reference path="../../model/CookbookDTO.ts" />
/// <reference path="../../utils/Grid.ts"/>
/// <reference path="../../utils/Helpers.ts" />
/// <reference path="./../ModalDialog.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('EditRecipeWidget');
                var utils = alasch.cookbook.ui.utils;
                var model = alasch.cookbook.ui.model;
                var http = alasch.cookbook.ui.http;
                var idSelector = utils.Helpers.idSelector;
                var classSelector = utils.Helpers.classSelector;
                var ADD_EDIT_SECTION_ID = 'add-edit-recipe-section-id';
                var ADD_RECIPE_SUBTITLE_CLASS = 'create-operation-js';
                var EDIT_RECIPE_SUBTITLE_CLASS = 'update-operation-js';
                var RECIPE_FORM_ID = 'recipe-form-id';
                var RECIPE_CUISINE_INPUT_ID = 'recipe-cuisine-input-id';
                var RECIPE_NAME_INPUT_ID = 'recipe-name-input-id';
                var RECIPE_INGREDS_INPUT_ID = 'recipe-ingreds-input-id';
                var RECIPE_METHOD_INPUT_ID = 'recipe-method-input-id';
                var INGRED_ROW_TEMPLATE_CLASS = 'input-ingred-row-template';
                var BTN_SAVE_RECIPE_ID = 'btn-save-recipe-id';
                var BTN_CLEAR_RECIPE_ID = 'btn-clear-recipe-id';
                var BTN_ADD_INGRED_ROWS_ID = 'btn-add-ingred-rows-id';
                /**
                 * Encapsulates all ingred. table stuff
                 */
                var IngredTableHandler = (function () {
                    function IngredTableHandler() {
                        this._ingredTable = $(idSelector(RECIPE_INGREDS_INPUT_ID));
                        this._ingredTableBody = this._ingredTable.children('tbody');
                        this._ingredRowsGrid = new utils.Grid(classSelector(INGRED_ROW_TEMPLATE_CLASS), this._ingredTable);
                    }
                    IngredTableHandler.prototype.createEmptyRows = function (rowsNumber) {
                        // add 10 empty rows
                        for (var i = 0; i < rowsNumber; i++) {
                            this._ingredRowsGrid.addCell(null, this.bindIngredRow.bind(this));
                        }
                    };
                    IngredTableHandler.prototype.createRowsChunk = function () {
                        this.createEmptyRows(3);
                    };
                    IngredTableHandler.prototype.bindIngredients = function (recipe) {
                        var ingredients = recipe.ingredients;
                        if (ingredients && ingredients.length > 0) {
                            for (var i = 0; i < ingredients.length; i++) {
                                this._ingredRowsGrid.addCell(ingredients[i], this.bindIngredRow.bind(this));
                            }
                        }
                    };
                    IngredTableHandler.prototype.bindIngredRow = function (tr, ingredient) {
                        tr.removeClass(INGRED_ROW_TEMPLATE_CLASS);
                        if (ingredient) {
                            tr.find('[name="ingredient"]').val(ingredient);
                        }
                    };
                    IngredTableHandler.prototype.readIngredientsInput = function (recipe) {
                        recipe.ingredients = [];
                        var readIngredientRow = function (index, trElement) {
                            var tr = $(trElement);
                            var ingredient;
                            ingredient = tr.find('[name="ingredient"]').val();
                            if (ingredient !== '') {
                                recipe.ingredients.push(ingredient);
                            }
                        };
                        //jQuery.each(this._ingredTableBody.find('tr'), readIngredientRow.bind(this));
                        this._ingredTableBody.find('tr').each(readIngredientRow.bind(this));
                    };
                    IngredTableHandler.prototype.clearTable = function () {
                        this._ingredTableBody.empty();
                        this._ingredRowsGrid.clear();
                    };
                    return IngredTableHandler;
                })();
                var EditRecipeWidget = (function (_super) {
                    __extends(EditRecipeWidget, _super);
                    function EditRecipeWidget(appEventListener, cbkServiceProxy) {
                        _super.call(this, utils.Helpers.idSelector(RECIPE_FORM_ID), appEventListener, cbkServiceProxy);
                        this._section = $(idSelector(ADD_EDIT_SECTION_ID));
                        this._addRecipeSubtitle = $(classSelector(ADD_RECIPE_SUBTITLE_CLASS));
                        this._editRecipeSubtitle = $(classSelector(EDIT_RECIPE_SUBTITLE_CLASS));
                        this._recipeForm = $(idSelector(RECIPE_FORM_ID));
                        this._recipeNameInput = $(idSelector(RECIPE_NAME_INPUT_ID));
                        this._recipeCuisineInput = $(idSelector(RECIPE_CUISINE_INPUT_ID));
                        this._recipeMethodInput = $(idSelector(RECIPE_METHOD_INPUT_ID));
                        this._saveBtn = $(idSelector(BTN_SAVE_RECIPE_ID));
                        this._clearBtn = $(idSelector(BTN_CLEAR_RECIPE_ID));
                        this._addIngredRowsBtn = $(idSelector(BTN_ADD_INGRED_ROWS_ID));
                        this._emptyNameError = this._recipeNameInput.siblings('.help-block');
                        this._ingredTableHandler = new IngredTableHandler();
                        EditRecipeWidget.singleton = this;
                    }
                    EditRecipeWidget.editRecipe = function (recipe) {
                        EditRecipeWidget.singleton.showRecipe(recipe);
                    };
                    EditRecipeWidget.setCookbookId = function (cookbookId) {
                        EditRecipeWidget.singleton._cookbookId = cookbookId;
                    };
                    EditRecipeWidget.prototype.init = function () {
                        this._saveBtn.click(this.onClickSaveButton.bind(this));
                        this._clearBtn.click(this.onClickClearButton.bind(this));
                        this._addIngredRowsBtn.click(this._ingredTableHandler.createRowsChunk.bind(this._ingredTableHandler));
                        this._ingredTableHandler.createEmptyRows(10);
                        this._recipe = new model.RecipeDTO();
                        this._editRecipeSubtitle.hide();
                        this._addRecipeSubtitle.hide();
                    };
                    EditRecipeWidget.prototype.showRecipe = function (recipe) {
                        this._recipe = recipe;
                        this.clearData(false);
                        this.bindEditRecipeData();
                        this._section.focus();
                    };
                    EditRecipeWidget.prototype.clear = function () {
                        this.clearData(true);
                    };
                    EditRecipeWidget.prototype.onClickClearButton = function () {
                        if (!this._recipe) {
                            this.clearData(true);
                        }
                        else {
                            this.clearData(false);
                            this.bindEditRecipeData();
                        }
                    };
                    EditRecipeWidget.prototype.onClickSaveButton = function () {
                        var recipe;
                        if (this._recipe) {
                            recipe = this._recipe;
                        }
                        else {
                            recipe = new model.RecipeDTO();
                        }
                        recipe.name = this._recipeNameInput.val();
                        recipe.cuisine = this._recipeCuisineInput.val();
                        recipe.method = this._recipeMethodInput.val();
                        this._ingredTableHandler.readIngredientsInput(recipe);
                        if (this.isValidInput(recipe)) {
                            // check here, if recipe has an id - for edit
                            if (!recipe.id || recipe.id === "") {
                                this._cbkServiceProxy.addRecipe(this._cookbookId, recipe, this.onSaveSuccess.bind(this), this.onSaveError.bind(this));
                            }
                            else {
                                this._cbkServiceProxy.updateRecipe(this._cookbookId, recipe, this.onSaveSuccess.bind(this), this.onSaveError.bind(this));
                            }
                        }
                    };
                    EditRecipeWidget.prototype.isValidInput = function (recipe) {
                        var errorElementClass = 'has-error';
                        if (recipe.name.length == 0) {
                            logger.error("Invalid recipe data: name is empty");
                            this._recipeNameInput.parent('.form-group').addClass(errorElementClass);
                            this._emptyNameError.show();
                            return false;
                        }
                        else {
                            this._recipeNameInput.parent('.form-group').removeClass(errorElementClass);
                            this._emptyNameError.hide();
                        }
                        return true;
                    };
                    EditRecipeWidget.prototype.onSaveSuccess = function () {
                        logger.debug('notify listener on success');
                        var operationResultId;
                        var appEvent;
                        if (this._recipe) {
                            operationResultId = views.OperationResultId.updateOk;
                            appEvent = "updateSuccess";
                        }
                        else {
                            operationResultId = views.OperationResultId.createOk;
                            appEvent = "createSuccess";
                        }
                        views.ModalDialogsHandler.showOperationResult(operationResultId);
                        this._appEventListener.notify(appEvent);
                        this.clearData(true);
                    };
                    EditRecipeWidget.prototype.onSaveError = function (errCode) {
                        var operationResultId;
                        if (this._recipe) {
                            operationResultId = views.OperationResultId.updateFailed;
                        }
                        else {
                            operationResultId = views.OperationResultId.createFailed;
                        }
                        views.ModalDialogsHandler.showOperationResult(operationResultId);
                    };
                    EditRecipeWidget.prototype.clearData = function (noRecipe) {
                        logger.debug("Entred clearData noRecipe=" + noRecipe);
                        this._ingredTableHandler.clearTable();
                        this._recipeNameInput.val('');
                        this._recipeNameInput.parent('.form-group').removeClass('has-error');
                        this._recipeMethodInput.val('');
                        this._recipeCuisineInput.val('');
                        this._emptyNameError.hide();
                        if (noRecipe) {
                            delete this._recipe;
                            // 10 row are created by default
                            this._ingredTableHandler.createEmptyRows(10);
                            this._editRecipeSubtitle.text();
                            this._editRecipeSubtitle.hide();
                            this._addRecipeSubtitle.show();
                        }
                    };
                    EditRecipeWidget.prototype.bindEditRecipeData = function () {
                        this._recipeNameInput.val(this._recipe.name);
                        this._recipeCuisineInput.val(this._recipe.cuisine);
                        this._recipeMethodInput.val(this._recipe.method);
                        this._ingredTableHandler.bindIngredients(this._recipe);
                        this._addRecipeSubtitle.hide();
                        this._editRecipeSubtitle.text(this._recipe.name);
                        this._editRecipeSubtitle.show();
                    };
                    return EditRecipeWidget;
                })(views.BaseWidget);
                views.EditRecipeWidget = EditRecipeWidget;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 10/31/2015.
 */
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook_1) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var cookbook;
                (function (cookbook) {
                    var content;
                    (function (content) {
                        var Selectors = (function () {
                            function Selectors() {
                            }
                            Selectors.CUISINE_JS_SELECTOR = '.cuisine-js';
                            Selectors.CUISINE_NAME_JS_SELECTOR = '.cuisine-name-js';
                            Selectors.CUISINE_DATA_PROPERTY = 'cuisine_data';
                            Selectors.RECIPE_ROW_SELECTOR = '.recipe-row-js';
                            Selectors.RECIPE_REF_JS_SELECTOR = '.recipe-ref-js';
                            Selectors.RECIPE_DATA_PROPERTY = 'recipe_data';
                            return Selectors;
                        })();
                        content.Selectors = Selectors;
                    })(content = cookbook.content || (cookbook.content = {}));
                })(cookbook = views.cookbook || (views.cookbook = {}));
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook_1.ui || (cookbook_1.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 10/31/2015.
 */
/// <reference path="../../../utils/TraceConsole.ts" />
/// <reference path="./Selectors.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook_2) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var cookbook;
                (function (cookbook) {
                    var content;
                    (function (content) {
                        var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Helpers');
                        var model = alasch.cookbook.ui.model;
                        /**
                         * Encapsulates hover handling over an cuisine content.
                         * Handles 2 different cases: hover on a cuisine name and hover on a recipe name
                         * Each cuisine and recipe may have a sibling toggable element.
                         * When the handler wakes up upon a mouse move over the element :
                         * onMouseEnter - decorates an element text with underline and shows the sibling element
                         * onMouseLeave - removes the decoration and hides the sibling element
                         */
                        var ElementsHoverHandler = (function () {
                            function ElementsHoverHandler() {
                            }
                            ElementsHoverHandler.onMouseEnterCuisine = function () {
                                var selectedElement = $(this);
                                ElementsHoverHandler.toggleDecoration(selectedElement, true);
                                ElementsHoverHandler.getCuisineToggable(selectedElement).show();
                            };
                            ElementsHoverHandler.onMouseLeaveCuisine = function () {
                                var selectedElement = $(this);
                                ElementsHoverHandler.toggleDecoration(selectedElement, false);
                                ElementsHoverHandler.getCuisineToggable(selectedElement).hide();
                            };
                            ElementsHoverHandler.onMouseEnterRecipe = function () {
                                var selectedElement = $(this);
                                ElementsHoverHandler.toggleDecoration(selectedElement, true);
                                ElementsHoverHandler.getRecipeToggable(selectedElement).show();
                            };
                            ElementsHoverHandler.onMouseLeaveRecipe = function () {
                                var selectedElement = $(this);
                                ElementsHoverHandler.toggleDecoration(selectedElement, false);
                                ElementsHoverHandler.getRecipeToggable(selectedElement).hide();
                            };
                            ElementsHoverHandler.getCuisineToggable = function (selectedElement) {
                                return selectedElement.find(ElementsHoverHandler.CUISINE_TOGGABLE);
                            };
                            ElementsHoverHandler.getRecipeToggable = function (selectedElement) {
                                return selectedElement.find(ElementsHoverHandler.RECIPE_TOGGABLE);
                            };
                            ElementsHoverHandler.toggleDecoration = function (selectedElement, setUnderline) {
                                if (setUnderline) {
                                    selectedElement.css('text-decoration', 'underline');
                                }
                                else {
                                    selectedElement.css('text-decoration', '');
                                }
                            };
                            ElementsHoverHandler.CUISINE_TOGGABLE = '.cuisine-hover-toggle-js';
                            ElementsHoverHandler.RECIPE_TOGGABLE = '.recipe-hover-toggle-js';
                            return ElementsHoverHandler;
                        })();
                        content.ElementsHoverHandler = ElementsHoverHandler;
                        /**
                         * Encapsulates cuisine/recipe operations, which are triggered by click events.
                         * Recipe operations: view/edit/delete
                         * Cuisine operation: delete
                         * Delegates execution to relevant Widget
                         */
                        var ElementsClickHandler = (function () {
                            function ElementsClickHandler() {
                            }
                            ElementsClickHandler.onRecipeClick = function (eventObject) {
                                var recipe = ElementsClickHandler.extractRecipeData($(eventObject.target));
                                if (recipe) {
                                    views.ViewRecipeWidget.viewRecipe(recipe);
                                }
                                else {
                                    logger.warning("No event object was received on click content table!!");
                                }
                            };
                            ElementsClickHandler.onClickRecipeEditBtn = function (eventObject) {
                                var recipeRef = ElementsClickHandler.findRecipeRef($(eventObject.target));
                                var recipe = ElementsClickHandler.extractRecipeData(recipeRef);
                                if (recipe) {
                                    views.EditRecipeWidget.editRecipe(recipe);
                                }
                            };
                            ElementsClickHandler.onClickRecipeDeleteBtn = function (eventObject) {
                                var invokeDelete = function (eventObject) {
                                    logger.debug("Delete recipes was invoked");
                                    var recipeRef = ElementsClickHandler.findRecipeRef($(eventObject.target));
                                    var recipe = ElementsClickHandler.extractRecipeData(recipeRef);
                                    if (recipe) {
                                        ElementsClickHandler._contentWidget.deleteRecipe.bind(ElementsClickHandler._contentWidget)(recipe);
                                    }
                                };
                                views.ModalDialogsHandler.showSubmitDelete(new views.SubmitHandler(invokeDelete, eventObject));
                            };
                            ElementsClickHandler.findRecipeRef = function (clickedElement) {
                                return clickedElement.parents(content.Selectors.RECIPE_ROW_SELECTOR).find(content.Selectors.RECIPE_REF_JS_SELECTOR);
                            };
                            ElementsClickHandler.extractRecipeData = function (jqElement) {
                                if (jqElement) {
                                    var data = jqElement.prop(content.Selectors.RECIPE_DATA_PROPERTY);
                                    if (data) {
                                        return data;
                                    }
                                }
                                logger.warning("Recipe data should be bound to recipe-row, but was not found!!");
                                return null;
                            };
                            ElementsClickHandler.onClickCuisineDeleteBtn = function (eventObject) {
                                var invokeDelete = function (eventObject) {
                                    logger.debug("Delete cuisine was invoked");
                                    var cuisineRef = ElementsClickHandler.findCuisineRef($(eventObject.target));
                                    var cuisineId = ElementsClickHandler.extractCuisineId(cuisineRef);
                                    if (cuisineId !== "") {
                                        ElementsClickHandler._contentWidget.deleteCuisine.bind(ElementsClickHandler._contentWidget)(cuisineId);
                                    }
                                };
                                views.ModalDialogsHandler.showSubmitDelete(new views.SubmitHandler(invokeDelete, eventObject));
                            };
                            ElementsClickHandler.findCuisineRef = function (clickedElement) {
                                return clickedElement.parents(content.Selectors.CUISINE_JS_SELECTOR).find(content.Selectors.CUISINE_NAME_JS_SELECTOR);
                            };
                            ElementsClickHandler.extractCuisineId = function (jqElement) {
                                if (jqElement) {
                                    var cuisineId = jqElement.prop(content.Selectors.CUISINE_DATA_PROPERTY);
                                    if (cuisineId) {
                                        return cuisineId;
                                    }
                                }
                                logger.warning("Cuisine id should be bound to cuisine name, but was not found!!");
                                return "";
                            };
                            return ElementsClickHandler;
                        })();
                        content.ElementsClickHandler = ElementsClickHandler;
                    })(content = cookbook.content || (cookbook.content = {}));
                })(cookbook = views.cookbook || (views.cookbook = {}));
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook_2.ui || (cookbook_2.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/23/2015.
 */
/// <reference path="../../BaseWidget.ts" />
/// <reference path="../../../utils/TraceConsole.ts" />
/// <reference path="../../../model/CookbookDTO.ts" />
/// <reference path="../../../utils/Grid.ts"/>
/// <reference path="../ViewRecipeWidget.ts" />
/// <reference path="../../cookbook/EditRecipeWidget.ts" />
/// <reference path="../../ModalDialog.ts" />
/// <reference path="./ElementsHandlers.ts" />
/// <reference path="./Selectors.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook_3) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var cookbook;
                (function (cookbook_4) {
                    var content;
                    (function (content) {
                        var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ContentWidget');
                        var utils = alasch.cookbook.ui.utils;
                        var model = alasch.cookbook.ui.model;
                        var http = alasch.cookbook.ui.http;
                        var CUISINE_LIST_SELECTOR = '#cuisines-datalist';
                        var DATALIST_OPTION_SELECTOR = '<option></option>';
                        var CONTENT_TABLE_SELECTOR = '#content-table';
                        var CUISINE_TEMPLATE_CLASS = 'cuisine-template';
                        var RECIPE_CONTAINER_SELECTOR = '.recipes-tab-js';
                        var RECIPE_TEMPLATE_SELECTOR = '.recipe-row-template';
                        var EDIT_RECIPE_BTN_SELECTOR = '.edit-recipe-btn-js';
                        var DELETE_RECIPE_BTN_SELECTOR = '.delete-recipe-btn-js';
                        var DELETE_CUISINE_BTN_SELECTOR = '.delete-cuisine-btn-js';
                        var CuisineGrid = (function (_super) {
                            __extends(CuisineGrid, _super);
                            function CuisineGrid(name, container) {
                                _super.call(this, RECIPE_TEMPLATE_SELECTOR, container);
                                this._name = name;
                            }
                            return CuisineGrid;
                        })(alasch.cookbook.ui.utils.Grid);
                        var ContentWidget = (function (_super) {
                            __extends(ContentWidget, _super);
                            function ContentWidget(cbkServiceProxy) {
                                _super.call(this, CONTENT_TABLE_SELECTOR, null, cbkServiceProxy);
                                ContentWidget.singleton = this;
                                this._cookbookId = "";
                                this._cuisinesList = $(CUISINE_LIST_SELECTOR);
                                this._contentTable = $(CONTENT_TABLE_SELECTOR);
                                this._cuisinesListGrid = new alasch.cookbook.ui.utils.Grid(DATALIST_OPTION_SELECTOR, this._cuisinesList);
                                this._contentGrid = new utils.Grid(utils.Helpers.classSelector(CUISINE_TEMPLATE_CLASS), this._contentTable);
                                this._cuisineContentGrids = new Array();
                                content.ElementsClickHandler._contentWidget = this;
                                this._element.on('click', content.Selectors.RECIPE_REF_JS_SELECTOR, content.ElementsClickHandler.onRecipeClick);
                                this._element.on('mouseenter', content.Selectors.RECIPE_ROW_SELECTOR, content.ElementsHoverHandler.onMouseEnterRecipe);
                                this._element.on('mouseleave', content.Selectors.RECIPE_ROW_SELECTOR, content.ElementsHoverHandler.onMouseLeaveRecipe);
                                this._element.on('click', EDIT_RECIPE_BTN_SELECTOR, content.ElementsClickHandler.onClickRecipeEditBtn);
                                this._element.on('click', DELETE_RECIPE_BTN_SELECTOR, content.ElementsClickHandler.onClickRecipeDeleteBtn);
                                this._element.on('mouseenter', content.Selectors.CUISINE_JS_SELECTOR, content.ElementsHoverHandler.onMouseEnterCuisine);
                                this._element.on('mouseleave', content.Selectors.CUISINE_JS_SELECTOR, content.ElementsHoverHandler.onMouseLeaveCuisine);
                                this._element.on('click', DELETE_CUISINE_BTN_SELECTOR, content.ElementsClickHandler.onClickCuisineDeleteBtn);
                            }
                            ContentWidget.prototype.setCookbookId = function (cookbookId) {
                                this._cookbookId = cookbookId;
                            };
                            ContentWidget.readCookbook = function (cookbook) {
                                ContentWidget.singleton.setCookbookId(cookbook.id);
                                ContentWidget.singleton.readContent();
                            };
                            ContentWidget.getCookbookId = function () {
                                return ContentWidget.singleton._cookbookId;
                            };
                            ContentWidget.prototype.readContent = function () {
                                // bring data for templates init
                                if (this._cookbookId != "") {
                                    logger.info("Reading content...");
                                    this._cbkServiceProxy.getCookbookContent(this._cookbookId, this.onReadContentSuccess.bind(this), this.onReadContentError.bind(this));
                                }
                            };
                            /**
                             * Handles application events, fires in the other widgets
                             * @param appEventTag
                             */
                            ContentWidget.prototype.onAppEvent = function (appEventTag) {
                                switch (appEventTag) {
                                    case 'updateSuccess':
                                    case 'createSuccess':
                                        this.readContent();
                                }
                            };
                            ContentWidget.prototype.onReadContentSuccess = function (contentData) {
                                logger.info("Recieved content:" + JSON.stringify(contentData));
                                this.clearContent();
                                this.initCuisineList(contentData);
                                this.initContent(contentData);
                                views.EditRecipeWidget.setCookbookId(this._cookbookId);
                            };
                            ContentWidget.prototype.onReadContentError = function (errorCode) {
                                logger.error("Error on get content:" + errorCode);
                            };
                            ContentWidget.prototype.deleteRecipe = function (recipe) {
                                this._cbkServiceProxy.deleteRecipe(this._cookbookId, recipe.id, this.onDeleteSuccess.bind(this), this.onDeleteError.bind(this));
                            };
                            ContentWidget.prototype.deleteCuisine = function (cuisineId) {
                                this._cbkServiceProxy.deleteCuisine(this._cookbookId, cuisineId, this.onDeleteSuccess.bind(this), this.onDeleteError.bind(this));
                            };
                            ContentWidget.prototype.clearContent = function () {
                                this._contentTable.empty();
                                this._contentGrid.clear();
                                this._cuisineContentGrids = [];
                            };
                            ContentWidget.prototype.initCuisineList = function (contentData) {
                                var appendOption = function (optionElement, data) {
                                    optionElement.attr("value", data.name);
                                };
                                this._cuisinesList.empty();
                                contentData.forEach(function (element, index, array) {
                                    this._cuisinesListGrid.addCell(element, appendOption);
                                }.bind(this));
                            };
                            ContentWidget.prototype.initContent = function (contentData) {
                                contentData.forEach(function (element, index, array) {
                                    var cuisineElement = this._contentGrid.addCell(element, this.appendCuisineContent.bind(this));
                                    this.appendRecipes(cuisineElement, element);
                                    //logger.debug("Created cuisine content for" + element.name);
                                }.bind(this));
                            };
                            ContentWidget.prototype.appendCuisineContent = function (cuisineElement, data) {
                                cuisineElement.removeClass(CUISINE_TEMPLATE_CLASS);
                                var cuisineRef = cuisineElement.find(content.Selectors.CUISINE_NAME_JS_SELECTOR);
                                var deleteBtn = cuisineElement.find(DELETE_CUISINE_BTN_SELECTOR);
                                cuisineRef.text(data.name);
                                cuisineRef.attr('id', data.id);
                                cuisineRef.get(0)[content.Selectors.CUISINE_DATA_PROPERTY] = data.id;
                                if (data.recipes.length > 0) {
                                    // No delete for cuisine with recipes
                                    deleteBtn.remove();
                                }
                                else {
                                    deleteBtn.attr('id', 'delete-cuisine-btn-' + data.id);
                                }
                            };
                            ContentWidget.prototype.appendRecipes = function (cuisineElement, data) {
                                // Create cuisine content with recipes
                                var recipesTableElement = cuisineElement.find(RECIPE_CONTAINER_SELECTOR);
                                var cuisineGrid = new CuisineGrid(data.name, recipesTableElement);
                                //logger.debug("Recipes size 2 append:" + data.recipes.length);
                                if (data.recipes.length > 0) {
                                    data.recipes.forEach(function (recipe, index, array) {
                                        cuisineGrid.addCell(recipe, this.appendRecipe.bind(this));
                                    }.bind(this));
                                }
                                else {
                                    // show empty list entry
                                    cuisineGrid.addCell(null, this.appendRecipe.bind(this));
                                }
                                this._cuisineContentGrids.push(cuisineGrid);
                            };
                            ContentWidget.prototype.appendRecipe = function (recipeListElement, data) {
                                var recipeRef = recipeListElement.find(content.Selectors.RECIPE_REF_JS_SELECTOR); //'.recipe-ref-js');
                                var editBtn = recipeListElement.find(EDIT_RECIPE_BTN_SELECTOR);
                                var deleteBtn = recipeListElement.find(DELETE_RECIPE_BTN_SELECTOR);
                                if (data) {
                                    recipeRef.removeAttr("data-l10n-id");
                                    recipeRef.text(data.name);
                                    recipeRef.attr('id', '' + data.id);
                                    recipeRef.get(0)[content.Selectors.RECIPE_DATA_PROPERTY] = data;
                                    editBtn.attr('id', 'edit-recipe-btn-' + data.id);
                                    deleteBtn.attr('id', 'delete-recipe-btn-' + data.id);
                                }
                                else {
                                    recipeRef.removeData("");
                                    recipeRef.replaceWith(recipeRef.text());
                                    recipeListElement.find("span").remove();
                                    editBtn.remove();
                                    deleteBtn.remove();
                                }
                                recipeListElement.removeClass("recipe-row-template");
                            };
                            ContentWidget.prototype.onDeleteSuccess = function () {
                                views.ModalDialogsHandler.showOperationResult(views.OperationResultId.deleteOk);
                                // Refresh content
                                this.readContent();
                            };
                            ContentWidget.prototype.onDeleteError = function (errCode) {
                                views.ModalDialogsHandler.showOperationResult(views.OperationResultId.deleteFailed);
                            };
                            return ContentWidget;
                        })(views.BaseWidget);
                        content.ContentWidget = ContentWidget;
                        ;
                    })(content = cookbook_4.content || (cookbook_4.content = {}));
                })(cookbook = views.cookbook || (views.cookbook = {}));
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook_3.ui || (cookbook_3.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 11/7/2015.
 */
/// <reference path="./BaseWidget.ts" />
/// <reference path="cookbook/content/ContentWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts" />
/// <reference path="../utils/Helpers.ts" />
/// <reference path="../definitions/bootstrap.d.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook_5) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ViewRecipeWidget');
                var utils = alasch.cookbook.ui.utils;
                var model = alasch.cookbook.ui.model;
                var http = alasch.cookbook.ui.http;
                var content = alasch.cookbook.ui.views.cookbook.content;
                var COOKBOOKS_TEMPLATE_CLASS = 'cookbook-template';
                var COOKBOOKS_CONTAINER_SELECTOR = '#cookbooks-container';
                var COOKBOOK_REF_SELECTOR = '.cookbook-js';
                var COOKBOOK_DATA_PROPERTY = 'cookbook-data';
                var COOKBOOK_VIEW_SELECTOR = '.cookbook-view';
                var CookbookElementClickHandler = (function () {
                    function CookbookElementClickHandler() {
                    }
                    CookbookElementClickHandler.onClickButton = function (eventObject) {
                        var cookbookRef = CookbookElementClickHandler.findCookbookRef($(eventObject.target));
                        var cookbook = CookbookElementClickHandler.extractCookbookData(cookbookRef);
                        if (cookbook) {
                            content.ContentWidget.readCookbook(cookbook);
                        }
                        else {
                            logger.warning("No event object was received on click cookbook name!!");
                        }
                    };
                    CookbookElementClickHandler.findCookbookRef = function (clickedElement) {
                        return $(clickedElement).parents(COOKBOOK_REF_SELECTOR);
                    };
                    CookbookElementClickHandler.extractCookbookData = function (jqElement) {
                        if (jqElement) {
                            var data = jqElement.prop(COOKBOOK_DATA_PROPERTY);
                            if (data) {
                                return data;
                            }
                        }
                        logger.warning("Cookbook data should be bound to cookbook display, but was not found!!");
                        return null;
                    };
                    return CookbookElementClickHandler;
                })();
                var CookbooksWidget = (function (_super) {
                    __extends(CookbooksWidget, _super);
                    function CookbooksWidget(cbkServiceProxy) {
                        _super.call(this, COOKBOOKS_CONTAINER_SELECTOR, null, cbkServiceProxy);
                        this._cookbooksContainer = $(COOKBOOKS_CONTAINER_SELECTOR);
                        this._cookbooksGrid = new utils.Grid(utils.Helpers.classSelector(COOKBOOKS_TEMPLATE_CLASS), this._cookbooksContainer);
                        this._element.on('click', '.cookbook-btn-js', CookbookElementClickHandler.onClickButton);
                    }
                    CookbooksWidget.prototype.readCookbooks = function () {
                        // bring data for templates init
                        logger.info("Reading cookbooks metadata...");
                        this._cbkServiceProxy.getCookbooks(this.onReadCookbooksSuccess.bind(this), this.onReadCookbooksError.bind(this));
                    };
                    CookbooksWidget.prototype.onReadCookbooksSuccess = function (cookbooks) {
                        logger.info("Received cookbooks:" + JSON.stringify(cookbooks));
                        this.clearCookbooksContainer();
                        this.initCookbooksList(cookbooks);
                    };
                    CookbooksWidget.prototype.onReadCookbooksError = function (errorCode) {
                        logger.error("Error on get cookbooks list:" + errorCode);
                    };
                    CookbooksWidget.prototype.clearCookbooksContainer = function () {
                        this._cookbooksContainer.empty();
                    };
                    CookbooksWidget.prototype.initCookbooksList = function (cookbooks) {
                        cookbooks.forEach(function (cookbookDto, index, array) {
                            var cookbookElement = this._cookbooksGrid.addCell(cookbookDto, this.appendCookbook.bind(this));
                        }.bind(this));
                    };
                    CookbooksWidget.prototype.appendCookbook = function (cookbookElement, data) {
                        cookbookElement.removeClass(COOKBOOKS_TEMPLATE_CLASS);
                        var cookbookRef = cookbookElement.find(COOKBOOK_REF_SELECTOR);
                        //var hrefElement: JQuery = cookbookElement.find('a');
                        //hrefElement.attr('href','/cookbook/'+ data.id);
                        var cookbookNameBtn = cookbookElement.find('button');
                        var cookbookImage = cookbookElement.find('img');
                        cookbookRef.attr('id', data.id);
                        cookbookRef.get(0)[COOKBOOK_DATA_PROPERTY] = data;
                        cookbookNameBtn.text(data.name);
                        cookbookImage.attr('alt', data.name);
                    };
                    return CookbooksWidget;
                })(views.BaseWidget);
                views.CookbooksWidget = CookbooksWidget;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook_5.ui || (cookbook_5.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 11/14/2015.
 */
/// <reference path="../BaseWidget.ts" />
/// <reference path="content/ContentWidget.ts" />
/// <reference path="./ViewRecipeWidget.ts" />
/// <reference path="./EditRecipeWidget.ts" />
/// <reference path="../../utils/TraceConsole.ts" />
/// <reference path="../../model/CookbookDTO.ts" />
/// <reference path="../../utils/Helpers.ts" />
/// <reference path="../../definitions/bootstrap.d.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook_6) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var cookbook;
                (function (cookbook) {
                    var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('TheCookbookWidget');
                    var utils = alasch.cookbook.ui.utils;
                    var model = alasch.cookbook.ui.model;
                    var COOKBOOK_VIEW_CLASS = 'cookbook-view';
                    var CookbookMain = (function () {
                        function CookbookMain() {
                            this._cbkServiceProxy = new ui.http.CookbookServiceProxy();
                            this._contentWidget = new cookbook.content.ContentWidget(this._cbkServiceProxy);
                            this._traceConsole = new utils.TraceConsole();
                            this._viewRecipesWidget = views.ViewRecipeWidget.getInstance();
                            this.createEditRecipeWidget();
                            this._initialized = false;
                        }
                        CookbookMain.prototype.init = function () {
                            //this._contentWidget.setCookbookId(cookbookId);
                            if (!this._initialized) {
                                this._cbkServiceProxy.init();
                                this.initJQueryElements();
                                this._initialized = true;
                                logger.info("Initialized OK");
                            }
                        };
                        CookbookMain.prototype.initJQueryElements = function () {
                            this._contentWidget.readContent();
                            this._editRecipeWidget.init();
                            this._traceConsole.hide();
                            this._navBar = $(utils.Helpers.idSelector('li-add-recipe-id'));
                            this._navBar.on('click', this.onClick.bind(this));
                        };
                        CookbookMain.prototype.createEditRecipeWidget = function () {
                            var appEventListener = new views.AppEventListener();
                            appEventListener.notify = this._contentWidget.onAppEvent.bind(this._contentWidget);
                            this._editRecipeWidget = new views.EditRecipeWidget(appEventListener, this._cbkServiceProxy);
                        };
                        CookbookMain.prototype.onClick = function () {
                            this._editRecipeWidget.clear();
                        };
                        return CookbookMain;
                    })();
                    cookbook.CookbookMain = CookbookMain;
                })(cookbook = views.cookbook || (views.cookbook = {}));
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook_6.ui || (cookbook_6.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/24/2015.
 */
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./views/BaseWidget.ts" />
/// <reference path="./views/CookbooksWidget.ts" />
/// <reference path="./views/cookbook/CookbookMain.ts" />
/// <reference path="./utils/TraceConsole.ts" />
///<reference path="./http/CookbookRequestResponse.ts"/>
///<reference path="./http/CookbookServiceProxy.ts"/>
/// <reference path="./model/CookbookDTO.ts" />
/// <reference path="./utils/Helpers.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('CookbookMain');
            var AppClientMain = (function () {
                function AppClientMain() {
                    this._cbkServiceProxy = new ui.http.CookbookServiceProxy();
                    this._cookbooksWidget = new ui.views.CookbooksWidget(this._cbkServiceProxy);
                    this._traceConsole = new ui.utils.TraceConsole();
                    this.createCookbooksWidget();
                }
                AppClientMain.prototype.init = function () {
                    this._cbkServiceProxy.init();
                    this.initJQueryElements();
                    logger.info("Initialized OK");
                };
                AppClientMain.prototype.initJQueryElements = function () {
                    this._cookbooksWidget.readCookbooks();
                    //this._contentWidget.readContent();
                    this._traceConsole.hide();
                };
                AppClientMain.prototype.createCookbooksWidget = function () {
                    var appEventListener = new ui.views.AppEventListener();
                };
                return AppClientMain;
            })();
            ui.AppClientMain = AppClientMain;
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
function getCookbookId() {
    var url = document.location.href;
    var cookbookId = "";
    var components = url.split("/");
    if (components.length == 5 && components[3] === 'cookbook') {
        cookbookId = components[4];
    }
    return cookbookId;
}
$(document).ready(function () {
    var appMain = new alasch.cookbook.ui.AppClientMain();
    appMain.init();
    console.log('AppClientMain document is ready !!');
    var cookbookMain = new alasch.cookbook.ui.views.cookbook.CookbookMain();
    cookbookMain.init();
    console.log('CookbookMain document is ready !!');
    //var coookbookId = getCookbookId();
    //if (coookbookId !== "") {
    //    var cookbookMain = new alasch.cookbook.ui.CookbookMain();
    //    cookbookMain.init(coookbookId);
    //    console.log('CookbookMain document is ready !!');
    //}
});
