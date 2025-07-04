import { PartsList } from '../../parts/PartsList';
import { RangedWeaponRules } from '../../rules/RangedWeaponRules';
import { InitiativePrep } from './functions/InitiativePrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { ItemPrep } from './functions/ItemPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { NPCPrep } from './functions/NPCPrep';
import { SR6ItemDataWrapper } from "../../data/SR6ItemDataWrapper";
import { Helpers } from '../../helpers';
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';

export class CharacterPrep {
    static prepareBaseData(system: Shadowrun.CharacterData) {
        CharacterPrep.addSpecialAttributes(system);
        SkillsPrep.prepareSkillData(system);

        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
        ModifiersPrep.clearValueMods(system);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * It shouldn't be modified by Active Effects, which instead should modify the global modifiers.
     *
     * @param system
     * @param items
     */
    static prepareDerivedData(system: Shadowrun.CharacterData, items: SR6ItemDataWrapper[]) {
        AttributesPrep.prepareAttributes(system);
        AttributesPrep.prepareEssence(system, items);

        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep.prepareNPCData(system);

        SkillsPrep.prepareSkills(system);

        ItemPrep.prepareArmor(system, items);
        ItemPrep.prepareWeapons(system, items);

        MatrixPrep.prepareMatrix(system, items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareMeatspaceInit(system);
        InitiativePrep.prepareAstralInit(system);
        InitiativePrep.prepareMatrixInit(system);
        InitiativePrep.prepareCurrentInitiative(system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);

        CharacterPrep.prepareDefenseRating(system);
    }

    /**
     * Prepare the current progressive recoil of an actor.
     *
     * @param system Physical humanoid system data.
     */
    static prepareRecoil(system: Shadowrun.CharacterData | Shadowrun.CritterData | Shadowrun.SpiritData | Shadowrun.VehicleData) {
        Helpers.calcTotal(system.values.recoil, { min: 0 });
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     *
     * @param system Character system data
     */
    static prepareRecoilCompensation(system: Shadowrun.CharacterData | Shadowrun.CritterData | Shadowrun.SpiritData) {
        const recoilCompensation = RangedWeaponRules.humanoidRecoilCompensationValue(system.attributes.strength.value);
        const baseRc = RangedWeaponRules.humanoidBaseRecoilCompensation();
        system.values.recoil_compensation.base = baseRc;
        PartsList.AddUniquePart(system.values.recoil_compensation.mod, 'SR6.RecoilCompensation', recoilCompensation);

        Helpers.calcTotal(system.values.recoil_compensation, { min: 0 });
    }

    static prepareMeleeAttackRating(system: Shadowrun.CharacterData) {
        const baseAttackRating: number = 0;
        let attackRating:number = 0;
        system.values.attack_rating.base = attackRating;
        //PartsList.AddUniquePart(system.values.attack_rating.mod, 'SR6.AttackRating', )
        Helpers.calcTotal(system.values.attack_rating, { min: 0 });
    }

    static addSpecialAttributes(system: Shadowrun.CharacterData) {
        const { attributes } = system;

        // This is necessary to support critter actor types.
        attributes.initiation = DataDefaults.attributeData({ base: system.magic.initiation, label: "SR6.Initiation", hidden: true });
        attributes.submersion = DataDefaults.attributeData({ base: system.technomancer.submersion, label: "F", hidden: true });
        //attributes.transhumanism = DataDefaults.attributeData({ base: system.transhuman.rank, label: "SR6.Transhumanism", hidden: true });
    }

    static prepareDefenseRating(system: Shadowrun.CharacterData) {
        const { attributes } = system;
        const { defense_rating } = system.armor;

        // console.log('Shadowrun 6e | Defense Rating Pre-Calculation:', {
        //     attributes,
        //     initialDefenseRating: foundry.utils.duplicate(defense_rating),
        //     bodyValue: attributes.body.value
        // });

        // Add body attribute as a modifier to defense rating
        PartsList.AddUniquePart(defense_rating.mod, 'SR6.AttrBody', attributes.body.value);

        // Recalculate total DR with all modifiers
        defense_rating.value = Helpers.calcTotal(defense_rating, {min: 0});

        // console.log('Shadowrun 6e | Defense Rating Post-Calculation:', {
        //     baseArmor: defense_rating.base,
        //     bodyMod: attributes.body.value,
        //     otherMods: defense_rating.mod,
        //     totalDR: defense_rating.value,
        //     calculation: `${defense_rating.base} (base armor) + ${attributes.body.value} (body) + ${defense_rating.mod.total || 0} (mods) = ${defense_rating.value}`
        // });
    }
}
