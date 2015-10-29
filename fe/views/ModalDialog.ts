/**
 * Created by aschneider on 10/10/2015.
 */
/// <reference path="../utils/Helpers.ts" />
/// <reference path="../definitions/bootstrap.d.ts" />

module alasch.cookbook.ui.views {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ModalDialogs');
    var utils = alasch.cookbook.ui.utils;

    export enum OperationResultId {
        updateOk,
        updateFailed,
        createOk,
        createFailed,
        deleteOk,
        deleteFailed
    }
    //var dlgSelectors: any = {};
    //var msgSelectors: any = {};
    //
    //(function initSelectors() {
    //
    //    // init dialogs ids
    //    dlgSelectors[OperationResultId.updateOk] = 'update-ok-dlg';
    //    dlgSelectors[OperationResultId.updateFailed] = 'update-err-dlg';
    //    dlgSelectors[OperationResultId.createOk] = 'create-ok-dlg';
    //    dlgSelectors[OperationResultId.createFailed] = 'create-err-dlg';
    //    dlgSelectors[OperationResultId.deleteOk] = 'delete-ok-dlg';
    //    dlgSelectors[OperationResultId.deleteFailed] = 'delete-err-dlg';
    //
    //    //// init messages ids
    //    //msgSelectors[OperationResultId.updateOk] = 'modal-title-update-ok-js';
    //    //msgSelectors[OperationResultId.updateFailed] = 'modal-title-update-failed-js';
    //    //msgSelectors[OperationResultId.createOk] = 'modal-title-create-ok-js';
    //    //msgSelectors[OperationResultId.createFailed] = 'modal-title-create-failed-js';
    //    //msgSelectors[OperationResultId.deleteOk] = 'modal-title-delete-ok-js';
    //    //msgSelectors[OperationResultId.deleteFailed] = 'modal-title-delete-failed-js';
    //
    //})();

    class OperationResultModals {
        _dialogs: any;

        constructor() {
            this._dialogs = {};
            this.init();
        }

        show(operationResultId: OperationResultId) {
            var dlg = this._dialogs[operationResultId];
            dlg.modal('show');
        }

        private init() {
            // init dialogs
            this._dialogs[OperationResultId.updateOk] = this.getDialog('update-ok-dlg');
            this._dialogs[OperationResultId.updateFailed] = this.getDialog('update-err-dlg');
            this._dialogs[OperationResultId.createOk] = this.getDialog('create-ok-dlg');
            this._dialogs[OperationResultId.createFailed] = this.getDialog('create-err-dlg');
            this._dialogs[OperationResultId.deleteOk] = this.getDialog('delete-ok-dlg');
            this._dialogs[OperationResultId.deleteFailed] = this.getDialog('delete-err-dlg');
        }

        private getDialog(dlgId: string): JQuery {
            return $(utils.Helpers.idSelector(dlgId)).clone();
        }

    }

    //======================================
    // Submit Delete Modal
    //======================================

    export interface ISubmitMethod {
        (data?: any) : void;
    }
    export class SubmitHandler {
        method: ISubmitMethod;
        data: any;

        constructor(method: ISubmitMethod, data?: any) {
            this.method = method;
            this.data = data;
        }
    };

    class SubmitDeleteModal {
        _dlgId: string = 'submit-delete-recipe-dlg';
        _submitBtnPrefix: string = 'submit-btn-';
        _dialog: JQuery;
        _submitBtn: JQuery;
        _submitHandler: SubmitHandler;

        constructor() {
            this.init();
        }

        private init() {
            this._dialog = $(utils.Helpers.idSelector(this._dlgId)).clone();
            this._submitBtn = $(utils.Helpers.idSelector(this._submitBtnPrefix+this._dlgId), this._dialog);
            //this._cancelBtn = $(utils.Helpers.idSelector(this._cancelBtnPrefix+this._dlgId), this._dialog);
            this._submitBtn.click(this.onSubmitClick.bind(this));
        }

        show(submitHandler: SubmitHandler) {
            this._submitHandler = submitHandler;
            this._dialog.modal('show');
        }

        onSubmitClick() {
            this._dialog.modal('hide');
            this._submitHandler.method(this._submitHandler.data);
        }

    }

