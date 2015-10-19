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
        static _contentPath: string = 'content';
        static _recipePath: string = 'recipe';

        private _proxy: WebServiceProxy;

        constructor() {
            this._proxy = new WebServiceProxy();
        }

        init() {
            this._proxy.rootUrl = CookbookServiceProxy._rootPath;
        }

        getCookbookContent<T>(successCallback:(data:alasch.cookbook.ui.model.CuisineDTO[])=>void,
                              errorCallback:(errorStatus?: number)=>void) {
            var route = CookbookServiceProxy._contentPath;
            var request = new CookbookRequest(null, HttpMethod.GET, route);
            this.invokeRequest(request, successCallback, errorCallback);
        }

        addRecipe<T>(input, successCallback:()=>void, errorCallback:(errorStatus?: any)=>void) {
            var route = CookbookServiceProxy._recipePath;
            var request = new CookbookRequest(input, HttpMethod.POST, route);
            this.invokeRequest(request, successCallback, errorCallback);
        }

        updateRecipe<T>(input, successCallback:()=>void, errorCallback:(errorStatus?: any)=>void) {
            var route = CookbookServiceProxy._recipePath  + "/" + input.id;
            var request = new CookbookRequest(input, HttpMethod.PUT, route);
            this.invokeRequest(request, successCallback, errorCallback);
        }


        getRecipe<T>(recipeId:string, successCallback:()=>void, errorCallback:(errorStatus?: number)=>void) {
            var route = CookbookServiceProxy._recipePath + "/" + recipeId;
            var request = new CookbookRequest(null, HttpMethod.PUT, route);
            this.invokeRequest(request, successCallback, errorCallback);
        }

        deleteRecipe<T>(recipeId:string, successCallback:()=>void, errorCallback:(errorStatus?: number)=>void) {
            var route = CookbookServiceProxy._recipePath + "/" + recipeId;
            var request = new CookbookRequest(null, HttpMethod.DELETE, route);
            this.invokeRequest(request, successCallback, errorCallback);
        }

        private invokeRequest<T>(request:CookbookRequest<T>,
                                 successCallback:(data:T)=>void,
                                 errorCallback:(errorStatus?: number)=>void) {
            try {
                logger.info('Invoked request input:' + request.toString());
                request.validate();

                var wsRequest = new WebServiceRequest();
                wsRequest.parameters = request.getData();
                wsRequest.route = request.getRoute();
                wsRequest.httpMethod = request.getHttpMethod();

                logger.info("[TO CBK] - Sending request" + request.toString());
                this._proxy.invokeAsync(wsRequest, function (result) {
                        CookbookServiceProxy.onSuccess(request, result, successCallback, errorCallback);
                    },
                    function (result) {
                        CookbookServiceProxy.onError(request, result, errorCallback)
                    })
            }
            catch (e) {
                if (errorCallback != null)
                    errorCallback();
            }
        }

        static onSuccess<T1, T2>(request: CookbookRequest<T1>,
                            result: WebServiceResponse<T2>,
                            successCallback:(data?:T2)=>void,
                            errorCallback:(errorStatus?: number)=>void) {
            if (result.statusCode === 200 || result.statusCode === 201) {
                logger.info("[FROM CBK] - Recieved OK result - " + CookbookServiceProxy.toStringResultBody(result));
                if (successCallback != null) {
                    successCallback(<T2>result.returnValue);
                }
            }
            else if (errorCallback != null) {
                logger.error("[FROM CBK] - Recieved failure result - " + CookbookServiceProxy.toStringResultBody(result));
                errorCallback(result.statusCode);
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

        static onError<T>(request: CookbookRequest<T>,  result: WebServiceResponse<T>, errorCallback:(errorStatus: number)=>void) {
            logger.error("[FROM CBK] - Recieved failure result:" + CookbookServiceProxy.toStringResultBody(result));
            //var rsvpResponse = <CookbookResponse<T>>JSON.parse(result.responseText);
            if (errorCallback != null) {
                errorCallback(result.statusCode);
            }
        }
    }
}