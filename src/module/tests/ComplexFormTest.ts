import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {ComplexFormRules} from "../rules/ComplexFormRules";
import {PartsList} from "../parts/PartsList";
import {FadeRules} from "../rules/FadeRules";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;
export interface ComplexFormTestData extends SuccessTestData {
    level: number
    fade: number

    fadeDamage: DamageData
}

/**
 * Handles threading complex forms as described on SR5#251.
 */
export class ComplexFormTest extends SuccessTest<ComplexFormTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        // Restore previous values or set defaults.
        data.level =  data.level || 0;
        data.fade = data.face || 0;
        data.fadeDamage = data.fadeDamage || DataDefaults.damageData();

        return data;
    }

    override get _dialogTemplate()  {
        return 'systems/sr6elysium/dist/templates/apps/dialogs/complexform-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/sr6elysium/dist/templates/rolls/complexform-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            skill: 'software',
            attribute: 'resonance'
        };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['complex_form'];
    }

    // TODO: Add missing modifiers (gitter) // SR5#251
    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds'];
    }

    override async prepareDocumentData() {
        this.prepareInitialLevelValue();
        await super.prepareDocumentData();
    }

    /**
     * Set a level value based on the items history or viable suggestions.
     */
    prepareInitialLevelValue() {
        if (!this.item) return;

        const lastUsedLevel = this.item.getLastComplexFormLevel();
        const suggestedLevel = ComplexFormRules.calculateMinimalLevel(this.item.getFade());
        this.data.level = lastUsedLevel.value || suggestedLevel;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLevelValue();
        this.prepareLimitValue();
    }

    /**
     * Assert user input doesn't create unusable level values.
     */
    prepareLevelValue() {
        this.data.level = ComplexFormRules.calculateLevel(this.data.level);
    }

    /**
     * Derive limit value based on complex form rules.
     */
    prepareLimitValue() {
        const level = Number(this.data.level);
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR6.Level',
            ComplexFormRules.calculateLimit(level)
        )
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateFadeValue();
    }

    calculateFadeValue() {
        const level = Number(this.data.level);
        const fade = Number(this.item?.getFade() || 0);
        this.data.fade = ComplexFormRules.calculateFade(level, fade);
    }

    calculateFadeDamage() {
        if (!this.actor) return DataDefaults.valueData();

        const fade = Number(this.data.fade);
        const resonance = this.actor.getAttribute('resonance').value;

        this.data.fadeDamage = FadeRules.calcFadeDamage(fade, this.hits.value, resonance);
    }

    override async processResults() {
        this.calculateFadeDamage();

        await super.processResults();
    }

    override async afterTestComplete() {
        await this.saveLastUsedLevel();

        await super.afterTestComplete();
    }

    /**
     * Allow the currently used level value for this complex form item to be reused next time.
     */
    async saveLastUsedLevel() {
        if (!this.item) return;

        await this.item.setLastComplexFormLevel({value: this.data.level});
    }
}
