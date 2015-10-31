/**
 * Created by aschneider on 10/3/2015.
 */
/// <reference path="./BaseWidget.ts" />
/// <reference path="../utils/TraceConsole.ts" />
/// <reference path="../model/CookbookDTO.ts" />
/// <reference path="../utils/Grid.ts"/>
/// <reference path="../utils/Helpers.ts" />
/// <reference path="./ModalDialog.ts" />

module alasch.cookbook.ui.views {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('EditRecipeWidget');
    var utils = alasch.cookbook.ui.utils;
    var model = alasch.cookbook.ui.model;
    var http = alasch.cookbook.ui.http;
    var idSelector = utils.Helpers.idSelector;
    var classSelector = utils.Helpers.classSelector;

    var ADD_EDIT_SECTION_ID = 'add-edit-recipe-section-id';
    var ADD_RECIPE_SUBTITLE_CLASS='create-operation-js';
    var EDIT_RECIPE_SUBTITLE_CLASS='update-operation-js';
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
    class IngredTableHandler {

        _ingredTable: JQuery;
        _ingredTableBody: JQuery;
        _ingredRowsGrid: utils.Grid<string>;

        constructor() {
            this._ingredTable = $(idSelector(RECIPE_INGREDS_INPUT_ID));
            this._ingredTableBody = this._ingredTable.children('tbody');
            this._ingredRowsGrid = new utils.Grid<string>(classSelector(INGRED_ROW_TEMPLATE_CLASS), this._ingredTable);
        }

        createEmptyRows(rowsNumber: number): void {
            // add 10 empty rows
            for (var i=0; i<rowsNumber; i++) {
                this._ingredRowsGrid.addCell(null, this.bindIngredRow.bind(this));
            }
        }

        createRowsChunk(): void {
            this.createEmptyRows(3);
        }

        bindIngredients(recipe: alasch.cookbook.ui.model.RecipeDTO) : void {
            var ingredients = recipe.ingredients;
            if (ingredients && ingredients.length > 0) {
                for (var i=0; i<ingredients.length; i++) {
                    this._ingredRowsGrid.addCell(ingredients[i], this.bindIngredRow.bind(this))
                }
            }
        }

        bindIngredRow(tr: JQuery, ingredient?: string): void {
            tr.removeClass(INGRED_ROW_TEMPLATE_CLASS);
            if (ingredient) {
                tr.find('[name="ingredient"]').val(ingredient);
                //tr.find('[name="ingred-name"]').val(ingredient.name);
                //tr.find('[name="ingred-qty"]').val('' + ingredient.qty);
                //tr.find('[name="ingred-units"]').val(ingredient.units);
            }
        }

        readIngredientsInput(recipe: alasch.cookbook.ui.model.RecipeDTO): void {
            recipe.ingredients=[];
            var readIngredientRow = function(index:number, trElement:HTMLElement) {
                var tr = $(trElement);
                var ingredient: string;
                ingredient = tr.find('[name="ingredient"]').val();
                if (ingredient !== '') {
                    recipe.ingredients.push(ingredient);
                }
            };
            //jQuery.each(this._ingredTableBody.find('tr'), readIngredientRow.bind(this));
            this._ingredTableBody.find('tr').each(readIngredientRow.bind(this));

        }

        clearTable() {
            this._ingredTableBody.empty();
            this._ingredRowsGrid.clear();
        }

    }

    export class EditRecipeWidget extends BaseWidget {

        private static singleton: EditRecipeWidget;

        private _section: JQuery;
        private _addRecipeSubtitle: JQuery;
        private _editRecipeSubtitle: JQuery;
        private _recipeForm: JQuery;
        private _recipeNameInput: JQuery;
        private _recipeCuisineInput: JQuery;
        private _recipeMethodInput: JQuery;
        private _saveBtn: JQuery;
        private _clearBtn: JQuery;
        private _addIngredRowsBtn: JQuery;
        private _recipe: alasch.cookbook.ui.model.RecipeDTO;
        private _ingredTableHandler: IngredTableHandler;
        private _emptyNameError: JQuery;// = $('#recipe-name-input-id').siblings('.help-block');

        static editRecipe(recipe: model.RecipeDTO): void {
            EditRecipeWidget.singleton.showRecipe(recipe);
        }

        constructor(appEventListener: AppEventListener, cbkServiceProxy: http.CookbookServiceProxy) {
            super(utils.Helpers.idSelector(RECIPE_FORM_ID), appEventListener,  cbkServiceProxy);
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

        init() {
            this._saveBtn.click(this.onClickSaveButton.bind(this));
            this._clearBtn.click(this.onClickClearButton.bind(this));
            this._addIngredRowsBtn.click(this._ingredTableHandler.createRowsChunk.bind(this._ingredTableHandler));
            this._ingredTableHandler.createEmptyRows(10);
            this._recipe = new model.RecipeDTO();
            this._editRecipeSubtitle.hide();
            this._addRecipeSubtitle.hide();
        }

        showRecipe(recipe: alasch.cookbook.ui.model.RecipeDTO) {
            this._recipe = recipe;
            this.clearData(false);
            this.bindEditRecipeData();
            this._section.focus();
        }

        clear() {
            this.clearData(true);
        }

        private onClickClearButton(): void {
            if (!this._recipe) {
                this.clearData(true);
            }
            else {
                this.clearData(false);
                this.bindEditRecipeData();
            }
        }

        private onClickSaveButton(): void {
            var recipe: alasch.cookbook.ui.model.RecipeDTO;
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
                if (!recipe.id || recipe.id==="") {
                    this._cbkServiceProxy.addRecipe(
                        recipe,
                        this.onSaveSuccess.bind(this),
                        this.onSaveError.bind(this));
                }
                else {
                    this._cbkServiceProxy.updateRecipe(
                        recipe,
                        this.onSaveSuccess.bind(this),
                        this.onSaveError.bind(this));
                }
            }
        }

        private isValidInput(recipe: alasch.cookbook.ui.model.RecipeDTO) : boolean {
            var errorElementClass: string = 'has-error';
            if (recipe.name.length==0) {
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
        }

        private onSaveSuccess(): void {
            logger.debug('notify listener on success');
            var operationResultId: OperationResultId;
            var appEvent: string;
            if (this._recipe) {
                operationResultId = OperationResultId.updateOk;
                appEvent="updateSuccess";
            }
            else {
                operationResultId = OperationResultId.createOk;
                appEvent="createSuccess";
            }
            ModalDialogsHandler.showOperationResult(operationResultId);
            this._appEventListener.notify(appEvent);
            this.clearData(true);
        }

        private onSaveError(errCode?: any) : void {
            var operationResultId: OperationResultId;
            if (this._recipe) {
                operationResultId = OperationResultId.updateFailed;
            }
            else {
                operationResultId = OperationResultId.createFailed;
            }
            ModalDialogsHandler.showOperationResult(operationResultId);
        }

        private clearData(noRecipe: boolean): void {
            logger.debug("Entred clearData noRecipe="+ noRecipe);
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
        }

        private bindEditRecipeData() {
            this._recipeNameInput.val(this._recipe.name);
            this._recipeCuisineInput.val(this._recipe.cuisine);
            this._recipeMethodInput.val(this._recipe.method);
            this._ingredTableHandler.bindIngredients(this._recipe);
            this._addRecipeSubtitle.hide();
            this._editRecipeSubtitle.text(this._recipe.name);
            this._editRecipeSubtitle.show();
        }
    }
}