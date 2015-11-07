/**
 * Created by naviyehezkel on 19/07/2015.
 */
/// <reference path="./WebServiceProxy.ts" />
/// <reference path="./CookbookRequestResponse.ts" />
/// <reference path="../utils/TraceConsole.ts" />

module alasch.cookbook.ui.http {

    var logger: alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger("CookbookServiceProxy");

    export class CookbookServiceProxy {

        // URLS
        static _rootPath: string ='';
        static _cookbookPath: string = 'cookbook';
        static _recipePath: string = 'recipe';
        static _cuisinePath: string = 'cuisine';

        private _proxy: WebServiceProxy;

        constructor() {
            this._proxy = new WebServiceProxy();
        }

        init() {
            this._proxy.rootUrl = CookbookServiceProxy._rootPath;
        }

        getCookbooks<T>(onSuccess:(data: model.CookbookDTO[])=> void, onError:(errorStatus?: number)=>void) {
            var request = new CookbookRequest(null, HttpMethod.GET, CookbookServiceProxy._cookbookPath);
            this.invokeRequest(request, onSuccess, onError);
        }

        getCookbookContent<T>(cookbookId: string, onSuccess:(data: model.CuisineDTO[])=>void,
                              onError:(errorStatus?: number)=>void) {
            var route = this.buildCookbookIdUrl(cookbookId);
            var request = new CookbookRequest(null, HttpMethod.GET, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        addRecipe<T>(cookbookId: string, input, onSuccess:()=>void, onError:(errorStatus?: any)=>void) {
            var route = this.buildRecipeUrl(cookbookId);
            var request = new CookbookRequest(input, HttpMethod.POST, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        updateRecipe<T>(cookbookId: string, input, onSuccess:()=>void, onError:(errorStatus?: any)=>void) {
            var route = this.buildRecipeIdUrl(cookbookId,input.id);
            var request = new CookbookRequest(input, HttpMethod.PUT, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        getRecipe<T>(cookbookId: string, recipeId:string, onSuccess:()=>void, onError:(errorStatus?: number)=>void) {
            var route = this.buildRecipeIdUrl(cookbookId,recipeId);
            var request = new CookbookRequest(null, HttpMethod.PUT, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        deleteRecipe<T>(cookbookId: string, recipeId:string, onSuccess:()=>void, onError:(errorStatus?: number)=>void) {
            var route = this.buildRecipeIdUrl(cookbookId,recipeId);
            var request = new CookbookRequest(null, HttpMethod.DELETE, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        deleteCuisine<T>(cookbookId: string, cuisineId:string, onSuccess:()=>void, onError:(errorStatus?: number)=>void) {
            var route = this.buildCuisineIdUrl(cookbookId,cuisineId);
            var request = new CookbookRequest(null, HttpMethod.DELETE, route);
            this.invokeRequest(request, onSuccess, onError);
        }

        private buildCookbookIdUrl(cookbookId: string): string {
            return CookbookServiceProxy._cookbookPath + "/" + cookbookId;
        }

        private buildRecipeUrl(cookbookId: string): string {
            return  this.buildCookbookIdUrl(cookbookId) + "/" + CookbookServiceProxy._recipePath;
        }

        private buildCuisineIdUrl(cookbookId: string, cuisineId: string) {
            return this.buildCookbookIdUrl(cookbookId) + "/" + CookbookServiceProxy._cuisinePath + "/" + cuisineId;
        }

        private buildRecipeIdUrl(cookbookId: string, recipeId: string): string {
            return  this.buildRecipeUrl(cookbookId) + "/" + recipeId;
        }

        private invokeRequest<T>(request:CookbookRequest<T>,
                                 onSuccess:(data:T)=>void,
                                 onError:(errorStatus?: number)=>void) {
            try {
                logger.info('Invoked request input:' + request.toString());
                request.validate();

                var wsRequest = new WebServiceRequest();
                wsRequest.parameters = request.getData();
                wsRequest.route = request.getRoute();
                wsRequest.httpMethod = request.getHttpMethod();

                logger.info("[TO CBK] - Sending request" + request.toString());
                this._proxy.invokeAsync(wsRequest, function (result) {
                        CookbookServiceProxy.onSuccess(request, result, onSuccess, onError);
                    },
                    function (result) {
                        CookbookServiceProxy.onError(request, result, onError)
                    })
            }
            catch (e) {
                if (onError != null)
                    onError();
            }
        }

        static onSuccess<T1, T2>(request: CookbookRequest<T1>,
                            result: WebServiceResponse<T2>,
                            onSuccessCB:(data?:T2)=>void,
                            onErrorCB:(errorStatus?: number)=>void) {
            if (result.statusCode === 200 || result.statusCode === 201) {
                logger.info("[FROM CBK] - Recieved OK result - " + CookbookServiceProxy.toStringResultBody(result));
                if (onSuccessCB != null) {
                    onSuccessCB(<T2>result.returnValue);
                }
            }
            else if (onErrorCB != null) {
                logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result));
                onErrorCB(result.statusCode);
            }
            else {
                logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result) +
                    "; no error callback is defined.");
            }
        }

        static toStringResultBody<T>(result: WebServiceResponse<T>) : string {
            if (result.returnValue) {
                return 'body:' + (<T>result.returnValue).toString();
            }
            else {
                return 'body:none';
            }
        }

        static onError<T>(request: CookbookRequest<T>,  result: WebServiceResponse<T>, onErrorCB:(errorStatus: number)=>void) {
            logger.error("[FROM CBK] - Recieved failure result:" + CookbookServiceProxy.toStringResultBody(result));
            //var rsvpResponse = <CookbookResponse<T>>JSON.parse(result.responseText);
            if (onErrorCB != null) {
                onErrorCB(result.statusCode);
            }
        }
    }
}