/// <reference path="../definitions/jquery.d.ts" />

/**
 * Created by naviyehezkel on 19/07/2015.
 */
module alasch.cookbook.ui.http {

    export enum HttpMethod {
        GET,
        POST,
        PUT,
        DELETE
    };

    export class WebServiceRequest {
        httpMethod:HttpMethod;
        parameters:any;
        route:string;
        isSynchronized:boolean;
    };

    export class WebServiceResponse<T> {
        status:string;
        statusCode:number;
        statusText:string;
        returnValue:T;
        responseText:string;
        headers:any;

        isPlainText(): boolean {
            var contenTypeHeader = this.headers['Content-Type'];
            return (contenTypeHeader && contenTypeHeader.indexOf('text/plain') != -1);
        }
    };

    export class WebServiceProxy {
        rootUrl: string;
        overrideDefaultSerializer:(jqXHR:JQueryXHR)=>any;
        overrideRequestHeaders:()=>any;

        invokeAsync<T>(request:WebServiceRequest, callback:(res:WebServiceResponse<T>)=>void, errorCallback?:(res:WebServiceResponse<T>)=>void) {
            var url = this.rootUrl;
            if (request.route != null && request.route != undefined) {
                url += "/" + request.route
            }

            var requestBody;
            if (request.parameters != null) {
                if (request.httpMethod == HttpMethod.GET) {
                    url += "?"+jQuery.param(request.parameters)
                }
                else {
                    if (typeof (request.parameters) === "object") {
                        requestBody = JSON.stringify(request.parameters);
                    }
                    else {
                        requestBody = request.parameters
                    }
                }
            }

            var wrappedCallback = this.wrapCallback(this, callback, errorCallback);

            var ajaxSettings:JQueryAjaxSettings = {
                url: url,
                type: HttpMethod[request.httpMethod],
                complete: wrappedCallback,
                timeout: 30 * 1000,
                contentType: "application/json",
                async: !request.isSynchronized
            };

            if (request.httpMethod != HttpMethod.GET) {
                ajaxSettings.data= requestBody;
            }

            if (this.overrideRequestHeaders != null) {
                ajaxSettings.headers = this.overrideRequestHeaders();
            }

            jQuery.ajax(ajaxSettings)
        }

        private wrapCallback<T>(context:WebServiceProxy, callback:(res:WebServiceResponse<T>)=>void, errorCallback:(res:WebServiceResponse<T>)=>void) {
            return function (jqXhr:JQueryXHR, ajaxStatus:string) {
                var response = new WebServiceResponse<T>();
                response.status = ajaxStatus;
                response.statusCode = jqXhr.status;
                response.statusText = jqXhr.statusText;
                response.responseText = jqXhr.responseText;
                response.headers = WebServiceProxy.parseResponseHeaders(jqXhr);

                if (!WebServiceProxy.isSuccessStatus(response.statusCode)) {
                    //Not OK
                    if (errorCallback != null) {
                        errorCallback(response);
                    }
                    return;
                }

                try {
                    if (!response.isPlainText()) {
                        if (this.overrideDefaultSerializer == null) {
                             response.returnValue = <T>JSON.parse(response.responseText);
                        }
                        else {
                            response.returnValue = <T>context.overrideDefaultSerializer(jqXhr);
                        }
                    }
                }
                catch (error) {
                    var errorMessage = "WebServiceProxy failed to process the response. Error: " + error;

                    if (errorCallback != null) {
                        response.statusText += ". " + errorMessage;
                        errorCallback(response);
                    }
                    else {
                        throw new Error(errorMessage);
                    }
                }

                if (callback != null)
                    callback(response);
            };
        }

        private static parseResponseHeaders(jqXhr: JQueryXHR):any {

            var headersAsString = jqXhr.getAllResponseHeaders();
            var headers = {};
            if (headersAsString != null) {
                var keyValuePairs = headersAsString.split("\n");
                for (var i = 0; i < keyValuePairs.length; i++) {
                    var keyValue = keyValuePairs[i].split(":");
                    if (keyValue.length != 2)
                        continue;

                    var key = jQuery.trim(keyValue[0]);
                    headers[key] = jQuery.trim(keyValue[1]);
                }
            }

            return headers;
        }

        private static isSuccessStatus(statusCode: number) : boolean {
            switch(statusCode) {
                case 200:
                case 201:
                    return true;
                default:
                    return false;
            }

        }
    }
}

