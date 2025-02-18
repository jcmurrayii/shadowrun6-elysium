import { SR6Actor } from "../actor/SR6Actor";

export interface DefeatedStatus {
    unconscious: Boolean,
    dying: Boolean,
    dead: Boolean,

}
export const ConditionRules = {
    /**
     * Determine the current defeated status of an actor
     *
     * @param actor The actor to check out
     */
    determineDefeatedStatus: (actor: SR6Actor): DefeatedStatus => {
        const stun = actor.getStunTrack();
        const phyiscal = actor.getPhysicalTrack();
        const matrix = actor.getMatrixTrack();

        let unconscious = false;
        let dying = false;
        let dead = false;

        // Some actor types die differently.
        if (actor.isIC() || actor.isSprite()) {
            dead = matrix?.value === matrix?.max;
        } else if (actor.isVehicle() || actor.isGrunt()) {
            dead = phyiscal?.value === phyiscal?.max;
        } else {
            unconscious = stun?.value === stun?.max;
            dying = phyiscal?.value === phyiscal?.max;
            dead = phyiscal?.overflow.value === phyiscal?.overflow.max;
        }

        return {
            unconscious, dying, dead
        }
    }

}
