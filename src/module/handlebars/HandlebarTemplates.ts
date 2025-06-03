export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        // actor tabs
        'systems/sr6elysium/dist/templates/actor/tabs/ActionsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/BioTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/MagicTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/MatrixTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/MiscTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/SkillsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/SocialTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/SpellsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/EffectsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/CritterPowersTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/NetworkTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/InventoryTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/DescriptionTab.html',

        'systems/sr6elysium/dist/templates/actor/tabs/spirit/SpiritSkillsTab.html',

        'systems/sr6elysium/dist/templates/actor/tabs/matrix/SpriteSkillsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/matrix/SpritePowersTab.html',

        'systems/sr6elysium/dist/templates/actor/tabs/vehicle/VehicleSkillsTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/vehicle/VehicleMatrixTab.html',

        'systems/sr6elysium/dist/templates/actor/tabs/ic/ICActorTab.html',
        'systems/sr6elysium/dist/templates/actor/tabs/ic/ICMiscTab.html',

        // uncategorized lists
        'systems/sr6elysium/dist/templates/actor/parts/Initiative.html',
        'systems/sr6elysium/dist/templates/actor/parts/ToggleImportFlags.html',
        'systems/sr6elysium/dist/templates/item/parts/import_flag_button.html',
        'systems/sr6elysium/dist/templates/actor/parts/Movement.html',
        'systems/sr6elysium/dist/templates/actor/parts/ProfileImage.html',
        'systems/sr6elysium/dist/templates/actor/parts/NameInput.html',
        'systems/sr6elysium/dist/templates/actor/parts/ActionList.html',
        'systems/sr6elysium/dist/templates/actor/parts/ContactList.html',
        'systems/sr6elysium/dist/templates/actor/parts/SinAndLifestyleList.html',

        // magic
        'systems/sr6elysium/dist/templates/actor/parts/magic/AdeptPowerList.html',
        'systems/sr6elysium/dist/templates/actor/parts/magic/MetamagicList.html',
        'systems/sr6elysium/dist/templates/actor/parts/magic/RitualList.html',
        'systems/sr6elysium/dist/templates/actor/parts/magic/SpellList.html',
        'systems/sr6elysium/dist/templates/actor/parts/magic/SummoningList.html',
        'systems/sr6elysium/dist/templates/actor/parts/magic/SpiritOptions.html',

        // matrix
        'systems/sr6elysium/dist/templates/actor/parts/matrix/ProgramList.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/EchoList.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/ComplexFormList.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/CompilationList.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/MatrixAttribute.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/SpritePowerList.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/DeviceRating.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/Marks.html',
        'systems/sr6elysium/dist/templates/actor/parts/matrix/MatrixActionList.html',

        // attributes
        'systems/sr6elysium/dist/templates/actor/parts/attributes/Attribute.html',
        'systems/sr6elysium/dist/templates/actor/parts/attributes/FakeAttribute.html',
        'systems/sr6elysium/dist/templates/actor/parts/attributes/AttributeList.html',
        'systems/sr6elysium/dist/templates/actor/parts/attributes/SpecialAttributeList.html',
        'systems/sr6elysium/dist/templates/actor/parts/attributes/Limits.html',

        // skills
        'systems/sr6elysium/dist/templates/actor/parts/skills/ActiveSkillList.html',
        'systems/sr6elysium/dist/templates/actor/parts/skills/LanguageAndKnowledgeSkillList.html',

        // vehicle
        'systems/sr6elysium/dist/templates/actor/parts/vehicle/VehicleStatsList.html',
        'systems/sr6elysium/dist/templates/actor/parts/vehicle/VehicleSecondStatsList.html',
        'systems/sr6elysium/dist/templates/actor/parts/vehicle/VehicleMovement.html',

        // IC
        'systems/sr6elysium/dist/templates/actor/parts/ic/ICStats.html',
        'systems/sr6elysium/dist/templates/actor/parts/ic/ICConfiguration.html',

        // limited actor
        'systems/sr6elysium/dist/templates/actor-limited/character.html',
        'systems/sr6elysium/dist/templates/actor-limited/spirit.html',
        'systems/sr6elysium/dist/templates/actor-limited/sprite.html',
        'systems/sr6elysium/dist/templates/actor-limited/vehicle.html',
        'systems/sr6elysium/dist/templates/actor-limited/critter.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/Header.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscCharacter.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscSpirit.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscSprite.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscIc.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscVehicle.html',
        'systems/sr6elysium/dist/templates/actor-limited/parts/MiscCritter.html',


        'systems/sr6elysium/dist/templates/item/parts/description.html',
        'systems/sr6elysium/dist/templates/item/parts/technology.html',
        'systems/sr6elysium/dist/templates/item/parts/header.html',
        'systems/sr6elysium/dist/templates/item/parts/weapon-ammo-list.html',
        'systems/sr6elysium/dist/templates/item/parts/weapon-mods-list.html',
        'systems/sr6elysium/dist/templates/item/parts/action.html',
        'systems/sr6elysium/dist/templates/item/parts/action_results.html',
        'systems/sr6elysium/dist/templates/item/parts/modifier.html',
        'systems/sr6elysium/dist/templates/item/parts/damage.html',
        'systems/sr6elysium/dist/templates/item/parts/opposed.html',
        'systems/sr6elysium/dist/templates/item/parts/spell.html',
        'systems/sr6elysium/dist/templates/item/parts/complex_form.html',
        'systems/sr6elysium/dist/templates/item/parts/weapon.html',
        'systems/sr6elysium/dist/templates/item/parts/armor.html',
        'systems/sr6elysium/dist/templates/item/parts/matrix.html',
        'systems/sr6elysium/dist/templates/item/parts/sin.html',
        'systems/sr6elysium/dist/templates/item/parts/contact.html',
        'systems/sr6elysium/dist/templates/item/parts/lifestyle.html',
        'systems/sr6elysium/dist/templates/item/parts/ammo.html',
        'systems/sr6elysium/dist/templates/item/parts/modification.html',
        'systems/sr6elysium/dist/templates/item/parts/program.html',
        'systems/sr6elysium/dist/templates/item/parts/critter_power.html',
        'systems/sr6elysium/dist/templates/item/parts/summoning.html',
        'systems/sr6elysium/dist/templates/item/parts/compilation.html',
        'systems/sr6elysium/dist/templates/item/parts/ritual.html',

        'systems/sr6elysium/dist/templates/rolls/parts/parts-list.html',
        'systems/sr6elysium/dist/templates/rolls/parts/Damage.html',

        // to wrap the bodies of tabs
        'systems/sr6elysium/dist/templates/common/TabWrapper.html',
        'systems/sr6elysium/dist/templates/common/ValueInput.html',

        // Useful wrapper and implemented components
        'systems/sr6elysium/dist/templates/common/ValueMaxAttribute.html',
        'systems/sr6elysium/dist/templates/common/Attribute.html',
        'systems/sr6elysium/dist/templates/common/ValueModifiers.html',

        // useful select template for the common pattern
        'systems/sr6elysium/dist/templates/common/Select.html',

        // to create the condition monitors and edge counter
        'systems/sr6elysium/dist/templates/common/HorizontalCellInput.html',

        // looks like a ListHeader
        'systems/sr6elysium/dist/templates/common/HeaderBlock.html',

        'systems/sr6elysium/dist/templates/common/NameLineBlock.html',

        // list components
        'systems/sr6elysium/dist/templates/common/List/ListItem.html',
        'systems/sr6elysium/dist/templates/common/List/ListEntityItem.html',
        'systems/sr6elysium/dist/templates/common/List/ListHeader.html',

        // dialogs
        'systems/sr6elysium/dist/templates/apps/dialogs/damage-application.html',
        'systems/sr6elysium/dist/templates/apps/dialogs/parts/success-test-common.html',
        'systems/sr6elysium/dist/templates/apps/dialogs/parts/success-test-documents.html',
        'systems/sr6elysium/dist/templates/apps/dialogs/parts/attack-range-dialog-fragment.html',

        // Test chat messages and their parts
        'systems/sr6elysium/dist/templates/rolls/success-test-message.html',
        'systems/sr6elysium/dist/templates/rolls/parts/rolled-dice.html',

        // Modifier management parts
        'systems/sr6elysium/dist/templates/apps/partials/modifiers-physical.hbs'
    ];

    return loadTemplates(templatePaths);
};
