/**
 * Created by aschneider on 10/3/2015.
 */
/// <reference path="../utils/TraceConsole.ts" />

module alasch.cookbook.ui.utils {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('Helpers');

    export class Helpers {

        constructor() {
        }

        static classSelector(className:string): string {
            return "." + className;
        }

        static idSelector(id:string): string {
            return "#" + id;
        }

    }
}