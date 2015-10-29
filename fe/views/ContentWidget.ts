/**
 * Created by aschneider on 9/23/2015.
 */

/// <reference path="./BaseWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts"/>
/// <reference path="./ViewRecipeWidget.ts" />
/// <reference path="./EditRecipeWidget.ts" />
/// <reference path="./ModalDialog.ts" />

module alasch.cookbook.ui.views {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ContentWidget');
    var utils = alasch.cookbook.ui.utils;
    var model = alasch.cookbook.ui.model;
    var http = alasch.cookbook.ui.http;

    var CUISINE_LIST_SELECTOR: string = '#cuisines-datalist';
    var DATALIST_OPTION_SELECTOR: string ='<option></option>';
    var CONTENT_TABLE_SELECTOR: string = '#content-table';
    var CUISINE_CONTENT_TEMPLATE_SELECTOR: string = '.cuisine-template';
    var RECIPE_CONTAINER_SELECTOR = '.recipes-tab-js';
    var RECIPE_TEMPLATE_SELECTOR = '.recipe-row-template';
    var RECIPE_DATA_PROPERTY = 'recipe_data';
    var RECIPE_ROW_SELECTOR = '.recipe-row-js';
    var TOGGABLE_BTNS_SELECTOR = '.toggable-buttons-js';
    var RECIPE_ITEM_SELECTOR = '.recipe-ref-js';
    var EDIT_RECIPE_BTN_SELECTOR = '.edit-btn-js';
    var DELETE_RECIPE_BTN_SELECTOR = '.delete-btn-js';

    class CuisineGrid extends alasch.cookbook.ui.utils.Grid<model.RecipeDTO>{
        _name ; string;

        constructor(name: string, container: JQuery) {
            super(RECIPE_TEMPLATE_SELECTOR, container);
            this._name = name;
        }
    }

    // Encapsulates all hover handling over recipes items in content table
    // Is waked-up upon mouse moved over recipe name

    class RecipeHoverHandler {

        static onMouseEnter() : void {
            var selectedElement: JQuery = $(this);
            selectedElement.css('text-decoration', 'underline');
            RecipeHoverHandler.getToggableBtnsCell(selectedElement).show();
        }

        static onMouseLeave() : void {
            var selectedElement: JQuery = $(this);
            selectedElement.css('text-decoration', '');
            RecipeHoverHandler.getToggableBtnsCell(selectedElement).hide();
        }

        private static getToggableBtnsCell(selectedElement: JQuery): JQuery {
            return selectedElement.find(TOGGABLE_BTNS_SELECTOR);
        }
    }

    // Encapsulates selected recipe operations: view/edit or delete
    // Delegates execution to relevant Widget
    class RecipeClickHandler {

        static _contentWidget: ContentWidget;

        static onRecipeClick(eventObject: Event): void {
            var recipe = RecipeClickHandler.extractRecipeData($(eventObject.target));
            if (recipe) {
                ViewRecipeWidget.viewRecipe(recipe);
            }
            else {
                logger.warning("No event object was received on click content table!!");
            }
        }

        static onClickEditBtn(eventObject: Event) : void {
            var recipeRef = RecipeClickHandler.findBtnGlyphRecipeRef($(eventObject.target));
            var recipe = RecipeClickHandler.extractRecipeData(recipeRef);
            if (recipe) {
                EditRecipeWidget.editRecipe(recipe);
            }
        }

        static onClickDeleteBtn(eventObject: Event) : void {
            var invokeDelete = function(eventObject: Event) {
                logger.debug("Delete recipes was invoked");
                var recipeRef = RecipeClickHandler.findBtnGlyphRecipeRef($(eventObject.target));
                var recipe = RecipeClickHandler.extractRecipeData(recipeRef);
                if (recipe) {
                    RecipeClickHandler._contentWidget.deleteRecipe.bind(RecipeClickHandler._contentWidget)(recipe);
                }
            }

            ModalDialogsHandler.showSubmitDelete(new SubmitHandler(invokeDelete, eventObject));
        }

        private static findBtnGlyphRecipeRef(clickedElement: JQuery): JQuery {
            return clickedElement.parents(RECIPE_ROW_SELECTOR).find(RECIPE_ITEM_SELECTOR);
        }

        private static extractRecipeData(jqElement: JQuery) : alasch.cookbook.ui.model.RecipeDTO {
            if (jqElement) {
                var data:any = jqElement.prop(RECIPE_DATA_PROPERTY);
                if (data) {
                    return <alasch.cookbook.ui.model.RecipeDTO>data;
                }
            }
            else return null;
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
            this._contentGrid = new alasch.cookbook.ui.utils.Grid<model.CuisineDTO>(CUISINE_CONTENT_TEMPLATE_SELECTOR, this._contentTable);
            this._cuisineContentGrids = new Array<CuisineGrid>();
            RecipeClickHandler._contentWidget = this;
            this._element.on('click',RECIPE_ITEM_SELECTOR, RecipeClickHandler.onRecipeClick);
            this._element.on('mouseenter',RECIPE_ROW_SELECTOR, RecipeHoverHandler.onMouseEnter);
            this._element.on('mouseleave',RECIPE_ROW_SELECTOR, RecipeHoverHandler.onMouseLeave);
            this._element.on('click', EDIT_RECIPE_BTN_SELECTOR, RecipeClickHandler.onClickEditBtn);
            this._element.on('click', DELETE_RECIPE_BTN_SELECTOR, RecipeClickHandler.onClickDeleteBtn);
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

        deleteRecipe(recipe: alasch.cookbook.ui.model.RecipeDTO) {
            this._cbkServiceProxy.deleteRecipe(
                recipe.id,
                this.onDeleteSuccess.bind(this),
                this.onDeleteError.bind(this));
        }

        private clearContent() {
            this._contentTable.empty();
            this._contentGrid.clear();
            this._cuisineContentGrids = [];
        }

        private initCuisineList(contentData: alasch.cookbook.ui.model.CuisineDTO[]): void {
            var appendOption = function(optionElement: JQuery, data:alasch.cookbook.ui.model.CuisineDTO) {
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

        private appendCuisineContent(cuisineElement:JQuery, data:alasch.cookbook.ui.model.CuisineDTO) : void {
            cuisineElement.removeClass("cuisine-template");
            var header = cuisineElement.find(".cuisine-js");
            header.text(data.name);
        }

        private appendRecipes(cuisineElement: JQuery, data: alasch.cookbook.ui.model.CuisineDTO) {
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