import { GenesisImporter } from "./importer/actorImport/characterImporter/GenesisImporter.js"

export class GenesisImportForm extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'genesis-import';
        options.classes = ['sr6elysium'];
        options.title = 'Genesis Import';
        options.template = 'modules/shadowrun6-genesis-importer/module/templates/apps/genesis-import.html';
        options.width = 600;
        options.height = 'auto';
        return options;
    }

    getData() {
        return {};
    }

    activateListeners(html) {
        html.find('.submit-genesis-import').click(async (event) => {
            event.preventDefault();

            const genesisFile = JSON.parse($('.genesis-text').val());
            const importOptions = {
                weapons: $('.weapons').is(':checked'),
                armor: $('.armor').is(':checked'),
                cyberware: $('.cyberware').is(':checked'),
                equipment: $('.gear').is(':checked'),
                qualities: $('.qualities').is(':checked'),
                powers: $('.powers').is(':checked'),
                spells: $('.spells').is(':checked'),
                contacts: $('.contacts').is(':checked'),
                lifestyles: $('.lifestyles').is(':checked'),
                vehicles: $('.vehicles').is(':checked'),
                assignIcons: $('.assignIcons').is(':checked'),
            }

            const importer = new GenesisImporter();
            await importer.importGenesisCharacter(this.object, genesisFile, importOptions);

            ui.notifications?.info(
                'Genesis import complete! Please check everything to ensure it was imported correctly.'
            );
            this.close();
        });
    }
}
