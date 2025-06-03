import { SkillsPrep } from './functions/SkillsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { Helpers } from '../../helpers';
import { PartsList } from "../../parts/PartsList";
import { SR6ItemDataWrapper } from "../../data/SR6ItemDataWrapper";
import { SkillFlow } from "../flows/SkillFlow";
import SpiritType = Shadowrun.SpiritType;
import SpiritData = Shadowrun.SpiritData;
import { CharacterPrep } from './CharacterPrep';
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';
import { SR6 } from '../../config';
import { SR } from '../../constants';


export class SpiritPrep {
    static prepareBaseData(system: SpiritData) {
        SpiritPrep.prepareSpiritSpecial(system);
        SkillsPrep.prepareSkillData(system);

        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
    }

    static prepareDerivedData(system: SpiritData, items: SR6ItemDataWrapper[]) {
        SpiritPrep.prepareSpiritBaseData(system);

        // Use spirit attribute range to avoid issues with attribute calculation causing unusable attributes.
        AttributesPrep.prepareAttributes(system, SR.attributes.rangesSpirit);
        SpiritPrep.prepareAttributesWithForce(system);
        SkillsPrep.prepareSkills(system);

        SpiritPrep.prepareSpiritArmor(system);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareCurrentInitiative(system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);
    }

    static prepareSpiritSpecial(data: SpiritData) {
        // Spirits will always be awakened.
        data.special = 'magic';
    }

    static prepareSpiritBaseData(data: SpiritData) {
        const overrides = this.getSpiritStatModifiers(data.spiritType);

        if (overrides) {
            const { attributes, skills, initiative, force, modifiers } = data;

            // set the base of attributes to the provided force
            for (const [attId, value] of Object.entries(overrides.attributes)) {
                if (attributes[attId] !== undefined) {
                    attributes[attId].base = value + force;
                }
            }

            // set the base of skills to the provided force
            for (const skillId of overrides.skills) {
                // Custom skills need to be created on the actor.
                const skill = SpiritPrep.prepareActiveSkill(skillId, skills.active);
                if (skill === undefined) continue;
                if (SkillFlow.isCustomSkill(skill)) continue

                skill.base = force;
                skills.active[skillId] = skill;
            }

            // prepare initiative data
            initiative.meatspace.base.base = force * 2 + overrides.init + Number(modifiers['astral_initiative']);
            initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR6.Bonus", Number(modifiers['meat_initiative']));
            initiative.meatspace.dice.base = 2;
            initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR6.Bonus", Number(modifiers['meat_initiative_dice']));

            initiative.astral.base.base = force * 2 + overrides.astral_init + Number(modifiers['astral_initiative_dice']);
            initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR6.Bonus", Number(modifiers['astral_initiative']));
            initiative.astral.dice.base = 3;
            initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR6.Bonus", Number(modifiers['astral_initiative_dice']));
        }
    }

    /**
     * Spirits can have some none default skills. The must be created first and don't count as custom skills.
     * @param skillId Whatever skill id should be used.
     * @param skills The list of active skills of the sprite.
     * @returns A prepared SkillField without levels.
     */
    static prepareActiveSkill(skillId: string, skills: Shadowrun.Skills): Shadowrun.SkillField {
        if (skills[skillId]) return skills[skillId];

        const label = SR6.activeSkills[skillId];
        const attribute = SR6.activeSkillAttribute[skillId];

        return DataDefaults.skillData({ label, attribute, canDefault: false })
    }

    static prepareSpiritArmor(data: SpiritData) {
        const { armor, attributes } = data;
        armor.base = (attributes.essence.value ?? 0) * 2;
        armor.value = Helpers.calcTotal(armor);
        armor.hardened = true;
    }

