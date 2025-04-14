import { TestDialog, TestDialogListener } from "./TestDialog";
import { SpellCastingTest } from "../../tests/SpellCastingTest";

/**
 * Custom TestDialog for spellcasting tests that adds support for the number spinner buttons
 */
export class SpellcastingTestDialog extends TestDialog {
    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Add listeners for the number spinner buttons
        html.find('.number-spinner-button').on('click', this._onNumberSpinnerButtonClick.bind(this));
    }

    /**
     * Handle clicks on the number spinner buttons
     */
    _onNumberSpinnerButtonClick(event: JQuery.ClickEvent) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const action = button.dataset.action;
        const field = button.dataset.field;
        
        if (!field) return;
        
        // Find the input field
        const input = this.element.find(`input[name="${field}"]`);
        if (!input.length) return;
        
        // Get the current value
        let value = parseInt(input.val() as string) || 0;
        
        // Increment or decrement the value
        if (action === 'increment') {
            value += 1;
        } else if (action === 'decrement') {
            value = Math.max(0, value - 1);
        }
        
        // Update the input field
        input.val(value);
        
        // Trigger the change event to update the test data
        input.trigger('change');
    }
}
