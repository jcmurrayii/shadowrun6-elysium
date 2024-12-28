export const preloadHandlebarsTemplates = async () => {
    const templatePaths = [
        // actor tabs
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/ActionsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/BioTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/MagicTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/MatrixTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/MiscTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/SkillsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/SocialTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/SpellsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/EffectsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/CritterPowersTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/NetworkTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/InventoryTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/DescriptionTab.html',

        'systems/shadowrun6-elysium/dist/templates/actor/tabs/spirit/SpiritSkillsTab.html',

        'systems/shadowrun6-elysium/dist/templates/actor/tabs/matrix/SpriteSkillsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/matrix/SpritePowersTab.html',

        'systems/shadowrun6-elysium/dist/templates/actor/tabs/vehicle/VehicleSkillsTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/vehicle/VehicleMatrixTab.html',

        'systems/shadowrun6-elysium/dist/templates/actor/tabs/ic/ICActorTab.html',
        'systems/shadowrun6-elysium/dist/templates/actor/tabs/ic/ICMiscTab.html',

        // uncategorized lists
        'systems/shadowrun6-elysium/dist/templates/actor/parts/Initiative.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ToggleImportFlags.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/import_flag_button.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/Movement.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ProfileImage.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/NameInput.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ActionList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ContactList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/SinAndLifestyleList.html',

        // magic
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/AdeptPowerList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/MetamagicList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/RitualList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/SpellList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/SummoningList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/magic/SpiritOptions.html',

        // matrix
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/ProgramList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/EchoList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/ComplexFormList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/CompilationList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/MatrixAttribute.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/SpritePowerList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/DeviceRating.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/matrix/Marks.html',

        // attributes
        'systems/shadowrun6-elysium/dist/templates/actor/parts/attributes/Attribute.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/attributes/FakeAttribute.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/attributes/AttributeList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/attributes/SpecialAttributeList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/attributes/Limits.html',

        // skills
        'systems/shadowrun6-elysium/dist/templates/actor/parts/skills/ActiveSkillList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/skills/LanguageAndKnowledgeSkillList.html',

        // vehicle
        'systems/shadowrun6-elysium/dist/templates/actor/parts/vehicle/VehicleStatsList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/vehicle/VehicleSecondStatsList.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/vehicle/VehicleMovement.html',

        // IC
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ic/ICStats.html',
        'systems/shadowrun6-elysium/dist/templates/actor/parts/ic/ICConfiguration.html',

        // limited actor
        'systems/shadowrun6-elysium/dist/templates/actor-limited/character.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/spirit.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/sprite.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/vehicle.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/critter.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/Header.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscCharacter.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscSpirit.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscSprite.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscIc.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscVehicle.html',
        'systems/shadowrun6-elysium/dist/templates/actor-limited/parts/MiscCritter.html',


        'systems/shadowrun6-elysium/dist/templates/item/parts/description.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/technology.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/header.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/weapon-ammo-list.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/weapon-mods-list.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/action.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/action_results.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/modifier.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/damage.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/opposed.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/spell.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/complex_form.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/weapon.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/armor.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/matrix.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/sin.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/contact.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/lifestyle.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/ammo.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/modification.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/program.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/critter_power.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/summoning.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/compilation.html',
        'systems/shadowrun6-elysium/dist/templates/item/parts/ritual.html',

        'systems/shadowrun6-elysium/dist/templates/rolls/parts/parts-list.html',
        'systems/shadowrun6-elysium/dist/templates/rolls/parts/Damage.html',

        // to wrap the bodies of tabs
        'systems/shadowrun6-elysium/dist/templates/common/TabWrapper.html',
        'systems/shadowrun6-elysium/dist/templates/common/ValueInput.html',

        // Useful wrapper and implemented components
        'systems/shadowrun6-elysium/dist/templates/common/ValueMaxAttribute.html',
        'systems/shadowrun6-elysium/dist/templates/common/Attribute.html',
        'systems/shadowrun6-elysium/dist/templates/common/ValueModifiers.html',

        // useful select template for the common pattern
        'systems/shadowrun6-elysium/dist/templates/common/Select.html',

        // to create the condition monitors and edge counter
        'systems/shadowrun6-elysium/dist/templates/common/HorizontalCellInput.html',

        // looks like a ListHeader
        'systems/shadowrun6-elysium/dist/templates/common/HeaderBlock.html',

        'systems/shadowrun6-elysium/dist/templates/common/NameLineBlock.html',

        // list components
        'systems/shadowrun6-elysium/dist/templates/common/List/ListItem.html',
        'systems/shadowrun6-elysium/dist/templates/common/List/ListEntityItem.html',
        'systems/shadowrun6-elysium/dist/templates/common/List/ListHeader.html',

        // dialogs
        'systems/shadowrun6-elysium/dist/templates/apps/dialogs/damage-application.html',
        'systems/shadowrun6-elysium/dist/templates/apps/dialogs/parts/success-test-common.html',
        'systems/shadowrun6-elysium/dist/templates/apps/dialogs/parts/success-test-documents.html',
        'systems/shadowrun6-elysium/dist/templates/apps/dialogs/parts/attack-range-dialog-fragment.html',

        // Test chat messages and their parts
        'systems/shadowrun6-elysium/dist/templates/rolls/success-test-message.html',
        'systems/shadowrun6-elysium/dist/templates/rolls/parts/rolled-dice.html',

        // Modifier management parts
        'systems/shadowrun6-elysium/dist/templates/apps/partials/modifiers-physical.hbs'
    ];

    return loadTemplates(templatePaths);
};
