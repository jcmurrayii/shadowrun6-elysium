import { SR6Item } from "../SR6Item";
import { SR6 } from '../../config';

/**
 * Handling of SR6Item.update changes around ActionRollData.
 */
export const UpdateActionFlow = {
    /**
     * Alter action data changes on update.
     *
     * @param changeData The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    onUpdateAlterActionData(changeData: DeepPartial<Shadowrun.ShadowrunItemData>, item: SR6Item) {
        UpdateActionFlow.onSkillUpdateAlterAttribute(changeData, item);
        UpdateActionFlow.onSkillUpdateAlterAttribute2(changeData, item);
    },

    /**
     * If a skill is selected, try to autofill the connect attribute of it.
     *
     * This differs for items on actors, as here we can access actual skill data.
     * For item outside of actors we can only use default values.
     * @param changeData  The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    onSkillUpdateAlterAttribute(changeData: DeepPartial<Shadowrun.ShadowrunItemData>, item: SR6Item) {
        // Only change to connected attribute when no attribute has already been chosen.
        if (item.system.action?.attribute !== '') return;
        const skillIdOrLabel = foundry.utils.getProperty(changeData, 'system.action.skill');
        if (skillIdOrLabel === undefined || skillIdOrLabel === '') return;

        // CASE - Sidebar item not owned by actor.
        if (item.actor === null) {
            const skill = game.model.Actor.character.skills.active[skillIdOrLabel];
            if (skill === undefined) return;

            changeData['system.action.attribute'] = skill.attribute;

        // CASE - Owned Item on actor.
        } else {
            // Support both legacy and custom skills.
            const skill = item.actor.getSkill(skillIdOrLabel) ?? item.actor.getSkillByLabel(skillIdOrLabel);
            if (skill === undefined) return;

            changeData['system.action.attribute'] = skill.attribute;
        }
    },

    /**
     * When a skill is changed, remove the second attribute, as it's not needed and might cause confusion
     * at different places.
     *
     * @param changeData The _update changes given by the event
     * @param item The item as context of what's being changed.
     */
    onSkillUpdateAlterAttribute2(changeData: DeepPartial<Shadowrun.ShadowrunItemData>, item: SR6Item) {
        if (!foundry.utils.getProperty(changeData, 'system.action.skill')) return;

        changeData['system.action.attribute2'] = '';
    },

    /**
     * Inject action test data into any item
     *
     * This method is designed to be called on _preCreate/_preUpdate/_preCreateEmbeddedDocuments
     *
     * Make sure to not mix up changeData and itemData
     *
     * Depending on the caller whatever was applied to the applyData parameter must be handled differently.
     * When called by _onCreate, it must be used as updateData using Document#update
     * When called by _preUpdate, it must be applied directly to changeData
     * When called before any DocumentData as been created, it can be applied directly to the source object before Document#create
     *
     * @param type The item type where operating on
     * @param changeData The changeData (partial or complete) that's been transmitted.
     * @param applyData An object to carry the altering data changes
     * @param item Optional item reference. This can't be given during the Chummer Item Import flow.
     */
    injectActionTestsIntoChangeData(type: string, changeData: Partial<Shadowrun.ShadowrunItemData>, applyData, item?: SR6Item) {
        if (!changeData) return;

        const typeHandler = {
            'weapon': UpdateActionFlow.injectWeaponTestIntoChangeData,
            'spell': UpdateActionFlow.injectSpellTestIntoChangeData,
            'complex_form': UpdateActionFlow.injectComplexFormTestIntoChangeData,
            'call_in_action': UpdateActionFlow.injectCallInActionTestIntoChangeData
        };

        const handler = typeHandler[type];
        if (!handler) return;

        handler(type, changeData, applyData, item);
    },


    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectWeaponTestIntoChangeData(type: string, changeData: Partial<Shadowrun.WeaponItemData>, applyData) {
        // Abort when category isn't part of this change.
        if (changeData?.system?.category === undefined) return;

        // Remove test when user selects empty category.
        if (changeData.system.category === '') {
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            return;
        }

        const test = SR6.weaponCategoryActiveTests[changeData.system.category];
        if (!test) {
            console.error(`Shadowrun 5 | There is no active test configured for the weapon category ${changeData.system.category}.`, changeData);
        }

        foundry.utils.setProperty(applyData, 'system.action.test', test);
        foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'PhysicalDefenseTest');
        foundry.utils.setProperty(applyData, 'system.action.opposed.resist.test', 'PhysicalResistTest');
    },

    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectSpellTestIntoChangeData(type: string, changeData: Partial<Shadowrun.SpellItemData>, applyData) {

        // Abort when category isn't part of this change.
        if (changeData?.system?.category === undefined) return;

        // Remove test when user selects empty category.
        if (changeData.system.category === '') {
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            return;
        }
        console.log(changeData);


        // Based on category switch out active, opposed and resist test.
        const test = SR6.activeTests[type];
        const opposedTest = SR6.opposedTests[type][changeData.system.category] || 'OpposedTest';
        const resistTest = SR6.opposedResistTests[type][changeData.system.category] || '';
        const drainTest = SR6.followedTests[test] ?? '';

        foundry.utils.setProperty(applyData, 'system.action.test', test);
        foundry.utils.setProperty(applyData, 'system.action.opposed.test', opposedTest);
        foundry.utils.setProperty(applyData, 'system.action.opposed.resist.test', resistTest);
        foundry.utils.setProperty(applyData, 'system.action.followed.test', drainTest);
        console.log(applyData);
    },

    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectComplexFormTestIntoChangeData(type: string, changeData: Partial<Shadowrun.SpellItemData>, applyData) {
        const test = SR6.activeTests[type];

        foundry.utils.setProperty(applyData, 'system.action.test', test);
    },


    /**
     * See injectActionTestsIntoChangeData for documentation.
     */
    injectCallInActionTestIntoChangeData(type: string, changeData: DeepPartial<Shadowrun.CallInActionItemData>, applyData) {
        if (changeData.system?.actor_type === undefined) return;

        if (changeData.system.actor_type === 'spirit') {
            // Reconfigure to summoning tests workflow.
            foundry.utils.setProperty(applyData, 'system.action.test', 'SummonSpiritTest');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'OpposedSummonSpiritTest');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', 'DrainTest');
        }
        if (changeData.system.actor_type === 'sprite') {
            // Reconfigure to compilation tests workflow.
            foundry.utils.setProperty(applyData, 'system.action.test', 'CompileSpriteTest');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', 'OpposedCompileSpriteTest');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', 'FadeTest');
        }
        if (changeData.system.actor_type.length === 0) {
            // Reset to prohibit testing.
            foundry.utils.setProperty(applyData, 'system.action.test', '');
            foundry.utils.setProperty(applyData, 'system.action.opposed.test', '');
            foundry.utils.setProperty(applyData, 'system.action.followed.test', '');
        }
    }
}
