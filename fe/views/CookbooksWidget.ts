/**
 * Created by aschneider on 11/7/2015.
 */
/// <reference path="./BaseWidget.ts" />
/// <reference path="./content/ContentWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts" />
/// <reference path="../utils/Helpers.ts" />
/// <reference path="../definitions/bootstrap.d.ts" />

module alasch.cookbook.ui.views {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ViewRecipeWidget');
    var utils = alasch.cookbook.ui.utils;
    var model = alasch.cookbook.ui.model;
    var http = alasch.cookbook.ui.http;

    var COOKBOOKS_TEMPLATE_CLASS = 'cookbook-template';
    var COOKBOOKS_CONTAINER_SELECTOR = '#cookbooks-container';
    var COOKBOOK_REF_SELECTOR = '.cookbook-js';
    var COOKBOOK_DATA_PROPERTY = 'cookbook-data';

    class CookbookElementClickHandler {

        static onClickButton(eventObject: Event) : void {
            var cookbookRef = CookbookElementClickHandler.findCookbookRef($(eventObject.target));
            var cookbook: model.CookbookDTO = CookbookElementClickHandler.extractCookbookData(cookbookRef);
            if (cookbook) {
                // build url
                //var cookbookUrl = "/cookbook/" + cookbook.id
                //content.ContentWidget.setCookbook(cookbook);
            }
            else {
                logger.warning("No event object was received on click cookbook name!!");
            }
        }

        private static findCookbookRef(clickedElement: JQuery): JQuery {
            return $(clickedElement).parents(COOKBOOK_REF_SELECTOR);
        }

        private static extractCookbookData(jqElement: JQuery) : model.CookbookDTO {
            if (jqElement) {
                var data:any = jqElement.prop(COOKBOOK_DATA_PROPERTY);
                if (data) {
                    return <model.CookbookDTO>data;
                }
            }
            logger.warning("Cookbook data should be bound to cookbook display, but was not found!!");
            return null;
        }
    }

    export class CookbooksWidget extends BaseWidget {
        _cookbooksContainer: JQuery;
        _cookbooksGrid: utils.Grid<model.CookbookDTO>;

        constructor(cbkServiceProxy: alasch.cookbook.ui.http.CookbookServiceProxy) {
            super(COOKBOOKS_CONTAINER_SELECTOR, null, cbkServiceProxy);
            this._cookbooksContainer = $(COOKBOOKS_CONTAINER_SELECTOR);
            this._cookbooksGrid = new utils.Grid<model.CookbookDTO>(
                utils.Helpers.classSelector(COOKBOOKS_TEMPLATE_CLASS), this._cookbooksContainer
            );
            this._element.on('click', '.cookbook-btn-js', CookbookElementClickHandler.onClickButton);
        }

        readCookbooks(): void {
            // bring data for templates init
            logger.info("Reading cookbooks metadata...");
            this._cbkServiceProxy.getCookbooks(this.onReadCookbooksSuccess.bind(this), this.onReadCookbooksError.bind(this));
        }

        onReadCookbooksSuccess(cookbooks: model.CookbookDTO[]) {
            logger.info("Received cookbooks:" + JSON.stringify(cookbooks));
            this.clearCookbooksContainer();
            this.initCookbooksList(cookbooks);
        }

        onReadCookbooksError(errorCode:number) {
            logger.error("Error on get cookbooks list:" + errorCode);
        }

        private clearCookbooksContainer() {
            this._cookbooksContainer.empty();
        }

        private initCookbooksList(cookbooks: model.CookbookDTO[]) {
            cookbooks.forEach(function(cookbookDto, index, array) {
                var cookbookElement: JQuery = this._cookbooksGrid.addCell(cookbookDto, this.appendCookbook.bind(this));
            }.bind(this));
        }

        private appendCookbook(cookbookElement: JQuery, data: model.CookbookDTO) : void {
            cookbookElement.removeClass(COOKBOOKS_TEMPLATE_CLASS);
            var cookbookRef: JQuery = cookbookElement.find(COOKBOOK_REF_SELECTOR);
            var hrefElement: JQuery = cookbookElement.find('a');
            hrefElement.attr('href','/cookbook/'+ data.id);
            var cookbookNameBtn: JQuery = cookbookElement.find('button');
            var cookbookImage: JQuery = cookbookElement.find('img');
            cookbookRef.attr('id', data.id);
            cookbookRef.get(0)[COOKBOOK_DATA_PROPERTY] = data;
            cookbookNameBtn.text(data.name);
            cookbookImage.attr('alt', data.name);
        }

    }
}
