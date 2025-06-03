import {SituationModifiersApplication} from './apps/SituationModifiersApplication';
import {OverwatchScoreTracker} from './apps/gmtools/OverwatchScoreTracker';

/**
 * All systems keybindings should be registered here.
 *
 * This function is meant to be called during system setup.
 */
export const registerSystemKeybindings = () => {
    game.keybindings.register("sr6elysium", "show-situation-modifier-app", {
        name: "SR6.Keybinding.ShowSituationModifiers.Label",
        hint: "SR6.Keybinding.ShowSituationModifiers.Hint",
        editable: [{ key: "KeyM", modifiers: [] }],
        onDown: () => SituationModifiersApplication.openForKeybinding(),
    });

    game.keybindings.register("sr6elysium", "show-overwatch-tracker-app", {
        name: "SR6.Keybinding.OverwatchScoreTracker.Label",
        hint: "SR6.Keybinding.OverwatchScoreTracker.Hint",
        editable: [{ key: "KeyO", modifiers: [] }],
        onDown: () => new OverwatchScoreTracker().render(true),
    });

    game.keybindings.register("sr6elysium", "hide-test-dialog", {
        name: game.i18n.localize("SR6.Keybinding.HideTestDialog.Label"),
        hint: game.i18n.localize("SR6.Keybinding.HideTestDialog.Hint"),
        editable: [{key: "shiftKey"}]
    });

    game.keybindings.register("sr6elysium", "show-item-card", {
        name: game.i18n.localize("SR6.Keybinding.ShowItemCard.Label"),
        hint: game.i18n.localize("SR6.Keybinding.ShowItemCard.Hint"),
        editable: [{key: "ctrlKey"}]
    });
}
