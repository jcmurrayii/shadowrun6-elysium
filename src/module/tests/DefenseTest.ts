import {OpposedTest, OpposedTestData} from "./OpposedTest";
import DamageData = Shadowrun.DamageData;
import {DataDefaults} from "../data/DataDefaults";
import { Translation } from '../utils/strings';


export interface DefenseTestData extends OpposedTestData {
    // Damage value of the attack
    incomingDamage: DamageData
    // Modified damage value of the attack after this defense (success or failure)
    modifiedDamage: DamageData

    // Should this defense test cause an initiative modifier to be applied, use this value
    // It's also used for display in chat.
    iniMod: number|undefined
}


/**
 * A semi abstract class to be used by other classes as a common extension interface.
 *
 * Handle general damage data as well as general defense rules.
 */
export class DefenseTest<T extends DefenseTestData = DefenseTestData> extends OpposedTest<T> {

    override _prepareData(data, options?) {
        data = super._prepareData(data, options);



        // Try to get damage from the correct path
        const baseDamage = data.against?.data?.damage || data.against?.damage || DataDefaults.damageData();

        // Calculate incoming damage (base damage + attacker hits)
        data.incomingDamage = foundry.utils.duplicate(baseDamage);
        if (data.against?.hits?.value) {
            const PartsList = CONFIG.SR6.PartsList;
            data.incomingDamage.mod = PartsList.AddUniquePart(data.incomingDamage.mod, 'SR6.Attacker', data.against.hits.value);
            data.incomingDamage.value = Helpers.calcTotal(data.incomingDamage, {min: 0});
        }

        // Modified damage will be calculated in processResults based on defense hits
        data.modifiedDamage = foundry.utils.duplicate(data.incomingDamage);

        return data;
    }

    /**
     * For defense tests, check if there's incoming damage instead of action damage
     */
    override get hasDamage(): boolean {
        return this.data.incomingDamage?.value > 0 && this.data.incomingDamage?.type?.value !== '';
    }

    override get _chatMessageTemplate() {
        return 'systems/sr6elysium/dist/templates/rolls/defense-test-message.html'
    }

    override get successLabel(): Translation {
        return 'SR6.TestResults.AttackDodged';
    }

    override get failureLabel(): Translation {
        return 'SR6.TestResults.AttackHits';
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense'];
    }

    /**
     * This test has changed the initiative score of its caster.
     */
    get hasChangedInitiative(): boolean {
        return this.data.iniMod !== undefined;
    }

    get initiativeModifier(): number {
        return this.data.iniMod || 0;
    }
}
