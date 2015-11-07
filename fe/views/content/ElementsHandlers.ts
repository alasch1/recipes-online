/**
 * Created by aschneider on 10/31/2015.
 */

/// <reference path="../../utils/TraceConsole.ts" />
/// <reference path="./Selectors.ts" />

module alasch.cookbook.ui.views.content {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Helpers');
    var model = alasch.cookbook.ui.model;

    /**
     * Encapsulates hover handling over an cuisine content.
     * Handles 2 different cases: hover on a cuisine name and hover on a recipe name
     * Each cuisine and recipe may have a sibling toggable element.
     * When the handler wakes up upon a mouse move over the element :
     * onMouseEnter - decorates an element text with underline and shows the sibling element
     * onMouseLeave - removes the decoration and hides the sibling element
     */
    export class ElementsHoverHandler {

        static CUISINE_TOGGABLE:string = '.cuisine-hover-toggle-js';
        static RECIPE_TOGGABLE:string = '.recipe-hover-toggle-js';

        static onMouseEnterCuisine():void {
            var selectedElement:JQuery = $(this);
            ElementsHoverHandler.toggleDecoration(selectedElement, true);
            ElementsHoverHandler.getCuisineToggable(selectedElement).show();
        }

        static onMouseLeaveCuisine():void {
            var selectedElement:JQuery = $(this);
            ElementsHoverHandler.toggleDecoration(selectedElement, false);
            ElementsHoverHandler.getCuisineToggable(selectedElement).hide();
        }

        static onMouseEnterRecipe():void {
            var selectedElement:JQuery = $(this);
            ElementsHoverHandler.toggleDecoration(selectedElement, true);
            ElementsHoverHandler.getRecipeToggable(selectedElement).show();
        }

        static onMouseLeaveRecipe():void {
            var selectedElement:JQuery = $(this);
            ElementsHoverHandler.toggleDecoration(selectedElement, false);
            ElementsHoverHandler.getRecipeToggable(selectedElement).hide();
        }

        private static getCuisineToggable(selectedElement:JQuery):JQuery {
            return selectedElement.find(ElementsHoverHandler.CUISINE_TOGGABLE);
        }

        private static getRecipeToggable(selectedElement:JQuery):JQuery {
            return selectedElement.find(ElementsHoverHandler.RECIPE_TOGGABLE);
        }

        private static toggleDecoration(selectedElement:JQuery, setUnderline: boolean): void {
            if (setUnderline) {
                selectedElement.css('text-decoration', 'underline');
            }
            else {
                selectedElement.css('text-decoration', '');
            }
        }

    }

    /**
     * Encapsulates cuisine/recipe operations, which are triggered by click events.
     * Recipe operations: view/edit/delete
     * Cuisine operation: delete
     * Delegates execution to relevant Widget
     */
    export class ElementsClickHandler {

        static _contentWidget: ContentWidget;

        static onRecipeClick(eventObject: Event): void {
            var recipe = ElementsClickHandler.extractRecipeData($(eventObject.target));
            if (recipe) {
                ViewRecipeWidget.viewRecipe(recipe);
            }
            else {
                logger.warning("No event object was received on click content table!!");
            }
        }

        static onClickRecipeEditBtn(eventObject: Event) : void {
            var recipeRef = ElementsClickHandler.findRecipeRef($(eventObject.target));
            var recipe = ElementsClickHandler.extractRecipeData(recipeRef);
            if (recipe) {
                EditRecipeWidget.editRecipe(recipe);
            }
        }

        static onClickRecipeDeleteBtn(eventObject: Event): void {
            var invokeDelete = function(eventObject: Event) {
                logger.debug("Delete recipes was invoked");
                var recipeRef = ElementsClickHandler.findRecipeRef($(eventObject.target));
                var recipe = ElementsClickHandler.extractRecipeData(recipeRef);
                if (recipe) {
                    ElementsClickHandler._contentWidget.deleteRecipe.bind(ElementsClickHandler._contentWidget)(recipe);
                }
            }

            ModalDialogsHandler.showSubmitDelete(new SubmitHandler(invokeDelete, eventObject));
        }

        private static findRecipeRef(clickedElement: JQuery): JQuery {
            return clickedElement.parents(Selectors.RECIPE_ROW_SELECTOR).find(Selectors.RECIPE_REF_JS_SELECTOR);
        }

        private static extractRecipeData(jqElement: JQuery) : model.RecipeDTO {
            if (jqElement) {
                var data:any = jqElement.prop(Selectors.RECIPE_DATA_PROPERTY);
                if (data) {
                    return <alasch.cookbook.ui.model.RecipeDTO>data;
                }
            }
            logger.warning("Recipe data should be bound to recipe-row, but was not found!!");
            return null;
        }

        static onClickCuisineDeleteBtn(eventObject: Event): void {
            var invokeDelete = function(eventObject: Event) {
                logger.debug("Delete cuisine was invoked");
                var cuisineRef:JQuery = ElementsClickHandler.findCuisineRef($(eventObject.target));
                var cuisineId: string = ElementsClickHandler.extractCuisineId(cuisineRef);
                if (cuisineId!=="") {
                    ElementsClickHandler._contentWidget.deleteCuisine.bind(ElementsClickHandler._contentWidget)(cuisineId);
                }
            }

            ModalDialogsHandler.showSubmitDelete(new SubmitHandler(invokeDelete, eventObject));
        }

        private static findCuisineRef(clickedElement: JQuery): JQuery {
            return clickedElement.parents(Selectors.CUISINE_JS_SELECTOR).find(Selectors.CUISINE_NAME_JS_SELECTOR);
        }

        private static extractCuisineId(jqElement: JQuery): string {
            if (jqElement) {
                var cuisineId: string = jqElement.prop(Selectors.CUISINE_DATA_PROPERTY);
                if (cuisineId) {
                    return cuisineId;
                }
            }
            logger.warning("Cuisine id should be bound to cuisine name, but was not found!!");
            return "";
        }
    }

}