    //var RESULT_MODAL_TEMPLATE_CLASS = 'result-modal-js';
    //var MODAL_BODY_CLASS = 'modal-body';
    //var OPERATION_RESULT_MODAL_ID = 'modal-result-id';
    //var SUCCESS_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-ok"></span>';
    //var FAILURE_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-remove"></span>';

    //class OperationResultModal {
    //    _dialog: JQuery;
    //    _successIconSpan:JQuery;
    //    _failureIconSpan: JQuery;
    //
    //    constructor() {
    //    }
    //
    //    init() {
    //        this._dialog = $(utils.Helpers.classSelector(RESULT_MODAL_TEMPLATE_CLASS)).clone();
    //        this._dialog.removeClass(RESULT_MODAL_TEMPLATE_CLASS);
    //        this._dialog.attr('id', OPERATION_RESULT_MODAL_ID);
    //        this._successIconSpan = $(SUCCESS_ICON_SPAN_SELECTOR);
    //        this._failureIconSpan = $(FAILURE_ICON_SPAN_SELECTOR);
    //        this._dialog.on('hidden.bs.modal', this.cleanDialog.bind(this));
    //    }
    //
    //    show(operationResultId: OperationResultId) {
    //        switch (operationResultId) {
    //            case OperationResultId.updateOk:
    //            case OperationResultId.createOk:
    //            case OperationResultId.deleteOk:
    //                this.showSuccess(operationResultId);
    //                break;
    //            case OperationResultId.updateFailed:
    //            case OperationResultId.createFailed:
    //            case OperationResultId.deleteFailed:
    //                this.showFailure(operationResultId);
    //                break;
    //        }
    //    }
    //
    //    private showSuccess(operationResultId: OperationResultId) {
    //        this.modalDialog(operationResultId, this._successIconSpan);
    //    }
    //
    //    private showFailure(operationResultId: OperationResultId) {
    //        this.modalDialog(operationResultId, this._failureIconSpan);
    //    }
    //
    //    private modalDialog(operationResultId: OperationResultId, icon: JQuery) {
    //        var dlgMessageSelector:string = this.getMessageSelector(operationResultId);
    //        if (this._dialog) {
    //            var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
    //            var dialogContent:JQuery = $(utils.Helpers.classSelector(dlgMessageSelector)).clone();
    //            dialogContent.append(icon);
    //            dialogBody.append(dialogContent);
    //            this._dialog.modal('show');
    //        }
    //    }
    //
    //    private cleanDialog() {
    //        var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
    //        dialogBody.empty();
    //    }
    //
    //    private getMessageSelector(operationResultId: OperationResultId): string {
    //        switch (operationResultId) {
    //            case OperationResultId.updateOk: return 'modal-title-update-ok-js';
    //            case OperationResultId.updateFailed: return 'modal-title-update-failed-js';
    //            case OperationResultId.createOk: return 'modal-title-create-ok-js';
    //            case OperationResultId.createFailed: return 'modal-title-create-failed-js';
    //            case OperationResultId.deleteOk: return 'modal-title-delete-ok-js';
    //            case OperationResultId.deleteFailed: return 'modal-title-delete-failed-js';
    //        }
    //    }
    //
    //}

    export class ModalDialogsHandler {
        //static _operationResultDlg: OperationResultModal;
        static _operationResultDlgs: OperationResultModals;
        static _submitDeleteDlg: SubmitDeleteModal;

        static showOperationResult(operationResultId: OperationResultId): void {
            ModalDialogsHandler.init();
            ModalDialogsHandler._operationResultDlgs.show(operationResultId);
        }

        static showSubmitDelete(onSubmit: SubmitHandler) {
            ModalDialogsHandler.init();
            ModalDialogsHandler._submitDeleteDlg.show(onSubmit);
        }

        static init() {
            if( !ModalDialogsHandler._operationResultDlgs) {
                ModalDialogsHandler._operationResultDlgs = new OperationResultModals();
            }
            if (! ModalDialogsHandler._submitDeleteDlg) {
                ModalDialogsHandler._submitDeleteDlg = new SubmitDeleteModal();
            }
        }
    }
}

