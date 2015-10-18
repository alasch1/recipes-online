/**
 * Created by aschneider on 9/28/2015.
 */

module alasch.cookbook.ui.utils {

    export interface IOnBindTemplate<T> {
        (cellElement: JQuery, data?: T) : void;
    };

    class GridCell<T> {
        _cellData: T;
        _cellElement: JQuery;

        constructor(element: JQuery, data:T) {
            this._cellData = data;
            this._cellElement = element;
        }
    }

    export class Grid<T> {

        private _cells: Array<GridCell<T>>;
        private _cellTemplate: JQuery;
        private _gridContainer: JQuery;

        constructor(templateSelector: string, gridContainer: JQuery) {
            this._cells = new Array<GridCell<T>>();
            this._cellTemplate = $(templateSelector);
            this._gridContainer = gridContainer;
        }

        addCell(data?: T, onBindTemplate?: IOnBindTemplate<T>) : JQuery {
            var cellElement: JQuery;
            cellElement = this._cellTemplate.clone();

            if (onBindTemplate != null) {
                onBindTemplate(cellElement, data);
            }

            // Save data in the internal grid collection
            var cell = new GridCell(cellElement, data);
            this._cells.push(cell);

            this._gridContainer.append(cellElement);
            return cellElement;
        }

        getCells() : Array<GridCell<T>> {
            return this._cells;
        }

        clear() {
            this._cells = [];
        }
    };

}