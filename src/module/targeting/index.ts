import { TargetingService } from "./TargetingService";

/**
 * Register targeting hooks
 */
export function registerTargetingHooks() {
    // Register a hook to highlight valid targets when an item is used
    Hooks.on('sr6:preItemRoll', (item, actor) => {
        // Only highlight targets for items that can target other actors
        if (item.isRangedWeapon() || item.isSpell() || item.isMatrixAction()) {
            TargetingService.highlightValidTargets(item, actor);
        }
    });
    
    // Register a hook to clear target highlights when an item roll is complete
    Hooks.on('sr6:itemRoll', () => {
        TargetingService.clearTargetHighlights();
    });
    
    // Register a hook to clear target highlights when an item roll is cancelled
    Hooks.on('sr6:itemRollCancel', () => {
        TargetingService.clearTargetHighlights();
    });
    
    console.log("Shadowrun 6e | Targeting hooks registered");
}

/**
 * Initialize the targeting system
 */
export function initializeTargeting() {
    registerTargetingHooks();
    
    console.log("Shadowrun 6e | Targeting system initialized");
}
