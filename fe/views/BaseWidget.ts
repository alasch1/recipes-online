/**
 * Created by aschneider on 9/24/2015.
 */

/// <reference path="../definitions/jquery.d.ts" />
///<reference path="../http/CookbookServiceProxy.ts"/>

module alasch.cookbook.ui.views {

    export class AppEventListener {
        notify: (eventTag: string, data?: any) => void;
    };

    export class BaseWidget {
        _element: JQuery;
        _cbkServiceProxy: alasch.cookbook.ui.http.CookbookServiceProxy;
        _appEventListener: AppEventListener;

        constructor(selector: string, appEventListener: AppEventListener, cbkServiceProxy?:alasch.cookbook.ui.http.CookbookServiceProxy) {
            this._element = $(selector);
            this._cbkServiceProxy = cbkServiceProxy;
            this._appEventListener = appEventListener;
        }

        init() : void {
            if (!this._cbkServiceProxy){
                //throw new Error("Please set a rsvpProxy before using the page.");
            }
        }
    }
}