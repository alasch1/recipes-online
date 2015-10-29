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

    export class ModalDialogsHandler {
        //static _operationResultDlg: OperationResultModal;
        static _operationResultDlgs: OperationResultModals;
        static _submitDeleteDlg: SubmitDeleteModal;
        static _isInitialized: boolean = false;

        static showOperationResult(operationResultId: OperationResultId): void {
            ModalDialogsHandler.init();
            ModalDialogsHandler._operationResultDlgs.show(operationResultId);
        }

        static showSubmitDelete(onSubmit: SubmitHandler) {
            ModalDialogsHandler.init();
            ModalDialogsHandler._submitDeleteDlg.show(onSubmit);
        }

        static init() {
            if (ModalDialogsHandler._isInitialized) {
                return;
            }
            ModalDialogsHandler._operationResultDlgs = new OperationResultModals();
            ModalDialogsHandler._submitDeleteDlg = new SubmitDeleteModal();

            // I am not sure this code does something helpful
            //$(document).on('show.bs.modal', '.modal', ModalDialogsHandler.centerModal);
            //$(window).on("resize", function () {
            //    $('.modal:visible').each(ModalDialogsHandler.centerModal);
            //});

            ModalDialogsHandler._isInitialized = true;
        }

        private static centerModal() {
            $(this).css('display', 'block');
            var $dialog = $(this).find(".modal-dialog");
            var offset = ($(window).height() - $dialog.height()) / 2;
            var bottomMargin = parseInt($dialog.css('marginBottom'), 10);

            // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
            if (offset < bottomMargin) {
                offset = bottomMargin;
            }
            $dialog.css("margin-top", offset);
        }
    }
}

