/**
 * Custom inline editing implementation for Shadowrun 6e
 */

/**
 * Initialize inline editing for a specific dialog
 * @param app The application/dialog to initialize inline editing for
 */
export function initializeInlineEdit(app: Application) {
    const html = app.element;
    
    // Toggle edit mode when clicking the edit button
    html.on('click', '.edit-button', function(e) {
        e.preventDefault();
        const field = $(this).closest('.editable-field');
        field.find('.display-mode').hide();
        field.find('.edit-mode').show();
        
        // Focus on the input
        field.find('.edit-input').focus();
    });
    
    // Save changes when clicking outside the edit field
    html.on('blur', '.edit-input', function(e) {
        const field = $(this).closest('.editable-field');
        const input = $(this);
        const name = input.attr('name');
        const value = input.val();
        
        // Update the display value
        let displayText = value;
        
        // For select elements, get the selected option text
        if (input.is('select')) {
            displayText = input.find('option:selected').text();
        }
        
        field.find('.display-value').text(displayText);
        
        // Hide edit mode, show display mode
        field.find('.edit-mode').hide();
        field.find('.display-mode').show();
        
        // Trigger form change event
        const formData = {};
        formData[name] = value;
        app['_onChangeInput']?.({target: input[0]});
    });
    
    // Handle keyboard events
    html.on('keydown', '.edit-input', function(e) {
        const field = $(this).closest('.editable-field');
        
        // Save on Enter
        if (e.key === 'Enter') {
            e.preventDefault();
            $(this).blur();
        }
        
        // Cancel on Escape
        if (e.key === 'Escape') {
            e.preventDefault();
            field.find('.edit-mode').hide();
            field.find('.display-mode').show();
        }
    });
}
