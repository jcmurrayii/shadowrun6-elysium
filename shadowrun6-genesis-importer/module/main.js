import { GenesisImportForm } from './apps/genesis-import-form.js';

Hooks.once('init', () => {
    console.log('Shadowrun 6e Genesis Importer | Initializing module');
});

Hooks.once('ready', () => {
    console.log('Shadowrun 6e Genesis Importer | Module ready');
});

// Register the Genesis importer with the Shadowrun 6e system
Hooks.on('renderActorSheet', (app, html, data) => {
    // Only add the button to Shadowrun 6e character sheets
    if (app.actor.type !== 'character' || !app.actor.system) return;
    
    // Find the import character button
    const importButton = html.find('.import-character');
    if (importButton.length === 0) return;
    
    // Add our own click handler
    importButton.off('click').on('click', (event) => {
        event.preventDefault();
        
        // Create a dialog to choose between Chummer and Genesis import
        const content = `
            <div style="text-align: center; margin-bottom: 10px;">
                <p>${game.i18n.localize('SR6.ImportCharacterChoose')}</p>
            </div>
            <div style="display: flex; justify-content: space-around;">
                <button class="chummer-import">${game.i18n.localize('SR6.ChummerImport')}</button>
                <button class="genesis-import">${game.i18n.localize('SR6.GenesisImport')}</button>
            </div>
        `;

        const dialog = new Dialog({
            title: game.i18n.localize('SR6.ImportCharacter'),
            content: content,
            buttons: {},
            render: html => {
                html.find('.chummer-import').click(() => {
                    dialog.close();
                    // Call the system's Chummer importer
                    app._onShowImportCharacter(event);
                });

                html.find('.genesis-import').click(() => {
                    dialog.close();
                    const options = {
                        name: 'genesis-import',
                        title: game.i18n.localize('SR6.GenesisImport'),
                    };
                    new GenesisImportForm(app.actor, options).render(true);
                });
            }
        });

        dialog.render(true);
    });
});

// Export the GenesisImportForm for external use
export { GenesisImportForm };
