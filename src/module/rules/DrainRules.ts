/**
 * Handle all rules related to Shadowrun 5 magic drain.
 */
import DamageData = Shadowrun.DamageData;
import {DataDefaults} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import DamageType = Shadowrun.DamageType;
import {PartsList} from "../parts/PartsList";

export class DrainRules {
    /**
     * Calculate spell casting drain damage according to SR6e rules
     *
     * @param drain The drain value
     * @param force The force value used to cast (not used in SR6e)
     * @param magic The magic attribute level of the caster
     * @param hits Spellcasting test hits
     */
    static calcDrainDamage(drain: number, force: number, magic: number, hits: number): DamageData {
        if (magic < 0) magic = 1;
        if (hits < 0) hits = 0;

        console.log('Shadowrun 6e | DrainRules.calcDrainDamage inputs:', { drain, magic, hits });

        const damage = DataDefaults.damageData({}, true);
        damage.base = drain;
        damage.value = drain;
        damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(hits, magic);

        // Ensure all properties are set
        DrainRules.ensureDamageProperties(damage);

        console.log('Shadowrun 6e | DrainRules.calcDrainDamage result:', damage);

        return damage;
    }

    /**
     * Ensure that a damage object has all the required properties
     */
    static ensureDamageProperties(damage) {
        if (!damage) return;

        // Ensure value is set
        if (damage.value === undefined) {
            damage.value = damage.base || 0;
        }

        // Ensure type is set
        if (!damage.type) {
            damage.type = { base: 'stun', value: 'stun' };
        } else {
            // Ensure type.value is set
            if (damage.type.value === undefined) {
                damage.type.value = damage.type.base || 'stun';
            }
        }

        console.log('Shadowrun 6e | Ensured damage properties:', damage);
    }

    /**
     * Get the drain damage type according to SR6e rules
     * @param hits The spell casting test hits
     * @param magic The magic attribute level of the caster
     */
    static calcDrainDamageType(hits: number, magic: number): DamageType {
        if (hits < 0) hits = 0;
        if (magic < 0) magic = 1;
        // In SR6e, drain defaults to stun, only turned into physical rarely
        return hits > magic ? 'physical' : 'stun';
    }

    /**
     * Modify the drain damage after the spell casting test has been completed.
     *
     * @param drainDamage The base drain damage after force / drain has been chosen.
     * @param hits The spell casting test hits
     */
    static modifyDrainDamage(drainDamage: DamageData, hits: number) {
        if (hits < 0) hits = 0;

        console.log('Shadowrun 6e | DrainRules.modifyDrainDamage inputs:', { drainDamage, hits });

        drainDamage = foundry.utils.duplicate(drainDamage);

        PartsList.AddUniquePart(drainDamage.mod, 'SR6.Hits', -hits);
        Helpers.calcTotal(drainDamage, {min: 0});

        // Ensure all properties are set
        DrainRules.ensureDamageProperties(drainDamage);

        console.log('Shadowrun 6e | DrainRules.modifyDrainDamage result:', drainDamage);

        return drainDamage;
    }
}
