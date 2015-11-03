/**
 * Created by aschneider on 9/23/2015.
 */

/// <reference path="./../BaseWidget.ts" />
/// <reference path="../../utils/TraceConsole.ts" />
/// <reference path="../../model/CookbookDTO.ts" />
/// <reference path="../../utils/Grid.ts"/>
/// <reference path="../ViewRecipeWidget.ts" />
/// <reference path="../EditRecipeWidget.ts" />
/// <reference path="../ModalDialog.ts" />
/// <reference path="./Helpers.ts" />
/// <reference path="./Selectors.ts" />

module alasch.cookbook.ui.views.content {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ContentWidget');
    var utils = alasch.cookbook.ui.utils;
    var model = alasch.cookbook.ui.model;
    var http = alasch.cookbook.ui.http;

    var CUISINE_LIST_SELECTOR: string = '#cuisines-datalist';
    var DATALIST_OPTION_SELECTOR: string ='<option></option>';
    var CONTENT_TABLE_SELECTOR: string = '#content-table';
    var CUISINE_TEMPLATE_CLASS: string = 'cuisine-template';
    var RECIPE_CONTAINER_SELECTOR = '.recipes-tab-js';
    var RECIPE_TEMPLATE_SELECTOR = '.recipe-row-template';
    var EDIT_RECIPE_BTN_SELECTOR = '.edit-recipe-btn-js';
    var DELETE_RECIPE_BTN_SELECTOR = '.delete-recipe-btn-js';
    var DELETE_CUISINE_BTN_SELECTOR = '.delete-cuisine-btn-js';

    class CuisineGrid extends alasch.cookbook.ui.utils.Grid<model.RecipeDTO>{
        _name ; string;

        constructor(name: string, container: JQuery) {
            super(RECIPE_TEMPLATE_SELECTOR, container);
            this._name = name;
        }
    }

    export class ContentWidget extends BaseWidget {

        _cuisinesList: JQuery;
        _contentTable: JQuery;
        _cuisinesListGrid: alasch.cookbook.ui.utils.Grid<model.CuisineDTO>;
        _contentGrid: alasch.cookbook.ui.utils.Grid<model.CuisineDTO>;
        _cuisineContentGrids: Array<CuisineGrid>;

        constructor(cbkServiceProxy: alasch.cookbook.ui.http.CookbookServiceProxy) {
            super(CONTENT_TABLE_SELECTOR, null, cbkServiceProxy);
            this._cuisinesList = $(CUISINE_LIST_SELECTOR);
            this._contentTable = $(CONTENT_TABLE_SELECTOR);
            this._cuisinesListGrid =  new alasch.cookbook.ui.utils.Grid<model.CuisineDTO>(DATALIST_OPTION_SELECTOR, this._cuisinesList);
            this._contentGrid = new utils.Grid<model.CuisineDTO>(
                utils.Helpers.classSelector(CUISINE_TEMPLATE_CLASS), this._contentTable);
            this._cuisineContentGrids = new Array<CuisineGrid>();
            ElementsClickHandler._contentWidget = this;
            this._element.on('click',Selectors.RECIPE_REF_JS_SELECTOR, ElementsClickHandler.onRecipeClick);
            this._element.on('mouseenter',Selectors.RECIPE_ROW_SELECTOR, ElementsHoverHandler.onMouseEnterRecipe);
            this._element.on('mouseleave',Selectors.RECIPE_ROW_SELECTOR, ElementsHoverHandler.onMouseLeaveRecipe);
            this._element.on('click', EDIT_RECIPE_BTN_SELECTOR, ElementsClickHandler.onClickRecipeEditBtn);
            this._element.on('click', DELETE_RECIPE_BTN_SELECTOR, ElementsClickHandler.onClickRecipeDeleteBtn);
            this._element.on('mouseenter', Selectors.CUISINE_JS_SELECTOR, ElementsHoverHandler.onMouseEnterCuisine);
            this._element.on('mouseleave', Selectors.CUISINE_JS_SELECTOR, ElementsHoverHandler.onMouseLeaveCuisine);
            this._element.on('click', DELETE_CUISINE_BTN_SELECTOR, ElementsClickHandler.onClickCuisineDeleteBtn);
        }

        /**
         * Handles application events, fires in the other widgets
         * @param appEventTag
         */
        onAppEvent(appEventTag: string) {
            switch(appEventTag) {
                case 'updateSuccess':
                case 'createSuccess':
                    this.readContent();
            }
        }

