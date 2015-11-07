/**
 * Created by aschneider on 9/26/2015.
 */
/// <reference path="../utils/TraceConsole.ts" />

module alasch.cookbook.ui.model {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Cookbook');

    //export class IngredientDTO {
    //    name: string;
    //    qty: number;
    //    units:string;
    //
    //    constructor() {
    //        this.name = "";
    //        this.qty = 0;
    //        this.units = "";
    //    }
    //};

    export class RecipeDTO {
        id: string;
        name : string;
        cuisine: string;
        ingredients: string[];
        method: string;

        constructor(){
            this.ingredients = new Array<string>();
        }
    };

    export class CuisineDTO {
        id: string;
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
        id: string;
        name: string;
        cuisines: CuisineDTO[];

        constructor(id: string, name: string) {
            this.id = id;
            this.name = name;
            this.cuisines = new Array<CuisineDTO>();
        }
    };

}