    /**
     * get the attribute and initiative modifiers and skills
     */
    static getSpiritStatModifiers(spiritType: SpiritType) {
        if (!spiritType) return;

        const overrides = {
            // value of 0 for attribute makes it equal to the Force
            attributes: {
                body: 0,
                agility: 0,
                reaction: 0,
                strength: 0,
                willpower: 0,
                logic: 0,
                intuition: 0,
                charisma: 0,
                magic: 0,
                essence: 0,
            },
            // modifiers for after the Force x 2 calculation
            init: 0,
            astral_init: 0,
            // skills are all set to Force
            skills: [] as string[],
        };
        switch (spiritType) {
            case 'air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('astral', 'perception', 'closecombat');
                break;
            case 'aircraft':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -2;
                overrides.skills.push('free_fall', 'navigation', 'perception', 'pilot', 'closecombat');
                break;
            case 'airwave':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('astral', 'con', 'perception', 'athletics', 'closecombat');
                break;
            case 'automotive':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 1;
                overrides.attributes.logic = -2;
                overrides.init = 1;
                overrides.skills.push('navigation', 'perception', 'pilot_ground_craft', 'athletics', 'closecombat');
                break;
            case 'beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'closecombat');
                break;
            case 'ceramic':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'energy':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'flight', 'perception', 'closecombat');
                break;
            case 'guardian':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 2;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'blades', 'clubs', 'counter_spelling', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'guidance':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.skills.push('arcana', 'assensing', 'astral_combat', 'counter_spelling', 'perception', 'closecombat');
                break;
            case 'man':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spellcasting', 'closecombat');
                break;
            case 'metal':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'plant':
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'exotic_range', 'closecombat');
                break;
            case 'ship':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -2;
                overrides.init = -1;
                overrides.skills.push('navigation', 'perception', 'pilot_water_craft', 'survival', 'swimming', 'closecombat');
                break;
            case 'task':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push('enchanting', 'assensing', 'astral_combat', 'perception', 'closecombat');
                break;
            case 'train':
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = -2;
                overrides.init = -1;
                overrides.skills.push('influence', 'navigation', 'perception', 'pilot_ground_craft', 'closecombat');
                break;
            case 'water':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;

