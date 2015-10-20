/**
 * Created by aschneider on 9/26/2015.
 */
/// <reference path="../utils/TraceConsole.ts" />

module alasch.cookbook.ui.model {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Cookbook');

    export class IngredientDTO {
        name: string;
        qty: number;
        units:string;

        constructor() {
            this.name = "";
            this.qty = 0;
            this.units = "";
        }
    };

    export class RecipeDTO {
        id: string;
        name : string;
        cuisine: string;
        ingredients: IngredientDTO[];
        method: string;

        constructor(){
            this.ingredients = new Array<IngredientDTO>();
        }
    };

    export class CuisineDTO {
        name: string;
        recipes: RecipeDTO[];

        constructor(name: string) {
            this.name = name;
            this.recipes = new Array<RecipeDTO>();
        }

        setRecipes(recipes: RecipeDTO[]) {
            this.recipes = recipes;
        }
    };

    export class CookbookDTO {
        id: number;
        cuisines: CuisineDTO[];

        constructor(id: number) {
            this.id = id;
            this.cuisines = new Array<CuisineDTO>();
        }
    };

}

