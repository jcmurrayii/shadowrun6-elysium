import {SR6BaseActorSheet} from "./SR6BaseActorSheet";
import MarkedDocument = Shadowrun.MarkedDocument;
import { Helpers } from "../../helpers";
import SR6ActorSheetData = Shadowrun.SR6ActorSheetData;


export interface CharacterSheetData extends SR6ActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    markedDocuments: MarkedDocument[]
    handledItemTypes: string[]
    inventory: Record<string, any>
}


export class SR6CharacterSheet extends SR6BaseActorSheet {
    /**
     * Character actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
            'sin',
            'lifestyle',
            'contact',
            'spell',
            'ritual_spells',
            'adept_power',
            'complex_form',
            'quality',
            'echo',
            'metamagic',
            'critter_power',
            'call_in_action',
            'ritual'
        ];
    }

    /**
     * Character actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): string[] {
        const itemTypes = super.getInventoryItemTypes();

        return [
            ...itemTypes,
            'weapon',
            'ammo',
            'armor',
            'bioware',
            'cyberware',
            'device',
            'equipment',
            'modification'
        ];
    }

    override async getData(options) {
        const data = await super.getData(options) as CharacterSheetData;

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);
        data['markedDocuments'] = this.actor.getAllMarkedDocuments();

        // Separate matrix actions from regular actions
        this._prepareActions(data);

        return data;
    }

    /**
     * Cache for matrix actions to avoid recalculating them every time
     * @type {Object}
     * @private
     */
    _matrixActionsCache = null;

    /**
     * Clear the matrix actions cache
     * This should be called when items are added or removed
     */
    clearMatrixActionsCache() {
        this._matrixActionsCache = null;
        console.log('Shadowrun 6e | Matrix actions cache cleared');
    }

    /**
     * Force a refresh of the character sheet
     * This should be called when the actor's data changes
     */
    forceRefresh() {
        console.log('Shadowrun 6e | Forcing refresh of character sheet');

        // Get the latest data from the actor
        const actor = game.actors.get(this.actor.id);
        if (actor) {
            console.log('Shadowrun 6e | Character sheet data before refresh:', {
                sheetActions: this.actor.system.initiative.actions,
                actorActions: actor.system.initiative.actions
            });
        }

        // We can't directly set this.actor as it only has a getter
        // Instead, we'll just re-render the sheet which will get the latest actor data
        this.render(true);
    }

    /**
     * Separate matrix actions from regular actions
     * @param sheetData The data for the actor sheet
     * @private
     */
    _prepareActions(sheetData) {
        // Initialize the data structure if it doesn't exist
        if (!sheetData.itemType) {
            sheetData.itemType = {};
        }

        // Get all actions
        const actions = sheetData.itemType.action || [];

        // Check if we have a valid cache and the actor has the matrix actions flag set
        const hasMatrixActions = this.actor.getFlag('shadowrun6-elysium', 'hasMatrixActions');
        if (this._matrixActionsCache && hasMatrixActions) {
            // Use the cached matrix actions
            sheetData.matrixActions = this._matrixActionsCache.matrixActions;
            sheetData.nonMatrixActions = this._matrixActionsCache.nonMatrixActions;
            sheetData.itemType.action = this._matrixActionsCache.nonMatrixActions;
            return;
        }

        // Separate matrix actions from regular actions
        const matrixActions = [];
        const nonMatrixActions = [];

        // Categorize actions
        for (const action of actions) {
            // Check if this is a matrix action
            const isMatrixAction = this._isMatrixAction(action);

            if (isMatrixAction) {
                matrixActions.push(action);
            } else {
                nonMatrixActions.push(action);
            }
        }

        // Add actions to sheet data
        sheetData.matrixActions = matrixActions;
        sheetData.nonMatrixActions = nonMatrixActions;

        // Replace the original action array with only non-matrix actions
        // This ensures matrix actions don't show up in the Actions tab
        sheetData.itemType.action = nonMatrixActions;

        // Cache the matrix actions if the actor has the matrix actions flag set
        if (hasMatrixActions) {
            this._matrixActionsCache = {
                matrixActions: [...matrixActions],
                nonMatrixActions: [...nonMatrixActions]
            };
        }
    }

    /**
     * Get the saved state of a folder
     * @param folderId The ID of the folder
     * @param defaultState The default state if no saved state is found
     * @returns {boolean} True if the folder is collapsed
     * @private
     */
    _getFolderState(folderId, defaultState = false) {
        const key = `folders.${folderId}`;
        const state = this.actor.getFlag('shadowrun6-elysium', key);
        return state !== undefined ? state : defaultState;
    }



    /**
     * Override the _onItemEdit method to clear the matrix actions cache
     * @param event The click event
     * @private
     */
    override async _onItemEdit(event) {
        await super._onItemEdit(event);
        this.clearMatrixActionsCache();
    }

    /**
     * Override the _onItemDelete method to clear the matrix actions cache
     * @param event The click event
     * @private
     */
    override async _onItemDelete(event) {
        await super._onItemDelete(event);
        this.clearMatrixActionsCache();
    }

    /**
     * Determine if an action is a matrix action
     * @param action The action item
     * @returns {boolean} True if the action is a matrix action
     * @private
     */
    _isMatrixAction(action) {
        // Check action categories for matrix-related categories
        const matrixCategories = [
            'matrix'
        ];

        // Check if action has any matrix categories
        if (action.system?.action?.categories) {
            const categories = action.system.action.categories;
            return categories.some(category => matrixCategories.includes(category));
        }
    }

    /**
     * Inject special case handling for call in action items, only usable by character actors.
     * Also clears the matrix actions cache when items are created.
     */
    override async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.closest('.list-header').dataset.itemId;

        if (type !== 'summoning' && type !== 'compilation') {
            await super._onItemCreate(event);
            this.clearMatrixActionsCache();
            return;
        }

        await this._onCallInActionCreate(type);
        this.clearMatrixActionsCache();
    }

    /**
     * Create a call in action item with pre configured actor type.
     *
     * @param type The call in action sub type.
     */
    async _onCallInActionCreate(type: 'summoning'|'compilation') {
        // Determine actor type from sub item type.
        const typeToActorType = {
            'summoning': 'spirit',
            'compilation': 'sprite'
        }
        const actor_type = typeToActorType[type];
        if (!actor_type) return console.error('Shadowrun 6e | Call In Action Unknown actor type during creation');

        // TODO: Add translation for item names...
        const itemData = {
            name: `${game.i18n.localize('SR6.New')} ${Helpers.label(type)}`,
            type: 'call_in_action',
            'system.actor_type': actor_type
        };

        await this.actor.createEmbeddedDocuments('Item',  [itemData], {renderSheet: true});
    }
}
