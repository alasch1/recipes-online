/**
 * Created by aschneider on 10/31/2015.
 */

/// <reference path="../../utils/TraceConsole.ts" />

module alasch.cookbook.ui.views.content {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Helpers');

    /**
     * Encapsulates hover handling over an cuisine content.
     * Handles 2 different cases: hover on a cuisine name and hover on a recipe name
     * Each cuisine and recipe may have a sibling toggable element.
     * When the handler wakes up upon a mouse move over the element :
     * onMouseEnter - decorates an element text with underline and shows the sibling element
     * onMouseLeave - removes the decoration and hides the sibling element
     */
    export class ElementHoverHandler {

        static CUISINE_TOGGABLE:string = '.cuisine-hover-toggle-js';
        static RECIPE_TOGGABLE:string = '.recipe-hover-toggle-js';

        static onMouseEnterCuisine():void {
            var selectedElement:JQuery = $(this);
            ElementHoverHandler.toggleDecoration(selectedElement, true);
            ElementHoverHandler.getCuisineToggable(selectedElement).show();
        }

        static onMouseLeaveCuisine():void {
            var selectedElement:JQuery = $(this);
            ElementHoverHandler.toggleDecoration(selectedElement, false);
            ElementHoverHandler.getCuisineToggable(selectedElement).hide();
        }

        static onMouseEnterRecipe():void {
            var selectedElement:JQuery = $(this);
            ElementHoverHandler.toggleDecoration(selectedElement, true);
            ElementHoverHandler.getRecipeToggable(selectedElement).show();
        }

        static onMouseLeaveRecipe():void {
            var selectedElement:JQuery = $(this);
            ElementHoverHandler.toggleDecoration(selectedElement, false);
            ElementHoverHandler.getRecipeToggable(selectedElement).hide();
        }

        private static getCuisineToggable(selectedElement:JQuery):JQuery {
            return selectedElement.find(ElementHoverHandler.CUISINE_TOGGABLE);
        }

        private static getRecipeToggable(selectedElement:JQuery):JQuery {
            return selectedElement.find(ElementHoverHandler.RECIPE_TOGGABLE);
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

}