import MagicActorData = Shadowrun.MagicActorData;
import MatrixActorData = Shadowrun.MatrixActorData;
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class InitiativePrep {
    /**
     * Current initiative is the selected initiative to be used within FoundryVTT Combat.
     *
     */
    static prepareCurrentInitiative(system: ActorTypesData) {
        const { initiative } = system;

        if (initiative.perception === 'matrix') initiative.current = initiative.matrix;
        else if (initiative.perception === 'astral') initiative.current = initiative.astral;
        else {
            initiative.current = initiative.meatspace;
            initiative.perception = 'meatspace';
        }

        // Recalculate selected initiative to be sure.
        initiative.current.base.value = Helpers.calcTotal(initiative.current.base);

        // Apply edge ini rules.
        initiative.current.dice.value = Helpers.calcTotal(initiative.current.dice, {min: 0, max: 5});
        if (initiative.edge) initiative.current.dice.value = 5;
        initiative.current.dice.value = Math.min(5, initiative.current.dice.value); // maximum of 5d6 for initiative
        initiative.current.dice.text = `${initiative.current.dice.value}d6`;

        // Calculate available actions based on initiative dice
        InitiativePrep.calculateAvailableActions(initiative);
    }

    /**
     * Calculate available actions based on initiative dice
     * Every character starts with one major and one minor action
     * They gain an additional minor action for each die in their initiative roll
     */
    static calculateAvailableActions(initiative: Shadowrun.Initiative) {
        // Initialize actions if not already present
        if (!initiative.actions) {
            initiative.actions = {
                major: 1,
                minor: 1,
                free: 1
            };
        }

        // Only calculate actions if they haven't been initialized yet
        // This allows the resetActions method to take precedence
        // We check if the actions object exists but is empty (undefined values)
        if (initiative.actions.major === undefined || initiative.actions.minor === undefined || initiative.actions.free === undefined) {
            // Every character starts with one major and one minor action
            initiative.actions.major = 1;

            // They gain an additional minor action for each die in their initiative roll
            // Start with 1 minor action and add one for each initiative die
            initiative.actions.minor = 1 + initiative.current.dice.value;

            // Free actions are unlimited
            initiative.actions.free = '∞';

            console.log(`Shadowrun 6e | Initialized actions for character: Major: ${initiative.actions.major}, Minor: ${initiative.actions.minor}, Free: ${initiative.actions.free}`);
        }
    }

    /**
     * Physical initiative
     */
    static prepareMeatspaceInit(system: ActorTypesData) {
        const { initiative, attributes, modifiers } = system;

        initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
        initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR6.Bonus", Number(modifiers['meat_initiative']));
        initiative.meatspace.base.value = Helpers.calcTotal(initiative.meatspace.base);

        initiative.meatspace.dice.base = 1;
        initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR6.Bonus", Number(modifiers['meat_initiative_dice']));
        initiative.meatspace.dice.value = Helpers.calcTotal(initiative.meatspace.dice, {min: 0, max: 5});
    }

    static prepareAstralInit(system: ActorTypesData & MagicActorData) {
        const { initiative, attributes, modifiers } = system;

        initiative.astral.base.base = attributes.intuition.value * 2;
        initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR6.Bonus", Number(modifiers['astral_initiative']));
        initiative.astral.base.value = Helpers.calcTotal(initiative.astral.base);

        initiative.astral.dice.base = 2;
        initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR6.Bonus", Number(modifiers['astral_initiative_dice']));
        initiative.astral.dice.value = Helpers.calcTotal(initiative.astral.dice, {min: 0, max: 5});
    }

    static prepareMatrixInit(system: ActorTypesData & MatrixActorData) {
        const { initiative, attributes, modifiers, matrix } = system;
        if (matrix) {

            initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
            initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR6.Bonus", Number(modifiers['matrix_initiative']));
            initiative.matrix.base.value = Helpers.calcTotal(initiative.matrix.base);

            initiative.matrix.dice.base = (matrix.hot_sim ? 4 : 3);
            initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR6.Bonus", Number(modifiers['matrix_initiative_dice']));
            initiative.matrix.dice.value = Helpers.calcTotal(initiative.matrix.dice, {min: 0, max: 5});
        }
    }
}
