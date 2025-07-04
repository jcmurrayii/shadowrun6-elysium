import { FormDialog, FormDialogData } from "./FormDialog";
import { SR6Actor } from "../../actor/SR6Actor";
import { SR6Item } from '../../item/SR6Item';

/**
 * Show a list of the SR6Actor inventories to the user and let them choose one.
 *
 * @returns The inventory name selected.
 */
export class MoveInventoryDialog extends FormDialog {
    /**
     * @param actor Use this actor's inventories to select from.
     * @param item The item to be moved between inventories
     * @param sourceInventory The currently selected inventory, which won't be displayed.
     * @param options
     */
    constructor(actor: SR6Actor, item: SR6Item, sourceInventory: string, options?) {
        const dialogData = MoveInventoryDialog.getDialogData(actor, item, sourceInventory) as unknown as FormDialogData;

        super(dialogData, options);
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'move-inventory-application';
        options.classes = ['sr6', 'form-dialog'];
        options.height = 'auto';
        return options;
    }

    static getDialogData(actor: SR6Actor, item: SR6Item, sourceInventory: string) {
        const inventories = MoveInventoryDialog.selectableInventories(actor, item, sourceInventory);

        return {
            title: game.i18n.localize('SR6.MoveInventoryDialog.Title'),
            buttons: {
                move: {
                    label: game.i18n.localize('SR6.MoveInventoryDialog.Move')
                },
                cancel: {
                    label: game.i18n.localize('SR6.MoveInventoryDialog.Cancel')
                }
            },
            default: 'cancel',
            templateData: { inventories },
            templatePath: 'systems/sr6elysium/dist/templates/apps/dialogs/move-inventory-dialog.html',
            onAfterClose: async html => {
                return html.find('input[name="inventories"]:checked').val();
            }
        }
    }

    /**
     * Depending on actor and item different intenvories are selectable.
     *
     * @param actor Actor to check for inventories
     * @param item Item that is to be moved to a new inventory
     * @param sourceInventory Inventory that is to be moved from
     * @returns List of inventories
     */
    static selectableInventories(actor: SR6Actor, item: SR6Item, sourceInventory: string) {
        // The current item may be shown in all inventories, so show the currently active inventory as well.
        if (sourceInventory !== actor.allInventories.name && actor.inventory.isItemInInventory(actor.allInventories.name, item)) {
            const inventories = Object.values(actor.inventory.getAll())
                .filter(inventory => inventory.name !== actor.allInventories.name)
                .sort();

            inventories.unshift(actor.defaultInventory);
            return inventories;
        }


        // The current item is shown in one inventory, so hide the currently active inventory.
        const inventories = Object.values(actor.inventory.getAll())
            .filter(inventory => inventory.name !== sourceInventory)
            .sort();

        // Add the default inventories for selection when necessary.
        if (sourceInventory !== actor.defaultInventory.name) inventories.unshift(actor.defaultInventory);

        return inventories;
    }
}
