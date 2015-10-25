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

module alasch.cookbook.ui {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('AppClientMain');

    export class AppClientMain {
        _contentWidget: views.ContentWidget;
        _viewRecipesWidget: views.ViewRecipeWidget;
        _editRecipeWidget: views.EditRecipeWidget;
        _traceConsole: utils.TraceConsole;
        _cbkServiceProxy: http.CookbookServiceProxy;
        _navBar: JQuery;

        constructor() {
            this._cbkServiceProxy = new http.CookbookServiceProxy();
            this._contentWidget = new views.ContentWidget(this._cbkServiceProxy);
            this._traceConsole = new utils.TraceConsole();
            this._viewRecipesWidget = views.ViewRecipeWidget.getInstance();
            this.createEditRecipeWidget();
        }

        init() {
            this._cbkServiceProxy.init();
            this.initJQueryElements();
            logger.info("Initialized OK");
        }

        private initJQueryElements() {
            this._contentWidget.readContent();
            this._editRecipeWidget.init();
            this._traceConsole.hide();
            this._navBar = $(utils.Helpers.idSelector('li-add-recipe-id'));
            this._navBar.on('click', this.onClick.bind(this));
        }

        private createEditRecipeWidget() {
            var appEventListener: views.AppEventListener = new views.AppEventListener();
            appEventListener.notify = this._contentWidget.onAppEvent.bind(this._contentWidget);
            this._editRecipeWidget = new views.EditRecipeWidget(appEventListener, this._cbkServiceProxy);
        }

        private onClick() {
            this._editRecipeWidget.clear();
        }
    }
}

$(document).ready(function() {
    var appMain = new alasch.cookbook.ui.AppClientMain();
    appMain.init();
    console.log('document is ready !!');
});