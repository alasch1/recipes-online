/**
 * Created by aschneider on 9/29/2015.
 */
/// <reference path="./BaseWidget.ts" />
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

    var RECIPE_TABS_CONTAINER_ID = 'recipe-views-container-id';
    var RECIPE_VIEW_NAV_BAR_ID = 'recipe-view-nav-id';
    var RECIPE_VIEW_TAB_CONTENT_CLASS = 'tab-content';//"#recipe-view-tabs-id";
    var NO_RECIPE_VIEW_TAB_ID = 'no-recipe-tab';
    var RECIPE_VIEW_TEMPLATE_CLASS = 'recipe-view-template';

    var INGRED_TABLE_LABEL_SELECTOR = '.recipe-ingreds-table-label-js';
    var INGRED_TABLE_SELECTOR = '.recipe-ingreds-table-js';
    var INGRED_ROW_TEMPLATE_SELECTOR = '.ingred-row-template';

    class RecipeDataBinder {

        constructor() {
        }

        run(recipeDataView:JQuery, recipe:model.RecipeDTO):void {
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
        }

        private appendIngredientsTable(ingredTable:JQuery, data:model.RecipeDTO):void {
            var ingredGrid:utils.Grid<string> = new utils.Grid<string>(INGRED_ROW_TEMPLATE_SELECTOR, ingredTable);
            if (data.ingredients.length > 0) {
                data.ingredients.forEach(function (ingredient, index, array) {
                    ingredGrid.addCell(ingredient, this.appendIngredient);
                }.bind(this));
            }
            else {
                // Add no-data row
                ingredGrid.addCell(null, this.appendIngredient);
            }
        }

        private appendIngredient(ingredTableRow:JQuery, data:string) {
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
        }

    };

    class CloseButtonHelper {
        static TAB_REMOVED_HANDLER="onTabRemoved";

        static btnId(recipeId: string) {
            var btnIdPrefix:string = 'btn-close-';
            return btnIdPrefix + recipeId;
        }

        static templatePattern(recipeId: string): string {
            //var pattern='<span><button type="button" id="btn-close-id-"' + recipe.id +
            //    'class="btn-submit"><span class="glyphicon glyphicon-remove"></span></button></span>';
            var pattern ='<span><button type="button" id="' + CloseButtonHelper.btnId(recipeId) +
                '" class="btn-submit btn-close-recipe-view-js">x</span></button></span>';
            return pattern;
        }

        static bindOnClick(recipeId:string, onTabRemoved:()=>void) {
            var btnElement = $('#' + CloseButtonHelper.btnId(recipeId));
            btnElement.click(CloseButtonHelper.onBtnClick);
            btnElement.get(0)[CloseButtonHelper.TAB_REMOVED_HANDLER] = onTabRemoved;
        }

        static onBtnClick(): void {
            var onTabRemoved = $(this).prop(CloseButtonHelper.TAB_REMOVED_HANDLER);
            //$(this).parents('li').remove('li');
            var liParent:JQuery = $(this).parents('li');
            var tabId = $(this).parents('li').children('a').attr('href');
            liParent.remove('li');
            $(tabId).remove();
            onTabRemoved();
        }

    };

    export class ViewRecipeWidget extends BaseWidget {

        private static singleton: ViewRecipeWidget;

        private _viewsTabContainer:JQuery;
        private _navBarElement:JQuery;
        private _tabContentElement:JQuery;
        private _noRecipeTab:JQuery;
        private _openViewsCtr:number = 0;

        static getInstance(): ViewRecipeWidget {
            if (!ViewRecipeWidget.singleton) {
                ViewRecipeWidget.singleton = new ViewRecipeWidget();
            }
            return ViewRecipeWidget.singleton;
        }

        static viewRecipe(recipe:model.RecipeDTO): void {
            ViewRecipeWidget.getInstance().showRecipe(recipe);
        }

        constructor() {
            super(utils.Helpers.idSelector(RECIPE_TABS_CONTAINER_ID), null);
            this._viewsTabContainer = $(utils.Helpers.idSelector(RECIPE_TABS_CONTAINER_ID));
            this._navBarElement = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID));
            this._tabContentElement = $(utils.Helpers.classSelector(RECIPE_VIEW_TAB_CONTENT_CLASS));
            this._noRecipeTab = $(utils.Helpers.idSelector(NO_RECIPE_VIEW_TAB_ID));
            this._element.click(this.onClick.bind(this));
        }

        private showRecipe(recipe:model.RecipeDTO): void {
            var recipeNavTab:JQuery = this.findRecipeView(recipe.id);
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
        }

        private showDefaultTab() {
            this._navBarElement.find(this.buildTabSelector(NO_RECIPE_VIEW_TAB_ID)).show();
            this.selectTab(NO_RECIPE_VIEW_TAB_ID);
        }

        private selectTab(tabPaneId:string) {
            this._navBarElement.find(this.buildTabSelector(tabPaneId)).tab('show');
        }

        private hideDefaultTab() {
            this._navBarElement.find(this.buildTabSelector(NO_RECIPE_VIEW_TAB_ID)).hide();
        }

        private onTabRemoved() {
            var lastTab:JQuery = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last');
            this._openViewsCtr--;
            logger.debug("this._openViewsCtr--:" + this._openViewsCtr);
            if (this._openViewsCtr >0) {
                lastTab.tab('show');
            }
            else {
                this.showDefaultTab();
            }
        }

        private findRecipeView(recipeId:string):JQuery {
            //var look4selector =  '#recipe-view-nav-id .a[href="#recipe-tab-' + recipeId +'"]';
            var recipeView:JQuery = this._navBarElement.find(this.buildTabSelector(this.buildRecipeTabId(recipeId)));
            //var recipeView:JQuery = $(look4selector);
            if (recipeView.length > 0) {
                logger.debug("Recipe:" + recipeId + " view is already opened");
                return recipeView;
            }
            else return null;
        }

        private appendRecipeView(recipe:model.RecipeDTO) {
            // create the tab
            //$('<li id="recipe-nav-' + recipe.id + '"><a data-toggle="tab" href="#recipe-tab-'+recipe.id+'">'+recipe.name+'</a></li>').appendTo(this._navBarElement);
            var recipeNavTab:JQuery = $('<li id="recipe-nav-' + recipe.id + '"><a data-toggle="tab" href="#recipe-tab-' + recipe.id + '">'
                + CloseButtonHelper.templatePattern(recipe.id) + '&nbsp;' + recipe.name + '</a></li>');
            if (recipeNavTab.length == 0) {
                logger.error("Failed to create nav tab for recipe " + recipe.name);
                return;
            }
            recipeNavTab.appendTo(this._navBarElement);

            // create the tab content
            //$('<div id=recipe-tab-'+recipe.id+' class="tab-pane"></div>').appendTo(this._tabContentElement);
            var recipeViewContent:JQuery = $('<div id=recipe-tab-' + recipe.id + ' class="tab-pane"></div>');
            if (recipeViewContent.length == 0) {
                logger.error("Failed to create tab content for recipe " + recipe.name);
                return;
            }

            recipeViewContent.appendTo(this._tabContentElement);
            this.appendRecipeViewTemplate(recipeViewContent, recipe);
            CloseButtonHelper.bindOnClick(recipe.id, this.onTabRemoved.bind(this));

            // make the new tab active
            var lastTab:JQuery = $(utils.Helpers.idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last');
            lastTab.tab('show');
            //$(idSelector(RECIPE_VIEW_NAV_BAR_ID) + ' a:last').tab('show');
        }

        private appendRecipeViewTemplate(recipeTabContent:JQuery, recipe:model.RecipeDTO):void {
            var grid:utils.Grid<model.RecipeDTO> = new utils.Grid<model.RecipeDTO>(utils.Helpers.classSelector(RECIPE_VIEW_TEMPLATE_CLASS), recipeTabContent);
            var recipeDataFill = new RecipeDataBinder();
            var recipeDataView:JQuery = grid.addCell(recipe, recipeDataFill.run.bind(recipeDataFill));
        }

        private buildRecipeTabId(recipeId:string) {
            return 'recipe-tab-' + recipeId;
        }

        private buildTabSelector(tabPaneId:string) {
            var recipeTabSelector = 'a[href="#' + tabPaneId + '"]';
            return recipeTabSelector;
        }

        onClick(eventObject:Event) : void {
            // If click is on close tab button - close the tab
            var jqElement: JQuery = $(eventObject.target);
            if (jqElement) {
                var closeBtn = jqElement.hasClass(" btn-close-recipe-view-js");
                if (closeBtn) {
                    alert("Haha !");
                }
            }

        }
    }
}