            case 'toxic_air':
                overrides.attributes.body = -2;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = -3;
                overrides.init = 4;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'athletics', 'closecombat');
                break;
            case 'toxic_beasts':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.strength = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'gymnastics', 'perception', 'athletics', 'closecombat');
                break;
            case 'toxic_earth':
                overrides.attributes.body = 4;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.init = -1;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;
            case 'toxic_fire':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'flight', 'closecombat');
                break;
            case 'toxic_man':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'spell_casting', 'closecombat');
                break;
            case 'toxic_water':
                overrides.attributes.body = 1;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'exotic_range', 'perception', 'closecombat');
                break;

            case 'blood':
                overrides.attributes.body = 2;
                overrides.attributes.agility = 2;
                overrides.attributes.strength = 2;
                overrides.attributes.logic = -1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'athletics', 'closecombat');
                break;

            case 'muse':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'influence', 'perception', 'closecombat');
                break;
            case 'nightmare':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'influence', 'perception', 'closecombat');
                break;
            case 'shade':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'influence', 'perception', 'closecombat');
                break;
            case 'succubus':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'influence', 'perception', 'closecombat');
                break;
            case 'wraith':
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.attributes.willpower = 1;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'con', 'gymnastics', 'influence', 'perception', 'closecombat');
                break;

            case 'shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'closecombat');
                break;
            case 'master_shedim':
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'sorcery', 'perception', 'spellcasting', 'closecombat');
                break;

            // insect
            case 'caretaker':
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'leadership', 'perception', 'closecombat');
                break;
            case 'nymph':
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 1;
                overrides.init = 3;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'spellcasting', 'closecombat');
                break;
            case 'scout':
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'gymnastics', 'sneaking', 'closecombat');
                break;
            case 'soldier':
                overrides.attributes.body = 3;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = 3;
                overrides.init = 1;
                overrides.skills.push('assensing', 'astral_combat', 'sorcery', 'exotic_range', 'gymnastics', 'perception', 'closecombat');
                break;
            case 'worker':
                overrides.attributes.strength = 1;
                overrides.skills.push('assensing', 'astral_combat', 'perception', 'closecombat');
                break;
            case 'queen':
                overrides.attributes.body = 5;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = 5;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = 1;
                overrides.attributes.intuition = 1;
                overrides.init = 5;
                overrides.skills.push(
                    'assensing',
                    'astral_combat',
                    'con',
                    'sorcery',
                    'gymnastics',
                    'leadership',
                    'influence',
                    'perception',
                    'spellcasting',
                    'closecombat',
                );
                break;
            case "carcass":
                overrides.attributes.body = 3;
                overrides.attributes.strength = 2;
                overrides.attributes.charisma = -1;
                overrides.skills.push("astral", "perception", "closecombat");
                break;
            case "corpse":
                overrides.attributes.body = 2;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = -1;
                overrides.init = 2;
                overrides.skills.push("astral", "perception", "closecombat");
                break;
            case "rot":
                overrides.attributes.body = 3;
                overrides.attributes.agility = -2;
                overrides.attributes.strength = 1;
                overrides.attributes.logic = -1;
                overrides.attributes.charisma = -1;
                overrides.skills.push("astral", "sorcery", "exotic_range", "perception", "closecombat");
                break;
            case "palefile":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = -1;
                overrides.init = 3;
                overrides.skills.push("astral", "exotic_range", "flight", "perception", "closecombat");
                break;
            case "detritus":
                overrides.attributes.body = 5;
                overrides.attributes.agility = -3;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 4;
                overrides.attributes.logic = -1;
                overrides.attributes.charisma = -1;
                overrides.init = -1;
                overrides.skills.push("astral", "exotic_range", "perception", "closecombat");
                break;

            // Howling Shadow
            case "anarch":
                overrides.attributes.body = -1;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = -1;
                overrides.init = 1;
                overrides.skills.push("astral", "automatics", "blades", "clubs", "con", "demolitions", "disguise", "forgery", "gymnastics", "impersonation", "locksmith", "palming", "perception", "pistols", "sneaking", "throwing_weapons", "closecombat");
                break;

            case "arboreal":
                overrides.attributes.body = +2;
                overrides.attributes.strength = 1;
                overrides.attributes.essence = -2;
                overrides.skills.push("astral", "closecombat", "exotic_range", "perception");
                break;

            case "blackjack":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 1;
                overrides.init = 1;
                overrides.skills.push("astral", "automatics", "closecombat", "computer", "biotech", "athletics", "influence", "locksmith", "longarms", "perception", "pilot_ground_craft", "pistols", "sneaking", "throwing_weapons", "closecombat");
                break;

            case "boggle":
                overrides.attributes.body = -2;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = 2;
                overrides.init = -1;
                overrides.skills.push("astral", "closecombat", "athletics", "perception");
                break;

            case "bugul":
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = 1;
                overrides.attributes.logic = 2;
                overrides.skills.push("enchanting", "astral", "con", "sorcery", "enchanting", "athletics", "influence", "perception", "closecombat");
                break;

            case "chindi":
                overrides.attributes.body = 2;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 1;
                overrides.init = 2;
                overrides.skills.push("archery", "closecombat", "biotech", "athletics", "influence", "perception", "stealth", "throwing_weapons", "closecombat");
                break;

            // HS#119: This spirit types has fixed values that don't use general spirit rules...
            case "corpselight":
                break;

            case "croki":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("artificing", "astral", "athletics", "perception", "sorcery");
                break;

            case "duende":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("astral", "con", "athletics", "perception");
                break;

            case "elvar":
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 2;
                overrides.init = 2;
                overrides.skills.push("astral", "con", "sorcery", "enchanting", "athletics", "perception", "sorcery");
                break;

            case "erinyes":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 3;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("astral", "flight", "athletics", "perception", "stealth", "closecombat");
                break;

            case "greenman":
                overrides.attributes.body = 3;
                overrides.attributes.agility = -1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 4;
                overrides.init = 2;
                overrides.skills.push("astral", "sorcery", "athletics", "influence", "perception", "closecombat");
                break;

            case "imp":
                overrides.attributes.reaction = 3;
                overrides.init = 3;
                overrides.skills.push("alchemy", "astral", "con", "sorcery", "enchanting", "athletics", "influence", "perception", "sorcery", "closecombat");
                break;

            case "jarl":
                overrides.attributes.body = 2;
                overrides.attributes.agility = -2;
                overrides.attributes.reaction = 3;
                overrides.attributes.strength = 2;
                overrides.init = 4;
                overrides.skills.push("astral", "sorcery", "athletics", "influence", "perception", "closecombat");
                break;

            case "kappa":
                overrides.attributes.body = 5;
                overrides.attributes.reaction = -1;
                overrides.attributes.strength = 1;
                overrides.attributes.essence = -2;
                overrides.init = -1;
                overrides.skills.push("astral", "exotic_range", "athletics", "perception", "closecombat");
                break;

            case "kokopelli":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 2;
                overrides.attributes.reaction = 2;
                overrides.init = 2;
                overrides.skills.push("enchanting", "astral", "influence", "perception", "closecombat");
                break;

            case "morbi":
                overrides.attributes.reaction = 1;
                overrides.attributes.strength = -2;
                overrides.attributes.intuition = 1;
                overrides.attributes.charisma = 2;
                overrides.init = 2;
                overrides.skills.push("astral", "perception", "sorcery", "stealth", "closecombat");
                break;

            case "nocnitasa":
                overrides.attributes.body = -3;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 5;
                overrides.attributes.strength = -2;
                overrides.attributes.willpower = -1;
                overrides.init = 5;
                overrides.skills.push("astral", "perception", "stealth", "closecombat");
                break;

            case "phantom":
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.init = 2;
                overrides.skills.push("astral", "athletics", "perception", "closecombat");
                break;

            case "preta":
                overrides.attributes.body = -1;
                overrides.attributes.agility = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -1;
                overrides.init = 2;
                overrides.skills.push("astral", "influence", "influence", "perception", "stealth", "closecombat");
                break;

            case "stabber":
                overrides.attributes.body = 1;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = 4;
                overrides.init = 2;
                overrides.skills.push("astral", "athletics", "perception", "closecombat");
                break;

            case "tungak":
                overrides.attributes.body = 1;
                overrides.attributes.reaction = 2;
                overrides.attributes.strength = -2;
                overrides.init = 2;
                overrides.skills.push("astral", "athletics", "perception", "closecombat");
                break;

            case "vucub":
                overrides.attributes.body = 3;
                overrides.attributes.agility = 4;
                overrides.attributes.reaction = 4;
                overrides.attributes.strength = 2;
                overrides.attributes.intuition = 2;
                overrides.attributes.charisma = 4;
                overrides.init = 5;
                overrides.skills.push("astral", "flight", "perception", "closecombat");
                break;

        }

        return overrides;
    }

    /**
     * The spirits force value is used for the force attribute value.
     *
     * NOTE: This separation is mainly a legacy concern. Attributes are available as testable (and modifiable values)
     *       flat values like force aren't. For this reason the flat value is transformed to an attribute.
     *
     * @param system The spirit system data to prepare
     */
    static prepareAttributesWithForce(system: Shadowrun.SpiritData) {
        const { attributes, force } = system;

        // Allow value to be understandable when displayed.
        attributes.force.base = 0;
        PartsList.AddUniquePart(attributes.force.mod, 'SR6.Force', force);
        AttributesPrep.calculateAttribute('force', attributes.force);
    }
}
