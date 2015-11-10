/**
 * Created by aschneider on 9/24/2015.
 */

/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./views/BaseWidget.ts" />
/// <reference path="./views/CookbooksWidget.ts" />
/// <reference path="./utils/TraceConsole.ts" />
///<reference path="./http/CookbookRequestResponse.ts"/>
///<reference path="./http/CookbookServiceProxy.ts"/>
/// <reference path="./model/CookbookDTO.ts" />
/// <reference path="./utils/Helpers.ts" />

module alasch.cookbook.ui {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('CookbookMain');

    export class AppClientMain {
        _cookbooksWidget:views.CookbooksWidget;
        _traceConsole:utils.TraceConsole;
        _cbkServiceProxy:http.CookbookServiceProxy;
        _navBar:JQuery;

        constructor() {
            this._cbkServiceProxy = new http.CookbookServiceProxy();
            this._cookbooksWidget = new views.CookbooksWidget(this._cbkServiceProxy);
            this._traceConsole = new utils.TraceConsole();
            this.createCookbooksWidget();
        }

        init() {
            this._cbkServiceProxy.init();
            this.initJQueryElements();
            logger.info("Initialized OK");
        }

        private initJQueryElements() {
            this._cookbooksWidget.readCookbooks();
            //this._contentWidget.readContent();
            this._traceConsole.hide();
        }

        private createCookbooksWidget() {
            var appEventListener:views.AppEventListener = new views.AppEventListener();
        }
    }

    export class CookbookMain {
        _contentWidget:views.content.ContentWidget;
        _viewRecipesWidget:views.ViewRecipeWidget;
        _editRecipeWidget:views.EditRecipeWidget;
        _traceConsole:utils.TraceConsole;
        _cbkServiceProxy:http.CookbookServiceProxy;
        _navBar:JQuery;
        _initialized: boolean;

        constructor() {
            this._cbkServiceProxy = new http.CookbookServiceProxy();
            this._contentWidget = new views.content.ContentWidget(this._cbkServiceProxy);
            this._traceConsole = new utils.TraceConsole();
            this._viewRecipesWidget = views.ViewRecipeWidget.getInstance();
            this.createEditRecipeWidget();
            this._initialized = false;
        }

        init(cookbookId: string) {
            this._contentWidget.setCookbookId(cookbookId);
            if (!this._initialized) {
                this._cbkServiceProxy.init();
                this.initJQueryElements();
                this._initialized = true;
                logger.info("Initialized OK");
            }
        }

        private initJQueryElements() {
            this._contentWidget.readContent();
            this._editRecipeWidget.init();
            this._traceConsole.hide();
            this._navBar = $(utils.Helpers.idSelector('li-add-recipe-id'));
            this._navBar.on('click', this.onClick.bind(this));
        }

        private createEditRecipeWidget() {
            var appEventListener:views.AppEventListener = new views.AppEventListener();
            appEventListener.notify = this._contentWidget.onAppEvent.bind(this._contentWidget);
            this._editRecipeWidget = new views.EditRecipeWidget(appEventListener, this._cbkServiceProxy);
        }

        private onClick() {
            this._editRecipeWidget.clear();
        }
    }
}
function getCookbookId(): string {
    var url: string  = document.location.href;
    var cookbookId: string = "";
    var components: string[] = url.split("/");
    if (components.length == 5 && components[3] === 'cookbook') {
        cookbookId = components[4];
    }
    return cookbookId;
}

$(document).ready(function() {
    var appMain = new alasch.cookbook.ui.AppClientMain();
    appMain.init();
    console.log('AppClientMain document is ready !!');

    var coookbookId = getCookbookId();
    if (coookbookId !== "") {
        var cookbookMain = new alasch.cookbook.ui.CookbookMain();
        cookbookMain.init(coookbookId);
        console.log('CookbookMain document is ready !!');
    }
});