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