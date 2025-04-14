import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellCastingTestData} from "./SpellCastingTest";
import {DrainRules} from "../rules/DrainRules";
import {Helpers} from "../helpers";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
import GenericValueField = Shadowrun.GenericValueField;
import { Translation } from '../utils/strings';
import { DataDefaults } from "../data/DataDefaults";

export interface DrainTestData extends SuccessTestData {
    incomingDrain: DamageData
    modifiedDrain: DamageData

    against: SpellCastingTestData
}


/**
 * Implement a Drain Test as is defined in SR5#282 'Step 6 - Resist Drain'
 *
 * Drain defines it's incoming drain and modifies it to it's modified drain,
 * both of which the user can apply.
 */
export class DrainTest extends SuccessTest<DrainTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Is this test part of a followup test chain? spell => drain
        if (data.against) {
            console.log('Shadowrun 6e | DrainTest preparing data with against:', data.against);

            // Create a new drain damage object with the correct values
            const drainValue = data.against.drain || 0;
            console.log('Shadowrun 6e | Drain value from against data:', drainValue);

            data.incomingDrain = DataDefaults.damageData({
                base: drainValue,
                value: drainValue,
                type: {
                    base: 'stun',
                    value: 'stun'
                }
            }, true);

            console.log('Shadowrun 6e | Created new incoming drain:', data.incomingDrain);

            data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);
        // This test is part of either a standalone test or created with its own data (i.e. edge reroll).
        } else {
            console.log('Shadowrun 6e | DrainTest preparing data without against');
            data.incomingDrain = data.incomingDrain ?? DataDefaults.damageData({}, true);
            data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);
        }

        // Ensure the damage objects have value properties
        this._ensureDamageProperties(data.incomingDrain);
        this._ensureDamageProperties(data.modifiedDrain);

        console.log('Shadowrun 6e | DrainTest prepared data:', {
            incomingDrain: data.incomingDrain,
            modifiedDrain: data.modifiedDrain
        });

        return data;
    }

    /**
     * Ensure that a damage object has all the required properties
     */
    _ensureDamageProperties(damage) {
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

    override get _dialogTemplate(): string {
        return 'systems/shadowrun6-elysium/dist/templates/apps/dialogs/drain-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun6-elysium/dist/templates/rolls/drain-test-message.html';
    }

    /**
     * Override to add debugging for drain test message template data
     */
    override async _prepareMessageTemplateData() {
        const templateData = await super._prepareMessageTemplateData();

        console.log('Shadowrun 6e | DrainTest _prepareMessageTemplateData:', {
            templateData,
            incomingDrain: this.data.incomingDrain,
            modifiedDrain: this.data.modifiedDrain,
            testObject: templateData.test
        });

        return templateData;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute2': 'willpower'
        };
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['drain'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'drain']
    }

    static override async _getDocumentTestAction(item, actor) {
        const documentAction = await super._getDocumentTestAction(item, actor);

        if (!actor.isAwakened) {
            console.error(`Shadowrun 6e | A ${this.name} expected an awakened actor but got this`, actor);
            return documentAction;
        }

        // Get magic school attribute.
        const attribute = actor.system.magic.attribute;
        foundry.utils.mergeObject(documentAction, {attribute});

        // Return the school attribute based on actor configuration.
        return documentAction;
    }

    /**
     * Re-calculate incomingDrain in case of user input
     */
    override calculateBaseValues() {
        super.calculateBaseValues();

        Helpers.calcValue<typeof this.data.incomingDrain.type.base>(this.data.incomingDrain.type as GenericValueField);

        // Copy to get all values changed by user (override) but also remove all.
        this.data.modifiedDrain = foundry.utils.duplicate(this.data.incomingDrain);
        this.data.modifiedDrain.base = Helpers.calcTotal(this.data.incomingDrain, {min: 0});
        delete this.data.modifiedDrain.override;
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    override get success(): boolean {
        return this.data.modifiedDrain.value <= 0;
    }

    override get successLabel(): Translation {
        return 'SR6.TestResults.ResistedAllDamage';
    }

    override get failureLabel(): Translation {
        return 'SR6.TestResults.ResistedSomeDamage'
    }

    override async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedDrain = DrainRules.modifyDrainDamage(this.data.modifiedDrain, this.hits.value);

        console.log('Shadowrun 6e | Drain test modified drain:', this.data.modifiedDrain);

        // Ensure both drain damage objects have all required properties
        this._ensureDamageProperties(this.data.incomingDrain);
        this._ensureDamageProperties(this.data.modifiedDrain);

        // Debug the drain test data before processing results
        console.log('Shadowrun 6e | Drain test data before processing results:', {
            incomingDrain: this.data.incomingDrain,
            modifiedDrain: this.data.modifiedDrain
        });

        await super.processResults();

        // Debug the drain test data after processing results
        console.log('Shadowrun 6e | Drain test data after processing results:', {
            incomingDrain: this.data.incomingDrain,
            modifiedDrain: this.data.modifiedDrain
        });
    }
}
