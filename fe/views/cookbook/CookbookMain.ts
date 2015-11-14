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

module alasch.cookbook.ui.views.cookbook {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('TheCookbookWidget');
    var utils = alasch.cookbook.ui.utils;
    var model = alasch.cookbook.ui.model;
    var COOKBOOK_VIEW_CLASS = 'cookbook-view';

    export class CookbookMain {
        _contentWidget: content.ContentWidget;
        _viewRecipesWidget: ViewRecipeWidget;
        _editRecipeWidget: EditRecipeWidget;
        _traceConsole: utils.TraceConsole;
        _cbkServiceProxy: http.CookbookServiceProxy;
        _navBar: JQuery;
        _initialized: boolean;

        constructor() {
            this._cbkServiceProxy = new http.CookbookServiceProxy();
            this._contentWidget = new content.ContentWidget(this._cbkServiceProxy);
            this._traceConsole = new utils.TraceConsole();
            this._viewRecipesWidget = views.ViewRecipeWidget.getInstance();
            this.createEditRecipeWidget();
            this._initialized = false;
        }

        init() {
            //this._contentWidget.setCookbookId(cookbookId);
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