        readContent():void {
            // bring data for templates init
            logger.info("Reading content...");
            this._cbkServiceProxy.getCookbookContent(this.onReadContentSuccess.bind(this), this.onReadContentError.bind(this));
        }

        onReadContentSuccess(contentData: alasch.cookbook.ui.model.CuisineDTO[]) {
            logger.info("Recieved content:" + JSON.stringify(contentData));
            this.clearContent();
            this.initCuisineList(contentData);
            this.initContent(contentData);
        }

        onReadContentError(errorCode: number) {
            logger.error("Error on get content:" + errorCode);
        }

        deleteRecipe(recipe: model.RecipeDTO) {
            this._cbkServiceProxy.deleteRecipe(
                recipe.id,
                this.onDeleteSuccess.bind(this),
                this.onDeleteError.bind(this));
        }

        deleteCuisine(cuisineId: string) {
            this._cbkServiceProxy.deleteCuisine(
                cuisineId,
                this.onDeleteSuccess.bind(this),
                this.onDeleteError.bind(this));
        }

        private clearContent() {
            this._contentTable.empty();
            this._contentGrid.clear();
            this._cuisineContentGrids = [];
        }

        private initCuisineList(contentData: model.CuisineDTO[]): void {
            var appendOption = function(optionElement: JQuery, data:model.CuisineDTO) {
                optionElement.attr("value", data.name);
            };

            this._cuisinesList.empty();
            contentData.forEach(function(element, index, array) {
                this._cuisinesListGrid.addCell(element, appendOption);
            }.bind(this));
        }

        private initContent(contentData: model.CuisineDTO[]): void {
            contentData.forEach(function(element, index, array) {
                var cuisineElement: JQuery = this._contentGrid.addCell(element, this.appendCuisineContent.bind(this));
                this.appendRecipes(cuisineElement, element);
                //logger.debug("Created cuisine content for" + element.name);
            }.bind(this));
        }

        private appendCuisineContent(cuisineElement:JQuery, data:model.CuisineDTO) : void {
            cuisineElement.removeClass(CUISINE_TEMPLATE_CLASS);
            var cuisineRef = cuisineElement.find(Selectors.CUISINE_NAME_JS_SELECTOR);
            var deleteBtn = cuisineElement.find(DELETE_CUISINE_BTN_SELECTOR);
            cuisineRef.text(data.name);
            cuisineRef.attr('id', '' + data.id);
            cuisineRef.get(0)[Selectors.CUISINE_DATA_PROPERTY] = data.id;
            if (data.recipes.length > 0) {
                // No delete for cuisine with recipes
                deleteBtn.remove();
            }
            else {
                 deleteBtn.attr('id', 'delete-cuisine-btn-' + data.id);
            }
        }

        private appendRecipes(cuisineElement: JQuery, data: model.CuisineDTO) {
            // Create cuisine content with recipes
            var recipesTableElement = cuisineElement.find(RECIPE_CONTAINER_SELECTOR);
            var cuisineGrid = new CuisineGrid(data.name, recipesTableElement);
            //logger.debug("Recipes size 2 append:" + data.recipes.length);
            if (data.recipes.length > 0) {
                data.recipes.forEach(function(recipe, index, array) {
                    cuisineGrid.addCell(recipe, this.appendRecipe.bind(this));
                }.bind(this));
            }
            else {
                // show empty list entry
                cuisineGrid.addCell(null, this.appendRecipe.bind(this));
            }

            this._cuisineContentGrids.push(cuisineGrid);
        }

        private appendRecipe (recipeListElement: JQuery, data?: alasch.cookbook.ui.model.RecipeDTO): void {
            var recipeRef = recipeListElement.find(Selectors.RECIPE_REF_JS_SELECTOR);//'.recipe-ref-js');
            var editBtn = recipeListElement.find(EDIT_RECIPE_BTN_SELECTOR);
            var deleteBtn = recipeListElement.find(DELETE_RECIPE_BTN_SELECTOR);

            if (data) {
                recipeRef.removeAttr("data-l10n-id");
                recipeRef.text(data.name);
                recipeRef.attr('id', '' + data.id);
                recipeRef.get(0)[Selectors.RECIPE_DATA_PROPERTY] = data;
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
        }

        private onDeleteSuccess(): void {
            ModalDialogsHandler.showOperationResult(OperationResultId.deleteOk);
            // Refresh content
            this.readContent();
        }

        private onDeleteError(errCode?: any) : void {
            ModalDialogsHandler.showOperationResult(OperationResultId.deleteFailed);
        }

    };
}