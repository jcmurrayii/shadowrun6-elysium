import {SR6Actor} from "../SR6Actor";
import {SR6Item} from '../../item/SR6Item';
import DamageData = Shadowrun.DamageData;

export class SoakFlow {
    knocksDown(damage: DamageData, actor:SR6Actor) {
        // TODO: SR5 195 Called Shot Knock Down (Melee Only), requires attacker STR and actually announcing that called shot.
        const gelRoundsEffect = this.isDamageFromGelRounds(damage) ? -2 : 0;  // SR5 434
        const impactDispersionEffect = this.isDamageFromImpactDispersion(damage) ? -2 : 0  // FA 52

        // SR5 194
        const knockedDown = damage.value > actor.getAttribute("body").value;

        console.log(`SR6: Elysium | Determined target ${actor.id} knocked down status as: ${knockedDown}`, damage, actor);

        return knockedDown;
    }

    isDamageFromGelRounds(damage: DamageData) {
        if (damage.source && damage.source.actorId && damage.source.itemId) {
            const attacker = game.actors?.find(actor => actor.id == damage.source?.actorId);
            if (attacker) {
                const item = attacker.items.find(item => item.id == damage.source?.itemId) as SR6Item;
                if (item) {
                    return item.items
                        .filter(mod => mod.getTechnologyData()?.equipped)
                        .filter(tech => tech.name == game.i18n.localize("SR6.AmmoGelRounds")).length > 0;
                }
            }
        }
        return false;
    }

    isDamageFromImpactDispersion(damage: DamageData) {
        // TODO: FA 52. Ammo currently cannot have mods, so not sure how to implement Alter Ballistics idiomatically.
        return false;
    }
}
