/**
 * Created by naviyehezkel on 26/07/2015.
 */
/// <reference path="./WebServiceProxy.ts" />

module alasch.cookbook.ui.http {

    export class CookbookRequest<T> {

        private _httpMethod:HttpMethod;
        private _data:T;
        private _route:string;

        constructor(data?:T, httpMethod?:HttpMethod, route?:string) {
            this._data = data;
            this._httpMethod = typeof (httpMethod) === "undefined" ? HttpMethod.POST : httpMethod;
            this._route = route || "";
        }

        getData():T {
            return this._data;
        }

        setData(data:T) {
            this._data= data;
        }

        getHttpMethod():HttpMethod {
            return this._httpMethod;
        }

        setHttpMethod(httpMethod:HttpMethod) {
            this._httpMethod = httpMethod;
        }

        setRoute(route:string) {
            this._route = route;
        }

        getRoute():string {
            return this._route;
        }

        validate():void {
            if (this._httpMethod == HttpMethod.GET && this.getRoute() == "") {
                throw new Error("Invalid request. " +
                    "When invoking a service request with the 'Http GET' method, the deriving class must implement the getRoute() method.")
            }
        }

        toString(): string {
            return('[' + this._httpMethod.toString() +
                ', path:' + this.getRoute() +
                ', data:' + JSON.stringify(this._data) +']');
        }
    }

    export class CookbookResponse<T> extends WebServiceResponse<T> {
        data:T;

        toString(): string {
            return ('[' + JSON.stringify(this.data) + ']');
        }
    }

}