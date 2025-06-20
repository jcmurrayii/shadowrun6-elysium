import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import SpriteType = Shadowrun.SpriteType;
import { Helpers } from '../../helpers';
import { PartsList } from '../../parts/PartsList';
import SpriteData = Shadowrun.SpriteData;
import {SR6ItemDataWrapper} from "../../data/SR6ItemDataWrapper";


/**
 * Prepare a Sprite Type of Actor
 */
export class SpritePrep {
    static prepareBaseData(data: SpriteData) {
        SpritePrep.prepareSpriteSpecial(data);
        SkillsPrep.prepareSkillData(data);

        ModifiersPrep.prepareModifiers(data);
        ModifiersPrep.clearAttributeMods(data);
        ModifiersPrep.clearLimitMods(data);
    }

    static prepareDerivedData(data: SpriteData, items: SR6ItemDataWrapper[]) {
        SpritePrep.prepareSpriteMatrixAttributes(data);
        SpritePrep.prepareSpriteAttributes(data);
        SpritePrep.prepareSpriteSkills(data);

        AttributesPrep.prepareAttributes(data);
        SkillsPrep.prepareSkills(data);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

        SpritePrep.prepareSpriteConditionMonitor(data);
        SpritePrep.prepareSpriteInitiative(data);

        InitiativePrep.prepareCurrentInitiative(data);
    }

    static prepareSpriteSpecial(data: SpriteData) {
        // Sprites are always awakened
        data.special = 'resonance';
    }

    static prepareSpriteAttributes(data: SpriteData) {
        const {attributes, level, spriteType} = data;

        const overrides = this.getSpriteStatModifiers(spriteType);

        // calculate resonance value
        attributes.resonance.base = level + overrides.resonance;
        Helpers.calcTotal(attributes.resonance);
    }

    static prepareSpriteMatrixAttributes(data: SpriteData) {
        const {level, matrix, spriteType} = data;

        const matrixAtts = ['attack', 'sleaze', 'data_processing', 'firewall'];

        const overrides = this.getSpriteStatModifiers(spriteType);

        // apply the matrix overrides
        matrixAtts.forEach((att) => {
            if (matrix[att] !== undefined) {
                matrix[att].base = level + overrides[att];
                matrix[att].value = Helpers.calcTotal(matrix[att]);
            }
        });

        matrix.rating = level;
    }

    static prepareSpriteSkills(data: SpriteData) {
        const {skills, level, spriteType} = data;

        const overrides = this.getSpriteStatModifiers(spriteType);

        // apply skill levels
        // clear skills that we don't have
        for (const [skillId, skill] of Object.entries(skills.active)) {
            skill.base = overrides.skills.find((s) => s === skillId) ? level : 0;
        }
    }

    static prepareSpriteConditionMonitor(data: SpriteData) {
        const {matrix, level, modifiers} = data;

        matrix.condition_monitor.max = 8 + Math.ceil(level / 2) + Number(modifiers.matrix_track);
    }

    static prepareSpriteInitiative(data: SpriteData) {
        const {initiative, level, spriteType, modifiers} = data;

        // always in matrix perception
        initiative.perception = 'matrix';

        const overrides = this.getSpriteStatModifiers(spriteType);

        // setup initiative from overrides
        initiative.matrix.base.base = level * 2 + overrides.init;
        PartsList.AddUniquePart(initiative.matrix.base.mod, 'SR6.Bonus', modifiers['matrix_initiative']);
        Helpers.calcTotal(initiative.matrix.base, {min: 0});

        initiative.matrix.dice.base = 4;
        PartsList.AddUniquePart(initiative.matrix.dice.mod, 'SR6.Bonus', modifiers['matrix_initiative_dice']);
        Helpers.calcTotal(initiative.matrix.dice, {min: 0});
    }

    /**
     * Get the stat modifiers for the specified type of sprite
     * @param spriteType
     */
    static getSpriteStatModifiers(spriteType: SpriteType) {
        const overrides = {
            attack: 0,
            sleaze: 0,
            data_processing: 0,
            firewall: 0,
            resonance: 0,
            init: 0,
            // all sprites have computer
            skills: ['electronics'],
        };
        switch (spriteType) {
            case 'courier':
                overrides.sleaze = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('cracking');
                break;
            case 'crack':
                overrides.sleaze = 3;
                overrides.data_processing = 2;
                overrides.firewall = 1;
                overrides.init = 2;
                overrides.skills.push('cracking');
                break;
            case 'data':
                overrides.attack = -1;
                overrides.data_processing = 4;
                overrides.firewall = 1;
                overrides.init = 4;
                overrides.skills.push('cracking');
                break;
            case 'fault':
                overrides.attack = 3;
                overrides.data_processing = 1;
                overrides.firewall = 2;
                overrides.init = 1;
                overrides.skills.push('cracking');
                break;
            case 'machine':
                overrides.attack = 1;
                overrides.data_processing = 3;
                overrides.firewall = 2;
                overrides.init = 3;
                overrides.skills.push('cracking','electronics');
                break;
            case 'companion':
                overrides.attack = -1;
                overrides.sleaze = 1;
                overrides.firewall = 4;
                overrides.skills.push('cracking');
                break;
            case 'generalist':
                overrides.attack = 1;
                overrides.sleaze = 1;
                overrides.data_processing = 1;
                overrides.firewall = 1;
                overrides.init = 1;
                overrides.skills.push('cracking');
                break;
        }
        return overrides;
    }
}
