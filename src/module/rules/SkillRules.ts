import SkillField = Shadowrun.SkillField;
import {PartsList} from "../parts/PartsList";
import {SR6} from "../config";
import {SR} from "../constants";

export class SkillRules {

    /**
     * Determing if a skills value / level makes defaulting necessary.
     *
     * NOTE: A skill can be altered by an effect, which will leave it's base untouched.
     *       Therefore it's calculated value must be used as a level
     *
     * @param skill Any legacy or custom skill
     * @returns true, if a roll for the given skill must default.
     */
    static mustDefaultToRoll(skill: SkillField): boolean {
        return skill.value === 0;
    }
    /**
     * Allow defaulting a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be defaulted.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowDefaultingRoll(skill: SkillField): boolean {
        // Check for skill defaulting at the base, since modifiers or bonus can cause a positive pool, while
        // still defaulting.
        return skill.canDefault;
    }

    /**
     * Allow a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be rolled.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowRoll(skill: SkillField): boolean {
        return !SkillRules.mustDefaultToRoll(skill) || SkillRules.allowDefaultingRoll(skill);
    }

    /**
     * Add the defaulting modifier part to a parts list
     * @param parts Should be a PartsList involved with skills.
     */
    static addDefaultingPart(parts: PartsList<number>) {
        parts.addUniquePart('SR6.Defaulting', SkillRules.defaultingModifier);
    }

    /**
     * Get the level a specific skill without its attribute.
     * @param skill
     * @param options
     * @param options.specialization If true will add the default specialization bonus onto the level.
     */
    static level(skill: SkillField, options = {specialization: false}): number {
        if (this.mustDefaultToRoll(skill)) {
            return SkillRules.defaultingModifier;
        }

        // An attribute can have a NaN value if no value has been set yet. Do the skill for consistency.
        const skillValue = typeof skill.value === 'number' ? skill.value : 0;
        const specializationBonus = options.specialization ? SR.skill.SPECIALIZATION_MODIFIER : 0;

        return skillValue + specializationBonus;
    }

    static get defaultingModifier(): number {
        return SR.skill.DEFAULTING_MODIFIER;
    }

    static get SpecializationModifier(): number {
        return SR.skill.SPECIALIZATION_MODIFIER;
    }
}
