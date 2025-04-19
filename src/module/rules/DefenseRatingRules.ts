import { SR6Actor } from "../actor/SR6Actor";
import { PartsList } from "../parts/PartsList";
import { Helpers } from "../helpers";

/**
 * Rules for calculating defense rating
 */
export class DefenseRatingRules {
    /**
     * Calculate the total defense rating for an actor
     * @param actor The actor to calculate defense rating for
     * @returns The calculated defense rating
     */
    static calculateDefenseRating(actor: SR6Actor): number {
        if (!actor) return 0;
        
        // Skip if the actor doesn't have armor
        if (!actor.hasArmor()) return 0;
        
        // Get the base defense rating
        const base = Number(actor.system.armor.defense_rating.base);
        
        // Create a parts list for modifiers
        const parts = new PartsList(actor.system.armor.defense_rating.mod);
        
        // Add body attribute as a modifier
        if (actor.system.attributes?.body) {
            parts.addUniquePart('SR6.AttrBody', actor.system.attributes.body.value);
        }
        
        // Calculate the total
        const total = base + parts.total;
        
        // Ensure the value is at least 0
        return Math.max(0, total);
    }
    
    /**
     * Update the actor's defense rating value
     * @param actor The actor to update
     * @returns The calculated defense rating
     */
    static async updateDefenseRating(actor: SR6Actor): Promise<number> {
        if (!actor) return 0;
        
        // Skip if the actor doesn't have armor
        if (!actor.hasArmor()) return 0;
        
        // Calculate the defense rating
        const defenseRating = this.calculateDefenseRating(actor);
        
        // Update the actor with the new value
        await actor.update({'system.armor.defense_rating.value': defenseRating});
        
        return defenseRating;
    }
    
    /**
     * Add a modifier to the actor's defense rating
     * @param actor The actor to modify
     * @param name The name of the modifier
     * @param value The value of the modifier
     * @returns The updated defense rating
     */
    static async addDefenseRatingModifier(actor: SR6Actor, name: string, value: number): Promise<number> {
        if (!actor || !actor.hasArmor()) return 0;
        
        // Add the modifier to the parts list
        PartsList.AddUniquePart(actor.system.armor.defense_rating.mod, name, value);
        
        // Calculate and update the defense rating
        return await this.updateDefenseRating(actor);
    }
    
    /**
     * Compare attack rating to defense rating to determine edge gain
     * @param attackRating The attack rating
     * @param defenseRating The defense rating
     * @returns Object with attackerWins and hasSignificantAdvantage flags
     */
    static compareRatings(attackRating: number, defenseRating: number): { attackerWins: boolean, hasSignificantAdvantage: boolean } {
        const attackerWins = attackRating >= defenseRating;
        const hasSignificantAdvantage = Math.abs(attackRating - defenseRating) >= 4;
        
        return { attackerWins, hasSignificantAdvantage };
    }
    
    /**
     * Determine if an actor should gain edge based on combat ratings
     * @param attacker The attacking actor
     * @param defender The defending actor
     * @param attackRating Optional override for attack rating
     * @returns Object with shouldGainEdge and reason
     */
    static shouldGainEdgeFromRatings(attacker: SR6Actor, defender: SR6Actor, attackRating?: number): { shouldGainEdge: boolean, reason: string } {
        if (!attacker || !defender) {
            return { shouldGainEdge: false, reason: "Missing actor" };
        }
        
        // Calculate attack rating if not provided
        if (attackRating === undefined) {
            // This would normally come from a weapon or spell
            // For simplicity, we'll use a placeholder calculation
            attackRating = 0;
            
            // Add attribute-based attack rating
            if (attacker.system.attributes?.agility) {
                attackRating += attacker.system.attributes.agility.value;
            }
        }
        
        // Calculate defense rating
        const defenseRating = this.calculateDefenseRating(defender);
        
        // Compare ratings
        const { attackerWins, hasSignificantAdvantage } = this.compareRatings(attackRating, defenseRating);
        
        // Determine edge gain
        if (attackerWins && hasSignificantAdvantage) {
            return { shouldGainEdge: true, reason: "Attacker has significant advantage" };
        }
        
        return { shouldGainEdge: false, reason: "No significant advantage" };
    }
}
