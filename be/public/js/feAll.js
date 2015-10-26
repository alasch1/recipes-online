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
                            if (request.httpMethod == 0 /* GET */) {
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
                        if (request.httpMethod != 0 /* GET */) {
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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
                        this._httpMethod = typeof (httpMethod) === "undefined" ? 1 /* POST */ : httpMethod;
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
                        if (this._httpMethod == 0 /* GET */ && this.getRoute() == "") {
                            throw new Error("Invalid request. " + "When invoking a service request with the 'Http GET' method, the deriving class must implement the getRoute() method.");
                        }
                    };
                    CookbookRequest.prototype.toString = function () {
                        return ('[' + this._httpMethod + ', path:' + this.getRoute() + ', data:' + JSON.stringify(this._data) + ']');
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
                            case 0 /* INFO */:
                                cssClass += "logLevelInfo";
                                break;
                            case 1 /* DEBUG */:
                                cssClass += "logLevelDebug";
                                break;
                            case 2 /* WARNING */:
                                cssClass += "logLevelWarning";
                                break;
                            case 3 /* ERROR */:
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
                        this.log(0 /* INFO */, msg);
                    };
                    Logger.prototype.debug = function (msg) {
                        this.log(1 /* DEBUG */, msg);
                    };
                    Logger.prototype.warning = function (msg) {
                        this.log(2 /* WARNING */, msg);
                    };
                    Logger.prototype.error = function (msg) {
                        this.log(3 /* ERROR */, msg);
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
                    CookbookServiceProxy.prototype.getCookbookContent = function (successCallback, errorCallback) {
                        var route = CookbookServiceProxy._contentPath;
                        var request = new http.CookbookRequest(null, 0 /* GET */, route);
                        this.invokeRequest(request, successCallback, errorCallback);
                    };
                    CookbookServiceProxy.prototype.addRecipe = function (input, successCallback, errorCallback) {
                        var route = CookbookServiceProxy._recipePath;
                        var request = new http.CookbookRequest(input, 1 /* POST */, route);
                        this.invokeRequest(request, successCallback, errorCallback);
                    };
                    CookbookServiceProxy.prototype.updateRecipe = function (input, successCallback, errorCallback) {
                        var route = CookbookServiceProxy._recipePath + "/" + input.id;
                        var request = new http.CookbookRequest(input, 2 /* PUT */, route);
                        this.invokeRequest(request, successCallback, errorCallback);
                    };
                    CookbookServiceProxy.prototype.getRecipe = function (recipeId, successCallback, errorCallback) {
                        var route = CookbookServiceProxy._recipePath + "/" + recipeId;
                        var request = new http.CookbookRequest(null, 2 /* PUT */, route);
                        this.invokeRequest(request, successCallback, errorCallback);
                    };
                    CookbookServiceProxy.prototype.deleteRecipe = function (recipeId, successCallback, errorCallback) {
                        var route = CookbookServiceProxy._recipePath + "/" + recipeId;
                        var request = new http.CookbookRequest(null, 3 /* DELETE */, route);
                        this.invokeRequest(request, successCallback, errorCallback);
                    };
                    CookbookServiceProxy.prototype.invokeRequest = function (request, successCallback, errorCallback) {
                        try {
                            logger.info('Invoked request input:' + request.toString());
                            request.validate();
                            var wsRequest = new http.WebServiceRequest();
                            wsRequest.parameters = request.getData();
                            wsRequest.route = request.getRoute();
                            wsRequest.httpMethod = request.getHttpMethod();
                            logger.info("[TO CBK] - Sending request" + request.toString());
                            this._proxy.invokeAsync(wsRequest, function (result) {
                                CookbookServiceProxy.onSuccess(request, result, successCallback, errorCallback);
                            }, function (result) {
                                CookbookServiceProxy.onError(request, result, errorCallback);
                            });
                        }
                        catch (e) {
                            if (errorCallback != null)
                                errorCallback();
                        }
                    };
                    CookbookServiceProxy.onSuccess = function (request, result, successCallback, errorCallback) {
                        if (result.statusCode === 200 || result.statusCode === 201) {
                            logger.info("[FROM CBK] - Recieved OK result - " + CookbookServiceProxy.toStringResultBody(result));
                            if (successCallback != null) {
                                successCallback(result.returnValue);
                            }
                        }
                        else if (errorCallback != null) {
                            logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result));
                            errorCallback(result.statusCode);
                        }
                        else {
                            logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result) + "; no error callback is defined.");
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
                    CookbookServiceProxy.onError = function (request, result, errorCallback) {
                        logger.error("[FROM CBK] - Recieved failure result:" + CookbookServiceProxy.toStringResultBody(result));
                        //var rsvpResponse = <CookbookResponse<T>>JSON.parse(result.responseText);
                        if (errorCallback != null) {
                            errorCallback(result.statusCode);
                        }
                    };
                    // URLS
                    CookbookServiceProxy._rootPath = '';
                    CookbookServiceProxy._contentPath = 'content';
                    CookbookServiceProxy._recipePath = 'recipe';
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
                var IngredientDTO = (function () {
                    function IngredientDTO() {
                        this.name = "";
                        this.qty = 0;
                        this.units = "";
                    }
                    return IngredientDTO;
                })();
                model.IngredientDTO = IngredientDTO;
                ;
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
                    function CookbookDTO(id) {
                        this.id = id;
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
/// <reference path="./BaseWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts" />
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
                            var buf = "";
                            if (data.qty) {
                                buf += data.qty;
                                if (data.units) {
                                    buf += " " + data.units;
                                }
                            }
                            buf += " " + data.name + "";
                            dataElem.text(buf);
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
                        var pattern = '<span><button type="button" id="' + CloseButtonHelper.btnId(recipeId) + '" class="btn-submit btn-close-recipe-view-js">x</span></button></span>';
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
                        var recipeNavTab = $('<li id="recipe-nav-' + recipe.id + '"><a data-toggle="tab" href="#recipe-tab-' + recipe.id + '">' + CloseButtonHelper.templatePattern(recipe.id) + '&nbsp;' + recipe.name + '</a></li>');
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
                //var RESULT_MODAL_TEMPLATE_CLASS = 'result-modal-js';
                //var MODAL_BODY_CLASS = 'modal-body';
                //var OPERATION_RESULT_MODAL_ID = 'modal-result-id';
                //var SUCCESS_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-ok"></span>';
                //var FAILURE_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-remove"></span>';
                (function (OperationResultId) {
                    OperationResultId[OperationResultId["updateOk"] = 0] = "updateOk";
                    OperationResultId[OperationResultId["updateFailed"] = 1] = "updateFailed";
                    OperationResultId[OperationResultId["createOk"] = 2] = "createOk";
                    OperationResultId[OperationResultId["createFailed"] = 3] = "createFailed";
                    OperationResultId[OperationResultId["deleteOk"] = 4] = "deleteOk";
                    OperationResultId[OperationResultId["deleteFailed"] = 5] = "deleteFailed";
                })(views.OperationResultId || (views.OperationResultId = {}));
                var OperationResultId = views.OperationResultId;
                var dlgSelectors = {};
                var msgSelectors = {};
                (function initSelectors() {
                    // init dialogs ids
                    dlgSelectors[0 /* updateOk */] = 'update-ok-dlg';
                    dlgSelectors[1 /* updateFailed */] = 'update-err-dlg';
                    dlgSelectors[2 /* createOk */] = 'create-ok-dlg';
                    dlgSelectors[3 /* createFailed */] = 'create-err-dlg';
                    dlgSelectors[4 /* deleteOk */] = 'delete-ok-dlg';
                    dlgSelectors[5 /* deleteFailed */] = 'delete-err-dlg';
                    // init messages ids
                    msgSelectors[0 /* updateOk */] = 'modal-title-update-ok-js';
                    msgSelectors[1 /* updateFailed */] = 'modal-title-update-failed-js';
                    msgSelectors[2 /* createOk */] = 'modal-title-create-ok-js';
                    msgSelectors[3 /* createFailed */] = 'modal-title-create-failed-js';
                    msgSelectors[4 /* deleteOk */] = 'modal-title-delete-ok-js';
                    msgSelectors[5 /* deleteFailed */] = 'modal-title-delete-failed-js';
                })();
                var OperationResultModals = (function () {
                    function OperationResultModals() {
                        this._dialogs = {};
                    }
                    OperationResultModals.prototype.init = function () {
                        for (var opId in OperationResultId) {
                            var dlgId = dlgSelectors[opId];
                            var dlg = $(utils.Helpers.idSelector(dlgSelectors[opId])).clone();
                            var dlgTitle = $('.modal-title', dlg);
                            var dlgSpan = $('span', dlg).clone();
                            var titleMsg = $(utils.Helpers.classSelector(msgSelectors[opId])).text();
                            dlgTitle.text(titleMsg);
                            dlgTitle.append(dlgSpan);
                            this._dialogs[opId] = dlg;
                        }
                    };
                    OperationResultModals.prototype.show = function (operationResultId) {
                        var dlg = this._dialogs[operationResultId];
                        dlg.modal('show');
                    };
                    return OperationResultModals;
                })();
                //class OperationResultModal {
                //    _dialog: JQuery;
                //    _successIconSpan:JQuery;
                //    _failureIconSpan: JQuery;
                //
                //    constructor() {
                //    }
                //
                //    init() {
                //        this._dialog = $(utils.Helpers.classSelector(RESULT_MODAL_TEMPLATE_CLASS)).clone();
                //        this._dialog.removeClass(RESULT_MODAL_TEMPLATE_CLASS);
                //        this._dialog.attr('id', OPERATION_RESULT_MODAL_ID);
                //        this._successIconSpan = $(SUCCESS_ICON_SPAN_SELECTOR);
                //        this._failureIconSpan = $(FAILURE_ICON_SPAN_SELECTOR);
                //        this._dialog.on('hidden.bs.modal', this.cleanDialog.bind(this));
                //    }
                //
                //    show(operationResultId: OperationResultId) {
                //        switch (operationResultId) {
                //            case OperationResultId.updateOk:
                //            case OperationResultId.createOk:
                //            case OperationResultId.deleteOk:
                //                this.showSuccess(operationResultId);
                //                break;
                //            case OperationResultId.updateFailed:
                //            case OperationResultId.createFailed:
                //            case OperationResultId.deleteFailed:
                //                this.showFailure(operationResultId);
                //                break;
                //        }
                //    }
                //
                //    private showSuccess(operationResultId: OperationResultId) {
                //        this.modalDialog(operationResultId, this._successIconSpan);
                //    }
                //
                //    private showFailure(operationResultId: OperationResultId) {
                //        this.modalDialog(operationResultId, this._failureIconSpan);
                //    }
                //
                //    private modalDialog(operationResultId: OperationResultId, icon: JQuery) {
                //        var dlgMessageSelector:string = this.getMessageSelector(operationResultId);
                //        if (this._dialog) {
                //            var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
                //            var dialogContent:JQuery = $(utils.Helpers.classSelector(dlgMessageSelector)).clone();
                //            dialogContent.append(icon);
                //            dialogBody.append(dialogContent);
                //            this._dialog.modal('show');
                //        }
                //    }
                //
                //    private cleanDialog() {
                //        var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
                //        dialogBody.empty();
                //    }
                //
                //    private getMessageSelector(operationResultId: OperationResultId): string {
                //        switch (operationResultId) {
                //            case OperationResultId.updateOk: return 'modal-title-update-ok-js';
                //            case OperationResultId.updateFailed: return 'modal-title-update-failed-js';
                //            case OperationResultId.createOk: return 'modal-title-create-ok-js';
                //            case OperationResultId.createFailed: return 'modal-title-create-failed-js';
                //            case OperationResultId.deleteOk: return 'modal-title-delete-ok-js';
                //            case OperationResultId.deleteFailed: return 'modal-title-delete-failed-js';
                //        }
                //    }
                //
                //}
                var ModalDialogsHandler = (function () {
                    function ModalDialogsHandler() {
                    }
                    ModalDialogsHandler.showOperationResult = function (operationResultId) {
                        ModalDialogsHandler.init();
                        ModalDialogsHandler._operationResultDlgs.show(operationResultId);
                    };
                    ModalDialogsHandler.init = function () {
                        if (!ModalDialogsHandler._operationResultDlgs) {
                            ModalDialogsHandler._operationResultDlgs = new OperationResultModals();
                            ModalDialogsHandler._operationResultDlgs.init();
                        }
                    };
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
/// <reference path="./BaseWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts"/>
/// <reference path="../utils/Helpers.ts" />
/// <reference path="./ModalDialog.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('EditRecipeWidget');
                //var utils = alasch.cookbook.ui.utils;
                var idSelector = ui.utils.Helpers.idSelector;
                var classSelector = ui.utils.Helpers.classSelector;
                //var model = alasch.cookbook.ui.model;
                var http = alasch.cookbook.ui.http;
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
                        this._ingredRowsGrid = new ui.utils.Grid(classSelector(INGRED_ROW_TEMPLATE_CLASS), this._ingredTable);
                    }
                    IngredTableHandler.prototype.createEmptyRows = function (rowsNumber) {
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
                            tr.find('[name="ingred-name"]').val(ingredient.name);
                            tr.find('[name="ingred-qty"]').val('' + ingredient.qty);
                            tr.find('[name="ingred-units"]').val(ingredient.units);
                        }
                    };
                    IngredTableHandler.prototype.readIngredientsInput = function (recipe) {
                        recipe.ingredients = [];
                        var readIngredientRow = function (index, trElement) {
                            var tr = $(trElement);
                            var ingredient = new ui.model.IngredientDTO();
                            ingredient.name = tr.find('[name="ingred-name"]').val();
                            if (ingredient.name !== '') {
                                var qty = tr.find('[name="ingred-qty"]').val();
                                if (qty > 0) {
                                    ingredient.qty = qty;
                                    ingredient.units = tr.find('[name="ingred-units"]').val();
                                }
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
                        _super.call(this, ui.utils.Helpers.idSelector(RECIPE_FORM_ID), appEventListener, cbkServiceProxy);
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
                    EditRecipeWidget.prototype.init = function () {
                        this._saveBtn.click(this.onClickSaveButton.bind(this));
                        this._clearBtn.click(this.onClickClearButton.bind(this));
                        this._addIngredRowsBtn.click(this._ingredTableHandler.createRowsChunk.bind(this._ingredTableHandler));
                        this._ingredTableHandler.createEmptyRows(10);
                        this._recipe = new ui.model.RecipeDTO();
                        this._editRecipeSubtitle.hide();
                        this._addRecipeSubtitle.hide();
                        this._section.on('focus', this.onFocus.bind(this));
                    };
                    EditRecipeWidget.prototype.showRecipe = function (recipe) {
                        this._recipe = recipe;
                        //this.clearData(false);
                        //this.bindEditRecipeData();
                        this._section.focus();
                    };
                    EditRecipeWidget.prototype.clear = function () {
                        this.clearData(true);
                    };
                    EditRecipeWidget.prototype.onFocus = function (eventObject) {
                        if (this._recipe) {
                            this.clearData(false);
                            this.bindEditRecipeData();
                        }
                        else {
                            this.clearData(true);
                        }
                    };
                    EditRecipeWidget.prototype.onClickClearButton = function () {
                        this.clearData(true);
                    };
                    EditRecipeWidget.prototype.onClickSaveButton = function () {
                        var recipe;
                        if (this._recipe) {
                            recipe = this._recipe;
                        }
                        else {
                            recipe = new ui.model.RecipeDTO();
                        }
                        recipe.name = this._recipeNameInput.val();
                        recipe.cuisine = this._recipeCuisineInput.val();
                        recipe.method = this._recipeMethodInput.val();
                        this._ingredTableHandler.readIngredientsInput(recipe);
                        if (this.isValidInput(recipe)) {
                            // check here, if recipe has an id - for edit
                            if (!recipe.id || recipe.id === "") {
                                this._cbkServiceProxy.addRecipe(recipe, this.onSaveSuccess.bind(this), this.onSaveError.bind(this));
                            }
                            else {
                                this._cbkServiceProxy.updateRecipe(recipe, this.onSaveSuccess.bind(this), this.onSaveError.bind(this));
                            }
                        }
                    };
                    EditRecipeWidget.prototype.isValidInput = function (recipe) {
                        if (recipe.name.length == 0) {
                            logger.error("Invalid recipe data: name is empty");
                            this._recipeNameInput.parent('.form-group').addClass('has-error');
                            this._emptyNameError.show();
                            return false;
                        }
                        return true;
                    };
                    EditRecipeWidget.prototype.onSaveSuccess = function () {
                        logger.debug('notify listener on success');
                        var operationResultId;
                        var appEvent;
                        if (this._recipe) {
                            operationResultId = 0 /* updateOk */;
                            appEvent = "updateSuccess";
                        }
                        else {
                            operationResultId = 2 /* createOk */;
                            appEvent = "createSuccess";
                        }
                        views.ModalDialogsHandler.showOperationResult(operationResultId);
                        this._appEventListener.notify(appEvent);
                    };
                    EditRecipeWidget.prototype.onSaveError = function (errCode) {
                        var operationResultId;
                        if (this._recipe) {
                            operationResultId = 1 /* updateFailed */;
                        }
                        else {
                            operationResultId = 3 /* createFailed */;
                        }
                        views.ModalDialogsHandler.showOperationResult(operationResultId);
                    };
                    EditRecipeWidget.prototype.clearData = function (noRecipe) {
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
 * Created by aschneider on 9/23/2015.
 */
/// <reference path="./BaseWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts"/>
/// <reference path="./ViewRecipeWidget.ts" />
/// <reference path="./EditRecipeWidget.ts" />
var alasch;
(function (alasch) {
    var cookbook;
    (function (cookbook) {
        var ui;
        (function (ui) {
            var views;
            (function (views) {
                var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ContentWidget');
                var utils = alasch.cookbook.ui.utils;
                var model = alasch.cookbook.ui.model;
                var http = alasch.cookbook.ui.http;
                var CUISINE_LIST_SELECTOR = '#cuisines-datalist';
                var DATALIST_OPTION_SELECTOR = '<option></option>';
                var CONTENT_TABLE_SELECTOR = '#content-table';
                var CUISINE_CONTENT_TEMPLATE_SELECTOR = '.cuisine-template';
                var RECIPE_CONTAINER_SELECTOR = '.recipes-tab-js';
                var RECIPE_TEMPLATE_SELECTOR = '.recipe-row-template';
                var RECIPE_DATA_PROPERTY = 'recipe_data';
                var RECIPE_ROW_SELECTOR = '.recipe-row-js';
                var TOGGABLE_BTNS_SELECTOR = '.toggable-buttons-js';
                var RECIPE_ITEM_SELECTOR = '.recipe-ref-js';
                var EDIT_RECIPE_BTN_SELECTOR = '.edit-btn-js';
                var DELETE_RECIPE_BTN_SELECTOR = '.delete-btn-js';
                var CuisineGrid = (function (_super) {
                    __extends(CuisineGrid, _super);
                    function CuisineGrid(name, container) {
                        _super.call(this, RECIPE_TEMPLATE_SELECTOR, container);
                        this._name = name;
                    }
                    return CuisineGrid;
                })(alasch.cookbook.ui.utils.Grid);
                // Encapsulates all hover handling over recipes items in content table
                // Is waked-up upon mouse moved over recipe name
                var RecipeHoverHandler = (function () {
                    function RecipeHoverHandler() {
                    }
                    RecipeHoverHandler.onMouseEnter = function () {
                        var selectedElement = $(this);
                        selectedElement.css('text-decoration', 'underline');
                        RecipeHoverHandler.getToggableBtnsCell(selectedElement).show();
                    };
                    RecipeHoverHandler.onMouseLeave = function () {
                        var selectedElement = $(this);
                        selectedElement.css('text-decoration', '');
                        RecipeHoverHandler.getToggableBtnsCell(selectedElement).hide();
                    };
                    RecipeHoverHandler.getToggableBtnsCell = function (selectedElement) {
                        return selectedElement.find(TOGGABLE_BTNS_SELECTOR);
                    };
                    return RecipeHoverHandler;
                })();
                // Encapsulates selected recipe opertaitons: view/edit or delete
                // Delegates execution to relevant Widget
                var RecipeClickHandler = (function () {
                    function RecipeClickHandler() {
                    }
                    RecipeClickHandler.onRecipeClick = function (eventObject) {
                        var recipe = RecipeClickHandler.extractRecipeData($(eventObject.target));
                        if (recipe) {
                            views.ViewRecipeWidget.viewRecipe(recipe);
                        }
                        else {
                            logger.warning("No event object was received on click content table!!");
                        }
                    };
                    RecipeClickHandler.onClickEditBtn = function (eventObject) {
                        var recipeRef = RecipeClickHandler.findBtnGlyphRecipeRef($(eventObject.target));
                        var recipe = RecipeClickHandler.extractRecipeData(recipeRef);
                        if (recipe) {
                            views.EditRecipeWidget.editRecipe(recipe);
                        }
                    };
                    RecipeClickHandler.onClickDeleteBtn = function (eventObject) {
                        var recipeRef = RecipeClickHandler.findBtnGlyphRecipeRef($(eventObject.target));
                        var recipe = RecipeClickHandler.extractRecipeData(recipeRef);
                        if (recipe) {
                            RecipeClickHandler._contentWidget.deleteRecipe.bind(RecipeClickHandler._contentWidget)(recipe);
                        }
                    };
                    RecipeClickHandler.findBtnGlyphRecipeRef = function (clickedElement) {
                        return clickedElement.parents(RECIPE_ROW_SELECTOR).find(RECIPE_ITEM_SELECTOR);
                    };
                    RecipeClickHandler.extractRecipeData = function (jqElement) {
                        if (jqElement) {
                            var data = jqElement.prop(RECIPE_DATA_PROPERTY);
                            if (data) {
                                return data;
                            }
                        }
                        else
                            return null;
                    };
                    return RecipeClickHandler;
                })();
                var ContentWidget = (function (_super) {
                    __extends(ContentWidget, _super);
                    function ContentWidget(cbkServiceProxy) {
                        _super.call(this, CONTENT_TABLE_SELECTOR, null, cbkServiceProxy);
                        this._cuisinesList = $(CUISINE_LIST_SELECTOR);
                        this._contentTable = $(CONTENT_TABLE_SELECTOR);
                        this._cuisinesListGrid = new alasch.cookbook.ui.utils.Grid(DATALIST_OPTION_SELECTOR, this._cuisinesList);
                        this._contentGrid = new alasch.cookbook.ui.utils.Grid(CUISINE_CONTENT_TEMPLATE_SELECTOR, this._contentTable);
                        this._cuisineContentGrids = new Array();
                        RecipeClickHandler._contentWidget = this;
                        this._element.on('click', RECIPE_ITEM_SELECTOR, RecipeClickHandler.onRecipeClick);
                        this._element.on('mouseenter', RECIPE_ROW_SELECTOR, RecipeHoverHandler.onMouseEnter);
                        this._element.on('mouseleave', RECIPE_ROW_SELECTOR, RecipeHoverHandler.onMouseLeave);
                        this._element.on('click', EDIT_RECIPE_BTN_SELECTOR, RecipeClickHandler.onClickEditBtn);
                        this._element.on('click', DELETE_RECIPE_BTN_SELECTOR, RecipeClickHandler.onClickDeleteBtn);
                    }
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
                    ContentWidget.prototype.readContent = function () {
                        // bring data for templates init
                        logger.info("Reading content...");
                        this._cbkServiceProxy.getCookbookContent(this.onReadContentSuccess.bind(this), this.onReadContentError.bind(this));
                    };
                    ContentWidget.prototype.onReadContentSuccess = function (contentData) {
                        logger.info("Recieved content:" + JSON.stringify(contentData));
                        this.clearContent();
                        this.initCuisineList(contentData);
                        this.initContent(contentData);
                    };
                    ContentWidget.prototype.onReadContentError = function (errorCode) {
                        logger.error("Error on get content:" + errorCode);
                    };
                    ContentWidget.prototype.deleteRecipe = function (recipe) {
                        this._cbkServiceProxy.deleteRecipe(recipe.id, this.onDeleteSuccess.bind(this), this.onDeleteError.bind(this));
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
                            logger.debug("Created cuisine content for" + element.name);
                        }.bind(this));
                    };
                    ContentWidget.prototype.appendCuisineContent = function (cuisineElement, data) {
                        cuisineElement.removeClass("cuisine-template");
                        var header = cuisineElement.find(".cuisine-js");
                        header.text(data.name);
                    };
                    ContentWidget.prototype.appendRecipes = function (cuisineElement, data) {
                        // Create cuisine content with recipes
                        var recipesTableElement = cuisineElement.find(RECIPE_CONTAINER_SELECTOR);
                        var cuisineGrid = new CuisineGrid(data.name, recipesTableElement);
                        logger.debug("Recipes size 2 append:" + data.recipes.length);
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
                        var recipeRef = recipeListElement.find('.recipe-ref-js');
                        var editBtn = recipeListElement.find('.edit-btn-js');
                        var deleteBtn = recipeListElement.find('.delete-btn-js');
                        if (data) {
                            recipeRef.removeAttr("data-l10n-id");
                            recipeRef.text(data.name);
                            recipeRef.attr('id', '' + data.id);
                            recipeRef.get(0)[RECIPE_DATA_PROPERTY] = data;
                            editBtn.attr('id', 'edit-btn-' + data.id);
                            deleteBtn.attr('id', 'delete-btn-' + data.id);
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
                        views.ModalDialogsHandler.showOperationResult(4 /* deleteOk */);
                        // Refresh content
                        this.readContent();
                    };
                    ContentWidget.prototype.onDeleteError = function (errCode) {
                        views.ModalDialogsHandler.showOperationResult(5 /* deleteFailed */);
                    };
                    return ContentWidget;
                })(views.BaseWidget);
                views.ContentWidget = ContentWidget;
                ;
            })(views = ui.views || (ui.views = {}));
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
/**
 * Created by aschneider on 9/24/2015.
 */
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./views/BaseWidget.ts" />
/// <reference path="./views/ContentWidget.ts" />
/// <reference path="./views/ViewRecipeWidget.ts" />
/// <reference path="./views/EditRecipeWidget.ts" />
/// <reference path="./views/ModalDialog.ts" />
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
            var logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('AppClientMain');
            var AppClientMain = (function () {
                function AppClientMain() {
                    this._cbkServiceProxy = new ui.http.CookbookServiceProxy();
                    this._contentWidget = new ui.views.ContentWidget(this._cbkServiceProxy);
                    this._traceConsole = new ui.utils.TraceConsole();
                    this._viewRecipesWidget = ui.views.ViewRecipeWidget.getInstance();
                    this.createEditRecipeWidget();
                    this._navBar = $(ui.utils.Helpers.idSelector('li-add-recipe-id'));
                    this._navBar.on('click', this.onClick.bind(this));
                }
                AppClientMain.prototype.init = function () {
                    this._cbkServiceProxy.init();
                    this._contentWidget.readContent();
                    this._editRecipeWidget.init();
                    this._traceConsole.hide();
                    logger.info("Initialized OK");
                };
                AppClientMain.prototype.createEditRecipeWidget = function () {
                    var appEventListener = new ui.views.AppEventListener();
                    appEventListener.notify = this._contentWidget.onAppEvent.bind(this._contentWidget);
                    this._editRecipeWidget = new ui.views.EditRecipeWidget(appEventListener, this._cbkServiceProxy);
                };
                AppClientMain.prototype.onClick = function () {
                    this._editRecipeWidget.clear();
                };
                return AppClientMain;
            })();
            ui.AppClientMain = AppClientMain;
        })(ui = cookbook.ui || (cookbook.ui = {}));
    })(cookbook = alasch.cookbook || (alasch.cookbook = {}));
})(alasch || (alasch = {}));
$(document).ready(function () {
    var appMain = new alasch.cookbook.ui.AppClientMain();
    appMain.init();
    console.log('document is ready !!');
});
