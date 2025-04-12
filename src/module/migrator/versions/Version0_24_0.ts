/**
 * Version 0.24.0 changes action types from simple/complex to minor/major
 * and adds initiative timing field.
 */
import { VersionMigration } from "../VersionMigration";
import { SR6Item } from "../../item/SR6Item";

export class Version0_24_0 extends VersionMigration {
    static readonly TargetVersion = '0.24.0';

    get SourceVersion(): string {
        return '0.23.2';
    }

    get TargetVersion(): string {
        return Version0_24_0.TargetVersion;
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

        // Only process items with actions
        if (item.system.action) {
            // Convert action types
            const currentActionType = item.system.action.type;
            let newActionType = currentActionType;
            
            // Convert complex to major
            if (currentActionType === 'complex') {
                newActionType = 'major';
                updateData.data['action.type'] = newActionType;
            }
            // Convert simple to minor
            else if (currentActionType === 'simple') {
                newActionType = 'minor';
                updateData.data['action.type'] = newActionType;
            }
            // Any other non-standard types will remain as they are
            
            // Set default initiative timing based on action type
            // Major and minor actions typically happen in initiative order
            // Free actions can happen anytime
            let initiativeTiming = 'none';
            if (newActionType === 'major' || newActionType === 'minor') {
                initiativeTiming = 'initiative';
            } else if (newActionType === 'free') {
                initiativeTiming = 'anytime';
            }
            
            updateData.data['action.initiative_timing'] = initiativeTiming;
        }

        return updateData;
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
        return item.system.action !== undefined;
    }
}
