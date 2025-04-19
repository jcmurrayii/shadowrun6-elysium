import { SR6Item } from "../item/SR6Item";
import RangedWeaponMode = Shadowrun.RangedWeaponMode;

/**
 * Rules for handling the effects of different firing modes on attack rating and damage
 */
export const FiringModeEffects = {
    /**
     * Apply effects of the current firing mode to attack rating and damage
     * 
     * SS (single_shot): No effect
     * SA (Semi-Automatic): Uses 2 rounds, decreases AR by 2, increases DV by 1
     * BF (Burst-fire): Uses 4 rounds, decreases AR by 4, increases DV by 2
     *   - If the gun does not have 4 rounds loaded, it will add +1 DV as long as two rounds are fired
     *   - Will decrease AR by 1 for each bullet fired
     * FA (Full Auto): Attacks all targets within a 1 meter radius area
     *   - AR is decreased by 6 and the attack consumes 10 rounds
     *   - Area can be expanded by 1 meter by reducing AR by a further 2
     * 
     * @param item The weapon item
     * @param attackRating Current attack rating
     * @param damage Current damage value
     * @returns Modified values { attackRating, damage }
     */
    applyFiringModeEffects(item: SR6Item, attackRating: number, damage: number): { attackRating: number, damage: number } {
        if (!item.isRangedWeapon) return { attackRating, damage };
        
        const currentMode = item.system.range.current_mode as RangedWeaponMode;
        if (!currentMode) return { attackRating, damage };
        
        const ammoLeft = item.ammoLeft;
        
        switch (currentMode) {
            case 'single_shot':
                // No effect for single shot
                return { attackRating, damage };
                
            case 'semi_auto':
                // Semi-auto: Uses 2 rounds, -2 AR, +1 DV
                return {
                    attackRating: attackRating - 2,
                    damage: damage + 1
                };
                
            case 'burst_fire':
                // Burst fire: Uses 4 rounds, -4 AR, +2 DV
                // If not enough ammo, +1 DV if at least 2 rounds, -1 AR per round
                if (ammoLeft >= 4) {
                    return {
                        attackRating: attackRating - 4,
                        damage: damage + 2
                    };
                } else if (ammoLeft >= 2) {
                    return {
                        attackRating: attackRating - ammoLeft,
                        damage: damage + 1
                    };
                } else {
                    // Not enough ammo for burst fire effects
                    return { attackRating, damage };
                }
                
            case 'full_auto':
                // Full auto: Uses 10 rounds, -6 AR
                // Area effect handled elsewhere
                return {
                    attackRating: attackRating - 6,
                    damage: damage
                };
                
            default:
                return { attackRating, damage };
        }
    },
    
    /**
     * Get the number of rounds consumed by a firing mode
     * 
     * @param mode The firing mode
     * @returns Number of rounds consumed
     */
    getRoundsConsumed(mode: RangedWeaponMode): number {
        switch (mode) {
            case 'single_shot': return 1;
            case 'semi_auto': return 2;
            case 'burst_fire': return 4;
            case 'full_auto': return 10;
            default: return 1;
        }
    }
};
