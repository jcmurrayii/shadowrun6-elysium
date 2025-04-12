/**
 * Version 0.24.1 adds legality property to matrix actions
 * Electronics-based matrix actions are legal, while cracking-based matrix actions are illegal
 */
import { VersionMigration } from "../VersionMigration";
import { SR6Item } from "../../item/SR6Item";

export class Version0_24_1 extends VersionMigration {
    static readonly TargetVersion = '0.24.1';

    get SourceVersion(): string {
        return '0.24.0';
    }

    get TargetVersion(): string {
        return Version0_24_1.TargetVersion;
    }

    /**
     * Migrate a single Item entity to the new data model.
     * @param item The item data to migrate
     * @return The updated item data
     */
    protected override async MigrateItemData(item: SR6Item) {
        const updateData: {
            data?: object
        } = {
            data: {}
        };

        // Only process action items
        if (item.type === 'action' && item.system.action) {
            // Check if this is a matrix action
            if (this.isMatrixAction(item)) {
                // Determine if the action is legal or illegal
                const isIllegal = this.isIllegalMatrixAction(item);
                updateData.data['action.legality'] = isIllegal ? 'illegal' : 'legal';
                
                console.log(`SR6: Setting matrix action ${item.name} legality to ${isIllegal ? 'illegal' : 'legal'}`);
            }
        }

        return updateData;
    }

    /**
     * Determine if an item is a matrix action
     * @param item The item to check
     * @returns True if the item is a matrix action
     */
    private isMatrixAction(item: SR6Item): boolean {
        // Check if the item has matrix-related categories
        const matrixCategories = [
            'matrix_action',
            'matrix_defense',
            'matrix_initiative',
            'matrix_perception',
            'matrix_search',
            'hack_on_the_fly',
            'brute_force',
            'data_spike',
            'crack_file',
            'matrix_stealth',
            'matrix_confuse_persona',
            'matrix_jump_into_rigged_device',
            'matrix_control_device',
            'matrix_format_device',
            'matrix_reboot_device',
            'matrix_full_matrix_defense',
            'matrix_hide',
            'matrix_jack_out',
            'matrix_jam_signals',
            'matrix_spoof_command',
            'matrix_trace_icon'
        ];
        
        // Check if action has any matrix categories
        if (item.system?.action?.categories) {
            const categories = item.system.action.categories;
            if (categories.some(category => matrixCategories.includes(category))) {
                return true;
            }
        }
        
        // Check if action name contains matrix-related terms
        const matrixTerms = ['matrix', 'hack', 'cyberdeck', 'deck', 'icon', 'host', 'persona', 'grid', 'commlink'];
        const actionName = item.name.toLowerCase();
        return matrixTerms.some(term => actionName.includes(term));
    }

    /**
     * Determine if a matrix action is illegal (cracking-based) or legal (electronics-based)
     * @param item The matrix action item
     * @returns True if the action is illegal (cracking-based)
     */
    private isIllegalMatrixAction(item: SR6Item): boolean {
        // Cracking-based categories and terms that indicate illegal actions
        const illegalCategories = [
            'hack_on_the_fly',
            'brute_force',
            'data_spike',
            'crack_file',
            'matrix_stealth'
        ];
        
        // Check categories
        if (item.system?.action?.categories) {
            const categories = item.system.action.categories;
            if (categories.some(category => illegalCategories.includes(category))) {
                return true;
            }
        }
        
        // Check name for cracking-related terms
        const illegalTerms = ['hack', 'crack', 'brute force', 'data spike', 'spoof', 'sneak', 'stealth'];
        const actionName = item.name.toLowerCase();
        return illegalTerms.some(term => actionName.includes(term));
    }

    /**
     * Migrate a single Scene entity to use the new data model.
     * @param scene The Scene data to migrate
     * @return The updated Scene data
     */
    protected override async MigrateSceneData(scene: Scene) {
        const tokens = scene.tokens.map(token => {
            const t = token.toObject();
            if (t.actorLink && t.actorId) {
                t.actorData = {};
            }
            return t;
        });
        return { tokens };
    }

    /**
     * If the migration should also handle this document
     * @param item
     */
    protected override async ShouldMigrateItemData(item: SR6Item): Promise<boolean> {
        return item.type === 'action';
    }
}
