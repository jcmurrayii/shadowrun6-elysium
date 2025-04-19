import { SR6Actor } from "../actor/SR6Actor";
import { SR6Item } from "../item/SR6Item";
import { Helpers } from "../helpers";
import { MatrixRules } from "../rules/MatrixRules";
import { WeaponRangeRules } from "../rules/WeaponRangeRules";
import { SYSTEM_NAME } from "../constants";

/**
 * A centralized service for handling targeting in the Shadowrun 6e system.
 * This service provides methods for getting, validating, and suggesting targets
 * for various types of actions.
 */
export class TargetingService {
    /**
     * Get valid targets for an action
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns An array of valid target tokens
     */
    static getValidTargetsForAction(action: SR6Item, actor: SR6Actor): Token[] {
        // Get all user targets
        const targets = Helpers.getUserTargets();
        
        // If no targets, return empty array
        if (targets.length === 0) {
            return [];
        }
        
        // Filter targets based on action requirements
        return targets.filter(target => this.isValidTarget(target, action, actor));
    }
    
    /**
     * Check if a target is valid for an action
     * @param target The target token
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns True if the target is valid for the action
     */
    static isValidTarget(target: Token, action: SR6Item, actor: SR6Actor): boolean {
        // Skip if target has no actor
        if (!target.actor) return false;
        
        // Check range for physical actions
        if (action.isRangedWeapon() && !this.isInRange(target, action, actor)) {
            return false;
        }
        
        // Check line of sight for physical and magical actions
        if ((action.isRangedWeapon() || action.isSpell()) && !this.hasLineOfSight(target, actor)) {
            return false;
        }
        
        // Check matrix requirements for matrix actions
        if (action.isMatrixAction() && !this.isValidMatrixTarget(target, action, actor)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if a target is in range for a ranged action
     * @param target The target token
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns True if the target is in range
     */
    static isInRange(target: Token, action: SR6Item, actor: SR6Actor): boolean {
        const actorToken = actor.getToken();
        if (!actorToken) return false;
        
        // Get the distance between tokens
        const distance = canvas.grid?.measureDistance(actorToken.position, target.position) || 0;
        
        // Get the weapon's range
        if (action.isRangedWeapon()) {
            const weapon = action.asWeapon;
            if (!weapon) return false;
            
            // Get the maximum range of the weapon
            const maxRange = WeaponRangeRules.getMaxRange(weapon);
            
            return distance <= maxRange;
        }
        
        return true;
    }
    
    /**
     * Check if a target has line of sight from the actor
     * @param target The target token
     * @param actor The actor performing the action
     * @returns True if the actor has line of sight to the target
     */
    static hasLineOfSight(target: Token, actor: SR6Actor): boolean {
        const actorToken = actor.getToken();
        if (!actorToken) return false;
        
        // Use Foundry's built-in line of sight calculation
        return actorToken.vision.los.contains(target.center.x, target.center.y);
    }
    
    /**
     * Check if a target is valid for a matrix action
     * @param target The target token
     * @param action The matrix action being performed
     * @param actor The actor performing the action
     * @returns True if the target is valid for the matrix action
     */
    static isValidMatrixTarget(target: Token, action: SR6Item, actor: SR6Actor): boolean {
        // Skip if target has no actor
        if (!target.actor) return false;
        
        // Check if the target has a matrix presence
        const targetActor = target.actor as SR6Actor;
        
        // For now, just check if the target has any matrix attributes
        // This could be expanded based on specific matrix action requirements
        return targetActor.hasMatrixAttributes();
    }
    
    /**
     * Suggest targets for an action when none are selected
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns An array of suggested target tokens
     */
    static suggestTargetsForAction(action: SR6Item, actor: SR6Actor): Token[] {
        // Get the actor's token
        const actorToken = actor.getToken();
        if (!actorToken) return [];
        
        // Get all tokens in the scene
        const tokens = canvas.tokens?.placeables || [];
        
        // Filter for potential targets (exclude the actor's own token)
        const potentialTargets = tokens.filter(token => 
            token.id !== actorToken.id && 
            token.actor && 
            this.isValidTarget(token, action, actor)
        );
        
        // Sort by distance to the actor
        return potentialTargets.sort((a, b) => {
            const distA = canvas.grid?.measureDistance(actorToken.position, a.position) || 0;
            const distB = canvas.grid?.measureDistance(actorToken.position, b.position) || 0;
            return distA - distB;
        });
    }
    
    /**
     * Highlight valid targets for an action
     * @param action The action being performed
     * @param actor The actor performing the action
     */
    static highlightValidTargets(action: SR6Item, actor: SR6Actor): void {
        // Get all tokens in the scene
        const tokens = canvas.tokens?.placeables || [];
        
        // Reset all token highlights
        tokens.forEach(token => {
            token.border?.visible = false;
        });
        
        // Get valid targets
        const validTargets = tokens.filter(token => 
            token.actor && 
            this.isValidTarget(token, action, actor)
        );
        
        // Highlight valid targets
        validTargets.forEach(token => {
            token.border.visible = true;
            token.border.style.borderColor = 0x00FF00; // Green for valid targets
        });
        
        // Force a canvas refresh
        canvas.tokens?.refresh();
    }
    
    /**
     * Clear target highlights
     */
    static clearTargetHighlights(): void {
        // Get all tokens in the scene
        const tokens = canvas.tokens?.placeables || [];
        
        // Reset all token highlights
        tokens.forEach(token => {
            token.border?.visible = false;
        });
        
        // Force a canvas refresh
        canvas.tokens?.refresh();
    }
    
    /**
     * Get targets for an opposed test
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns An array of target actors
     */
    static getOpposedTestTargets(action: SR6Item, actor: SR6Actor): SR6Actor[] {
        // Get valid targets
        const validTargets = this.getValidTargetsForAction(action, actor);
        
        // Convert to actors
        return validTargets
            .map(token => token.actor as SR6Actor)
            .filter(actor => actor !== undefined);
    }
    
    /**
     * Check if the user has valid targets for an action
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns True if the user has valid targets
     */
    static hasValidTargets(action: SR6Item, actor: SR6Actor): boolean {
        return this.getValidTargetsForAction(action, actor).length > 0;
    }
    
    /**
     * Target the suggested targets for an action
     * @param action The action being performed
     * @param actor The actor performing the action
     * @returns True if targets were suggested and targeted
     */
    static targetSuggestedTargets(action: SR6Item, actor: SR6Actor): boolean {
        // Get suggested targets
        const suggestedTargets = this.suggestTargetsForAction(action, actor);
        
        // If no suggested targets, return false
        if (suggestedTargets.length === 0) {
            return false;
        }
        
        // Clear current targets
        game.user?.targets.forEach(target => {
            game.user?.targets.delete(target);
        });
        
        // Target the suggested targets
        suggestedTargets.forEach(target => {
            game.user?.targets.add(target);
        });
        
        return true;
    }
}
