import {FormDialog, FormDialogData} from "./FormDialog";

export class DeleteConfirmationDialog extends FormDialog {
    constructor(options?) {
        const dialogData = DeleteConfirmationDialog.getDialogData() as unknown as FormDialogData;

        super(dialogData, options)
    }

    static getDialogData() {
        return {
            title: game.i18n.localize("SR6.DeleteConfirmationApplication.Title"),
            buttons: {
                delete: {
                    label: game.i18n.localize('SR6.DeleteConfirmationApplication.Delete')
                },
                cancel: {
                    label: game.i18n.localize('SR6.DeleteConfirmationApplication.Cancel')
                }
            },
            default: 'cancel',
            templateData: {},
            templatePath: 'systems/sr6elysium/dist/templates/apps/dialogs/delete-confirmation-dialog.html'
        }
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'delete-confirmation-application';
        // Class Dialog here is needed for dialog button styling.
        options.classes = ['sr6', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        return options;
    }
}
