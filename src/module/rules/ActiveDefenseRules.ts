import { SR6Actor } from "../actor/SR6Actor";
import { SR6Item } from "../item/SR6Item";
import { Translation } from "../utils/strings";

/**
 * Everything around SR5#190 'Active Defenses'
 */
export type ActiveDefenseData = Record<string, { label: Translation, value: number|undefined, initMod: number, weapon?: string, disabled?: boolean }>

export const ActiveDefenseRules = {
    /**
     * What active defenses are available for the given item? Based on SR5#190 'Active Defenses'
     * @param weapon The equipped weapon used for the attack.
     * @param actor The actor performing the attack.
     */
    availableActiveDefenses: (weapon: SR6Item, actor: SR6Actor): ActiveDefenseData => {
        // General purpose active defenses. ()
        const activeDefenses: ActiveDefenseData  = {
            full_defense: {
                label: 'SR6.FullDefense',
                value: actor.getFullDefenseAttribute()?.value,
                initMod: -10,
            },
        };

        if (!weapon.isMeleeWeapon) return activeDefenses;

        // Melee weapon specific active defenses.
        activeDefenses['dodge'] = {
            label: 'SR6.Dodge',
            value: actor.findActiveSkill('gymnastics')?.value,
            initMod: -5,
        };
        activeDefenses['block'] = {
            label: 'SR6.Block',
            value: actor.findActiveSkill('unarmed_combat')?.value,
            initMod: -5,
        };
        activeDefenses['parry'] = {
            label: 'SR6.Parry',
            weapon: weapon.name || '',
            value: actor.findActiveSkill(weapon.getActionSkill())?.value,
            initMod: -5,
        };

        return activeDefenses;
    }
};
