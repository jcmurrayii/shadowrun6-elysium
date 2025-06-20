import {FormDialog, FormDialogData, FormDialogOptions} from "./FormDialog";
import {SuccessTest} from "../../tests/SuccessTest";
import { SuccessTestData } from '../../tests/SuccessTest';
import {SR6} from "../../config";
import {Helpers} from "../../helpers";
import { Translation } from '../../utils/strings';

export interface TestDialogData extends FormDialogData {
    test: SuccessTest
    rollMode: string
    rollModes: CONFIG.Dice.RollModes
    config: typeof SR6
}

/**
 * A way of allowing tests to inject handlers without having to sub-class the whole dialog
 */
export interface TestDialogListener {
    query: string
    on: string
    callback: (event: JQuery<HTMLElement>, dialog: TestDialog) => void
}

/**
 * TODO: Add TestDialog JSDoc
 */
export class TestDialog extends FormDialog {
    override data: TestDialogData
    // Listeners as given by the dialogs creator.
    listeners: TestDialogListener[]

    // @ts-expect-error // TODO: default option value with all the values...
    constructor(data, options: FormDialogOptions = {}, listeners: TestDialogListener[]=[]) {
        // Allow for Sheet style form submit value handling.
        options.applyFormChangesOnSubmit = true;
        super(data, options);

        this.listeners = listeners;
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'test-dialog';
        // TODO: Class Dialog here is needed for dialog button styling.
        options.classes = ['sr6', 'form-dialog'];
        options.resizable = true;
        options.height = 'auto';
        // @ts-expect-error
        options.width = 'auto';
        return options;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Handle in-dialog entity links to render the respective sheets.
        html.find('.entity-link').on('click', Helpers.renderEntityLinkSheet)

        this._injectExternalActiveListeners(html);
    }

    /**
     * Inject the listeners while binding local `this` to them.
     */
    _injectExternalActiveListeners(html: JQuery) {
        for (const listener of this.listeners) {
            //@ts-expect-error
            html.find(listener.query).on(listener.on, (event: JQuery<HTMLElement>) => listener.callback.bind(this.data.test)(event, this));
        }
    }

    /**
     * Overwrite this method to provide an alternative template for the dialog inner content.
     *
     * data.templatePath work's the same and can be used as well.
     */
    override get templateContent(): string {
        return 'systems/sr6elysium/dist/templates/apps/dialogs/success-test-dialog.html';
    }

    //@ts-expect-error
    getData() {
        const data = super.getData() as unknown as TestDialogData;

        //@ts-expect-error //TODO: default to general roll mode user setting
        data.rollMode = data.test.data.options?.rollMode;
        data.rollModes = CONFIG.Dice.rollModes;
        data.default = 'roll';

        // Add in general SR5 config to allow access to general values.
        data.config = SR6;

        return data;
    }

    /**
     * Overwrite this method to provide the dialog application title.
     */
    override get title() {
        const data = this.data as unknown as TestDialogData;
        return game.i18n.localize(data.test.title as Translation);
    }

    /**
     * Overwrite this method to provide dialog buttons.
     */
    override get buttons() {
        // Check if this is a skill test and if the skill can be rolled
        const canRoll = this._canRollSkill();

        return {
            roll: {
                label: game.i18n.localize('SR6.Roll'),
                icon: '<i class="fas fa-dice-six"></i>',
                disabled: !canRoll,
                title: !canRoll ? game.i18n.localize('SR6.Warnings.SkillCantBeRolled') : ''
            },
            cancel: {
                label: game.i18n.localize('SR6.Dialogs.Common.Cancel')
            }
        };
    }

    /**
     * Check if the skill in this test can be rolled
     * @returns true if the skill can be rolled, false otherwise
     */
    _canRollSkill(): boolean {
        const test = this.data.test;

        // If this isn't a skill test, we can always roll
        if (!test.data.action || !test.data.action.skill) return true;

        // If we don't have an actor, we can't check the skill
        if (!test.actor) return true;

        // Get the skill from the actor
        const skill = test.actor.getSkill(test.data.action.skill) ||
                      test.actor.getSkill(test.data.action.skill, {byLabel: true});

        // If we don't have a skill, we can't roll it
        if (!skill) return false;

        // Check if the skill can be rolled
        // Make sure the rules object exists before accessing it
        // @ts-ignore
        if (game.shadowrun6e && game.shadowrun6e.rules && game.shadowrun6e.rules.SkillRules) {
            // @ts-ignore
            return game.shadowrun6e.rules.SkillRules.allowRoll(skill);
        }

        // If we can't access the rules, assume the skill can be rolled
        return true;
    }

    /**
     * Callback for after the dialog has closed.
     * @param html
     */
    override onAfterClose(html: JQuery<HTMLElement>): SuccessTestData {
        return this.data.test.data;
    }

    /**
     * Update ValueField data used on the template and alter automatic calculation with manual override values, where
     * necessary.
     *
     * @param data An object with keys in Foundry UpdateData style {'key.key.key': value}
     */
    override _updateData(data) {
        // The user canceled their interaction by canceling, don't apply form changes.
        if (this.selectedButton === 'cancel') return;

        // First, apply changes to ValueField style values in a way that makes sense.
        Object.entries(data).forEach(([key, value]) => {
            // key is expected to be relative from TestDialog.data and begin with 'test'
            const valueField = foundry.utils.getProperty(this.data, key);
            if (foundry.utils.getType(valueField) !== 'Object' || !valueField.hasOwnProperty('mod')) return;

            // Remove from further automatic data merging.
            delete data[key]

            // Don't apply an unneeded override.
            if (valueField.value === value) return;

            if (value === null || value === '')
                delete valueField.override
            else
                valueField.override = {name: 'SR6.ManualOverride', value: Number(value)};
        });

        // Second, apply generic values.
        foundry.utils.mergeObject(this.data, data);

        // Give tests opportunity to change resulting values on the fly.
        this.data.test.prepareBaseValues();
        this.data.test.calculateBaseValues();
        this.data.test.validateBaseValues();
    }
}
