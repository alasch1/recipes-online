/**
 * Created by aschneider on 10/10/2015.
 */
/// <reference path="../utils/Grid.ts" />
/// <reference path="../utils/Helpers.ts" />
/// <reference path="../definitions/bootstrap.d.ts" />

module alasch.cookbook.ui.views {

    var logger:alasch.cookbook.ui.utils.Logger = alasch.cookbook.ui.utils.LoggerFactory.getLogger('ModalDialogs');
    var utils = alasch.cookbook.ui.utils;

    var RESULT_MODAL_TEMPLATE_CLASS = 'result-modal-js';
    var MODAL_BODY_CLASS = 'modal-body';
    var OPERATION_RESULT_MODAL_ID = 'modal-result-id';
    var SUCCESS_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-ok"></span>';
    var FAILURE_ICON_SPAN_SELECTOR = '<span class="glyphicon glyphicon-remove"></span>';

    export enum OperationResultId {
        updateOk,
        updateFailed,
        createOk,
        createFailed,
        deleteOk,
        deleteFailed
    }

    class OperationResultModal {
        _dialog: JQuery;
        _successIconSpan:JQuery;
        _failureIconSpan: JQuery;

        constructor() {
        }

        init() {
            this._dialog = $(utils.Helpers.classSelector(RESULT_MODAL_TEMPLATE_CLASS)).clone();
            this._dialog.removeClass(RESULT_MODAL_TEMPLATE_CLASS);
            this._dialog.attr('id', OPERATION_RESULT_MODAL_ID);
            this._successIconSpan = $(SUCCESS_ICON_SPAN_SELECTOR);
            this._failureIconSpan = $(FAILURE_ICON_SPAN_SELECTOR);
            this._dialog.on('hidden.bs.modal', this.cleanDialog.bind(this));
        }

        show(operationResultId: OperationResultId) {
            switch (operationResultId) {
                case OperationResultId.updateOk:
                case OperationResultId.createOk:
                case OperationResultId.deleteOk:
                    this.showSuccess(operationResultId);
                    break;
                case OperationResultId.updateFailed:
                case OperationResultId.createFailed:
                case OperationResultId.deleteFailed:
                    this.showFailure(operationResultId);
                    break;
            }
        }

        private showSuccess(operationResultId: OperationResultId) {
            this.modalDialog(operationResultId, this._successIconSpan);
        }

        private showFailure(operationResultId: OperationResultId) {
            this.modalDialog(operationResultId, this._failureIconSpan);
        }

        private modalDialog(operationResultId: OperationResultId, icon: JQuery) {
            var dlgMessageSelector:string = this.getMessageSelector(operationResultId);
            if (this._dialog) {
                var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
                var dialogContent:JQuery = $(utils.Helpers.classSelector(dlgMessageSelector)).clone();
                dialogContent.append(icon);
                dialogBody.append(dialogContent);
                this._dialog.modal('show');
            }
        }

        private cleanDialog() {
            var dialogBody:JQuery = $(utils.Helpers.classSelector(MODAL_BODY_CLASS), this._dialog);
            dialogBody.empty();
        }

        private getMessageSelector(operationResultId: OperationResultId): string {
            switch (operationResultId) {
                case OperationResultId.updateOk: return 'modal-title-update-ok-js';
                case OperationResultId.updateFailed: return 'modal-title-update-failed-js';
                case OperationResultId.createOk: return 'modal-title-create-ok-js';
                case OperationResultId.createFailed: return 'modal-title-create-failed-js';
                case OperationResultId.deleteOk: return 'modal-title-delete-ok-js';
                case OperationResultId.deleteFailed: return 'modal-title-delete-failed-js';
            }
        }

    }

    export class ModalDialogsHandler {
        static _operationResultDlg: OperationResultModal;

        static showOperationResult(operationResultId: OperationResultId): void {
            ModalDialogsHandler.init();
            ModalDialogsHandler._operationResultDlg.show(operationResultId);
        }

        private static init() {
            if (!ModalDialogsHandler._operationResultDlg) {
                ModalDialogsHandler._operationResultDlg = new OperationResultModal();
                ModalDialogsHandler._operationResultDlg.init();
            }
        }
    }

}

