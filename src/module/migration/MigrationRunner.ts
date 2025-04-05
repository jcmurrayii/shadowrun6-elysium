import { RANGE_CATEGORIES, RANGE_MODIFIERS, WeaponRangeRules } from '../rules/WeaponRangeRules';
import { SR6Item } from '../item/SR6Item';

export class MigrationRunner {
    // ... existing code ...

    static async migrateWeaponRanges(item: SR6Item) {
        if (!item.isRangedWeapon) return;

        const updateData = {
            'system.range': {
                current: 0,
                category: RANGE_CATEGORIES.NEAR, // Default to "near" range
                modifier: RANGE_MODIFIERS[RANGE_CATEGORIES.NEAR]
            }
        };

        // Remove old range data structure
        await item.update({
            'system.range.-=ranges': null,
            'system.range.-=selected': null,
            // Add new range structure
            ...updateData
        });
    }

    static async migrateToNewRanges() {
        ui.notifications?.info('Starting weapon range migration...');

        // Migrate all weapons in all actor inventories
        for (const actor of game.actors || []) {
            const weapons = actor.items.filter(i => i.isRangedWeapon);
            for (const weapon of weapons) {
                await this.migrateWeaponRanges(weapon);
            }
        }

        // Migrate all weapons in world items
        for (const item of game.items || []) {
            if (item.isRangedWeapon) {
                await this.migrateWeaponRanges(item);
            }
        }

        ui.notifications?.info('Weapon range migration complete.');
    }

    static async migrateWeaponAttackRatings(item: SR6Item) {
        if (!item.isRangedWeapon) return;

        const updateData = {
            'system.range.attackRating': {
                [RANGE_CATEGORIES.CLOSE]: 0,
                [RANGE_CATEGORIES.NEAR]: 0,
                [RANGE_CATEGORIES.MEDIUM]: 0,
                [RANGE_CATEGORIES.FAR]: 0,
                [RANGE_CATEGORIES.EXTREME]: 0
            }
        };

        // Migrate from old attack rating structure if it exists
        const oldAR = item.system?.attack_rating;
        if (oldAR) {
            // Map old values to new categories if they exist
            if (oldAR.close) updateData.system.range.attackRating[RANGE_CATEGORIES.CLOSE] = oldAR.close;
            if (oldAR.near) updateData.system.range.attackRating[RANGE_CATEGORIES.NEAR] = oldAR.near;
            if (oldAR.medium) updateData.system.range.attackRating[RANGE_CATEGORIES.MEDIUM] = oldAR.medium;
            if (oldAR.far) updateData.system.range.attackRating[RANGE_CATEGORIES.FAR] = oldAR.far;
            if (oldAR.extreme) updateData.system.range.attackRating[RANGE_CATEGORIES.EXTREME] = oldAR.extreme;
        }

        // Remove old attack rating structure and add new one
        await item.update({
            'system.-=attack_rating': null,
            ...updateData
        });
    }
}
