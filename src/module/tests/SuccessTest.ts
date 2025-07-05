import { TestDialogListener } from '../apps/dialogs/TestDialog';
import { DamageApplicationFlow } from '../actor/flows/DamageApplicationFlow';
import {SR6Actor} from "../actor/SR6Actor";
import {CORE_FLAGS, CORE_NAME, FLAGS, SR, SYSTEM_NAME} from "../constants";
import {DataDefaults} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import {SR6Item} from "../item/SR6Item";
import {SR6Roll} from "../rolls/SR6Roll";
import {PartsList} from "../parts/PartsList";
import {TestDialog} from "../apps/dialogs/TestDialog";
import {SR6} from "../config";
import {ActionFlow} from "../item/flows/ActionFlow";
import ValueField = Shadowrun.ValueField;
import DamageData = Shadowrun.DamageData;
import OpposedTestData = Shadowrun.OpposedTestData;
import ModifierTypes = Shadowrun.ModifierTypes;
import ActionRollData = Shadowrun.ActionRollData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ActionResultData = Shadowrun.ActionResultData;
import ResultActionData = Shadowrun.ResultActionData;
import { TestCreator } from "./TestCreator";
import Template from "../template";
import { TestRules } from "../rules/TestRules";
import { MatrixRules } from "../rules/MatrixRules";

import { ActionResultFlow } from "../item/flows/ActionResultFlow";
import { SuccessTestEffectsFlow } from '../effect/flows/SuccessTestEffectsFlow';
import { SR6ActiveEffect } from '../effect/SR6ActiveEffect';
import { Translation } from '../utils/strings';
import { GmOnlyMessageContentFlow } from '../actor/flows/GmOnlyMessageContentFlow';

export interface TestDocuments {
    actor?: SR6Actor
    item?: SR6Item
    rolls?: SR6Roll[]
}

export interface TestValues {
    [name: string]: ValueField | DamageData
}

export interface SuccessTestValues extends TestValues {
    hits: ValueField
    netHits: ValueField
    glitches: ValueField
    extendedHits: ValueField
}

export interface IconWithTooltip {
    icon: string;
    tooltip: Translation;
}

/**
 * Contain all data necessary to handle an action based test.
 */
export interface TestData {
    // How to label this test.
    title?: string
    // Determine the kind of test; defaults to the class constructor name.
    type?: string

    // Shadowrun 5 related test values.
    pool: ValueField
    threshold: ValueField
    limit: ValueField

    // Hits as reported by an external dice roll.
    manualHits: ValueField
    manualGlitches: ValueField

    hitsIcon?: IconWithTooltip
    autoSuccess?: boolean

    // Internal test values.
    values: TestValues

    damage: DamageData

    // A list of modifier descriptions to be used for this test.
    // These are designed to work with SR6Actor.getModifier()
    // modifiers: Record<ModifierTypes, TestModifier>
    modifiers: ValueField

    // A list of test categories to be used for this test.
    // Check typing documentation for more information.
    categories: Shadowrun.ActionCategories[]

    // Edge related triggers
    pushTheLimit: boolean
    secondChance: boolean

    // When true this test is an extended test
    extended: boolean
    // When false, this test is on it's first roll. When true, it's on an extended roll.
    extendedRoll: boolean

    // The source action this test is derived from.
    action: ActionRollData

    // Documents the test might has been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string

    // Message the test has been represented with.
    messageUuid?: string

    // Options the test was created with.
    options?: TestOptions

    // Has this test been cast before
    evaluated: boolean

    edgeGain: {
        gained: boolean,
        discarded: boolean,
        effect: any
    }
}

export interface SuccessTestData extends TestData {
    opposed: OpposedTestData
    values: SuccessTestValues
    // Scene Token Ids marked as targets of this test.
    targetActorsUuid: string[]
    // Track if failures have been rerolled
    rerolledFailures?: boolean
    // Store the rerolled failures rolls
    rerolledFailuresRolls?: SR6Roll[]
    // Store the number of failures rerolled
    rerolledFailuresCount?: number

}

export interface TestOptions {
    showDialog?: boolean // Show dialog when defined as true.
    showMessage?: boolean // Show message when defined as true.
    rollMode?: keyof typeof CONFIG.Dice.rollModes
}

export interface SuccessTestMessageData {
    data: SuccessTestData,
    rolls: SR6Roll[]
}

/**
 * General handling of Shadowrun 5e success tests as well as their FoundryVTT representation.
 *
 * SuccessTest implementation will handle
 * - general flow of a FoundryVTT Shadowrun 5e success test
 * - shadowrun 5e rules
 * - FoundryVTT dialog creation for user input
 * - FoundryVTT chat message creation
 *
 * Usage:
 * > const test = new SuccessTest({pool: 6});
 * > await test.execute();
 *
 * The user facing point for a success test is the execute() method.
 * It's up to the caller to decide what parameters to give.
 *
 * Check the TestCreator helper for more convenient ways to create tests from
 * - actions (data)
 * - items
 * - existing chat messages
 * - ...
 *
 * Create a test from an item:
 * > const test = await TestCreator.fromItem(item);
 * > test.execute();
 *
 * Typically the system will create a test from an action. Each action contains a reference
 * for the active, opposed, resist and follow up test to use. That test will be taken by the
 * TestCreate._getTestClass() function. Whenever a user trigger test is to be executed, it should
 * be an action configuration that is used to retrieve and create the test.
 *
 * The test registry is a simple key value store mapping names to classes underneath
 * game['sr6elysium'].tests
 *
 * For the default SuccessTest class the registry entry would look like this:
 * > game['sr6elysium'].tests['SuccessTest'] = SuccessTest;
 * and it would be retrieved by the TestCreator like this:
 * > const SuccessTest = TestCreate._getTestClass('SuccessTest');
 */
export class SuccessTest<T extends SuccessTestData = SuccessTestData> {
    public data: T;
    public actor: SR6Actor | undefined;
    public item: SR6Item | undefined;
    public rolls: SR6Roll[];
    public targets: TokenDocument[];

    // Flows to handle different aspects of a Success Test that are not directly related to the test itself.
    public effects: SuccessTestEffectsFlow<this>;

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        this.rolls = documents?.rolls || [];

        // User selected targets of this test.
        this.targets = [];

        options = options || {}

        this.data = this._prepareData(data, options);

        this.effects = new SuccessTestEffectsFlow<this>(this);

        this.calculateBaseValues();

        console.debug(`Shadowrun 6e | Created ${this.constructor.name} Test`, this);
    }

    /**
     * Make sure a test has a complete data structure, even if supplied data doesn't fully provide that.
     *
     * Any Test should be usable simply by instantiating it with empty TestData
     *
     * @param data
     * @param options
     */
    _prepareData(data, options: TestOptions) {
        data.type = data.type || this.type;
        data.actor = this.actor;

        // Store the current users targeted token ids for later use.
        data.targetActorsUuid = data.targetActorsUuid || Helpers.getUserTargets().map(token => token.actor?.uuid).filter(uuid => !!uuid);

        // Store given document uuids to be fetched during evaluation.
        data.sourceActorUuid = data.sourceActorUuid || this.actor?.uuid;
        data.sourceItemUuid = data.sourceItemUuid || this.item?.uuid;

        // @ts-expect-error // Prepare general test information.
        data.title = data.title || this.constructor.label;

        options.rollMode = this._prepareRollMode(data, options);
        options.showDialog = options.showDialog !== undefined ? options.showDialog : true;
        options.showMessage = options.showMessage !== undefined ? options.showMessage : true;

        // Options will be used when a test is reused further on.
        data.options = options;

        // Keep previous evaluation state.
        data.evaluated = data.evaluated ?? false;

        data.pushTheLimit = data.pushTheLimit !== undefined ? data.pushTheLimit : false;
        data.secondChance = data.secondChance !== undefined ? data.secondChance : false;

        // Set possible missing values.
        data.pool = data.pool || DataDefaults.valueData({ label: 'SR6.DicePool' });
        data.threshold = data.threshold || DataDefaults.valueData({ label: 'SR6.Threshold' });
        data.limit = data.limit || DataDefaults.valueData({ label: 'SR6.Limit' });

        data.values = data.values || {};

        // Prepare basic value structure to allow an opposed tests to access derived values before execution with placeholder
        // active tests.
        data.values.hits = data.values.hits || DataDefaults.valueData({ label: "SR6.Hits" });
        data.values.extendedHits = data.values.extendedHits || DataDefaults.valueData({ label: "SR6.ExtendedHits" });
        data.values.netHits = data.values.netHits || DataDefaults.valueData({ label: "SR6.NetHits" });
        data.values.glitches = data.values.glitches || DataDefaults.valueData({ label: "SR6.Glitches" });

        // User reported manual hits.
        data.manualHits = data.manualHits || DataDefaults.valueData({ label: "SR6.ManualHits" });
        data.manualGlitches = data.manualGlitches || DataDefaults.valueData({ label: "SR6.ManualGlitches" });

        data.opposed = data.opposed || undefined;
        data.modifiers = this._prepareModifiersData(data.modifiers);



        data.damage = data.damage || DataDefaults.damageData();

        data.extendedRoll = data.extendedRoll || false;
        data.edgeGain = {gained: false, discarded: false, effect: null}

        console.debug('Shadowrun 6e | Prepared test data', data);

        return data;
    }

    /**
     * The tests roll mode can be given by specific option, action setting or global configuration.
     * @param options The test options for the whole test
     */
    _prepareRollMode(data, options: TestOptions): Shadowrun.FoundryRollMode {
        if (options.rollMode !== undefined) return options.rollMode;
        if (data.action && data.action.roll_mode) return data.action.roll_mode;
        else return game.settings.get(CORE_NAME, CORE_FLAGS.RollMode) as Shadowrun.FoundryRollMode;
    }

    /**
     * Prepare a default modifier object.
     *
     * This should be used for whenever a Test doesn't modifiers specified externally.
     */
    _prepareModifiersData(modifiers?: ValueField) {
        return modifiers || DataDefaults.valueData({ label: 'SR6.Labels.Action.Modifiers' });
    }

    /**
     * Overwrite this method to alter the title of test dialogs and messages.
     */
    get title(): string {
        // @ts-expect-error
        return `${game.i18n.localize(this.constructor.label)}`;
    }

    /**
     * Determine the type of success test for this implementation.
     *
     * By default this will be the class constructor name.
     * NOTE: This breaks for a build pipeline using minification. This is due to
     * , currently, the test registry using the runtime constructor name vs the compile time
     * class name.
     */
    get type(): string {
        return this.constructor.name;
    }

    /**
     * Get the label for this test type used for i18n.
     */
    static get label(): string {
        return `SR6.Tests.${this.name}`;
    }

    /**
     * Helper to determine if this test has been fully evaluated at least once.
     */
    get evaluated(): boolean {
        return this.data.evaluated;
    }

    /**
     * FoundryVTT serializer method to embed this test into a document (ChatMessage).
     *
     * Foundry expects Roll data to serialize into rolls.
     * The system expects Test data to serialize into data.
     * @returns
     */
    toJSON() {
        return {
            data: this.data,
            // Use Roll.toJSON() to inject 'class' property. Foundry relies on this to build it's classes.
            rolls: this.rolls.map(roll => roll.toJSON())
        };
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a success
     */
    static get lowestSuccessSide(): number {
        return Math.min(...SR.die.success);
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a glitch.
     */
    static get lowestGlitchSide(): number {
        return Math.min(...SR.die.glitch);
    }

    /**
     * Get a possible globally defined default action set for this test class.
     */
    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {};
    }

    /**
     * Get a document defined action set for this test class.
     *
     * Subclasses can use this to provide actor or item based action configurations that aren't
     * directly part of the action template.
     *
     * @param item The item holding the action configuration.
     * @param actor The actor used for value calculation.
     */
    static async _getDocumentTestAction(item: SR6Item, actor: SR6Actor): Promise<Partial<MinimalActionData>> {
        return {};
    }

    static async _prepareActionTestData(action: ActionRollData, actor: SR6Actor, data) {
        return TestCreator._prepareTestDataWithAction(action, actor, data);
    }

    /**
     * Create test data from an opposed message action.
     *
     * This method is meant to be overridden if this testing class supports
     * testing against an opposed message action.
     *
     * If this test class doesn't support this opposed message actions it will
     * return undefined.
     *
     * @param testData The original test that's opposed.
     * @param actor The actor for this opposing test.
     * @param previousMessageId The id this message action is sourced from.
     */
    static async _getOpposedActionTestData(testData, actor: SR6Actor, previousMessageId: string): Promise<SuccessTestData | undefined> {
        console.error(`Shadowrun 6e | Testing Class ${this.name} doesn't support opposed message actions`);
        return;
    }

    /**
     * Determine if this test has any kind of modifier types active
     */
    get hasModifiers(): boolean {
        return this.data.modifiers.mod.length > 0;
    }

    /**
     * Create the default formula for this test based on it's pool
     *
     * FoundryVTT documentation:
     * sr6elysium: SR6#44
     *
     */
    get formula(): string {
        const pool = Helpers.calcTotal(this.data.pool, { min: 0 });
        return this.buildFormula(pool, this.hasPushTheLimit);
    }

    /**
     * Build a Foundry Roll formula string
     *
     * Dice:       https://foundryvtt.com/article/dice-advanced/
     * Modifiers:  https://foundryvtt.com/article/dice-modifiers/
     *
     * @param dice Amount of d6 to use.
     * @param explode Should the d6 be exploded.
     * @returns The complete formula string.
     */
    buildFormula(dice: number, explode: boolean): string {
        // Apply dice explosion, removing the limit is done outside the roll.
        const explodeFormula = explode ? 'x6' : '';
        return `(${dice})d6cs>=${SuccessTest.lowestSuccessSide}${explodeFormula}`;
    }

    /**
     * Give a representation of this success test in the common Shadowrun 5 description style.
     * The code given is meant to provide information about value sources. Should a user overwrite
     * these values during dialog review, keep those hidden.
     *
     * Automatics + Agility + 3 (3) [2 + Physical]
     */
    get code(): string {
        // Add action dynamic value sources as labels.
        let pool = this.pool.mod.filter(mod => mod.value !== 0).map(mod => `${game.i18n.localize(mod.name as Translation)} ${mod.value}`); // Dev code for pool display. This should be replaced by attribute style value calculation info popup
        // let pool = this.pool.mod.map(mod => `${game.i18n.localize(mod.name)} (${mod.value})`);

        // Threshold and Limit are values that can be overwritten.
        let threshold = this.threshold.override
            ? [game.i18n.localize(this.threshold.override.name as Translation)]
            : this.threshold.mod.map(mod => game.i18n.localize(mod.name as Translation));
        let limit = this.limit.override
            ? [game.i18n.localize(this.limit.override.name as Translation)]
            : this.limit.mod.map(mod => game.i18n.localize(mod.name as Translation));


        // Add action static value modifiers as numbers.
        if (this.pool.base > 0 && !this.pool.override) pool.push(String(this.pool.base));
        if (this.threshold.base > 0 && !this.threshold.override) threshold.push(String(this.threshold.base));
        if (this.limit.base > 0 && !this.limit.override) limit.push(String(this.limit.base));

        // Pool portion can be dynamic or static.
        let code = pool.join(' + ').trim() || `${this.pool.value}`;

        // Only add threshold / limit portions when appropriate.
        if (threshold.length > 0 && this.threshold.value > 0) code = `${code} (${threshold.join(' + ').trim()})`;
        if (limit.length > 0 && this.limit.value > 0) code = `${code} [${limit.join(' + ').trim()}]`;

        return code;
    }

    /**
     * Determine if this test can have a human-readable shadowrun test code representation.
     *
     * All parts of the test code can be dynamic, any will do.
     */
    get hasCode(): boolean {
        return this.pool.mod.length > 0 || this.threshold.mod.length > 0 || this.limit.mod.length > 0;
    }

    /**
     * Helper method to create the main SR6Roll.
     */
    createRoll(): SR6Roll {
        const roll = new SR6Roll(this.formula) as unknown as SR6Roll;
        this.rolls.push(roll);
        return roll;
    }

    /**
     * Allow other implementations to override what TestDialog template to use.
     */
    get _dialogTemplate(): string {
        return 'systems/sr6elysium/dist/templates/apps/dialogs/success-test-dialog.html';
    }

    /**
     * Allow other implementations to override what ChatMessage template to use.
     */
    get _chatMessageTemplate(): string {
        return 'systems/sr6elysium/dist/templates/rolls/success-test-message.html';
    }

    /**
     * What TestDialog class to use for this test type?
     *
     * If you only need to display differing data you can also only define a different _dialogTemplate
     * @override This method if you want to use a different TestDialog.
     */
    _createTestDialog() {
        return new TestDialog({ test: this, templatePath: this._dialogTemplate }, undefined, this._testDialogListeners());
    }

    /**
     * Allow other implementations to add listeners to the TestDialog HTML, changing
     * it's behavior without the need to sub-class TestDialog.
     */
    _testDialogListeners() {
        return [] as TestDialogListener[]
    }

    /**
     * Suppress dialog during execution
     */
    hideDialog() {
        if (!this.data.options) this.data.options = {};
        this.data.options.showDialog = false;
    }

    /**
     * Show the dialog class for this test type and alter test according to user selection.
     */
    async showDialog(): Promise<boolean> {
        if (!this.data.options?.showDialog) return true;

        const dialog = this._createTestDialog();

        const data = await dialog.select();
        if (dialog.canceled) {
            await this.cleanupAfterExecutionCancel();
            return false
        }

        // Overwrite current test state with whatever the dialog gives.
        this.data = data;
        await this.saveUserSelectionAfterDialog();

        // Second base value preparation will show changes due to user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        return true;
    }

    /**
     * Override this method if there needs to be some cleanup after a user has canceled a dialog
     * but before the tests actual execution.
     */
    async cleanupAfterExecutionCancel() { }

    /**
     * Override this method if you want to save any document data after a user has selected values
     * during user facing dialog.
     */
    async saveUserSelectionAfterDialog() { }

    /**
     * The general base value preparation. This will be re applied at multiple points before execution.
     */
    prepareBaseValues() {
        // Re-apply document modifiers first, as those might have changed in between calculations.
        this.prepareDocumentModifiers();
        this.prepareTestModifiers();

        // Only then apply values and collected modifiers.
        this.applyPushTheLimit();
        this.applyPoolModifiers();
    }

    /**
     * Handle chosen modifier types and apply them to the pool modifiers.
     *
     * NOTE: To keep this.pool.mod and this.modifiers.mod in sync, never remove
     *       a modifier. Rather set it to zero, causing it to not be shown.
     */
    applyPoolModifiers() {
        const pool = new PartsList(this.pool.mod);

        // Remove override modifier from pool.
        pool.removePart('SR6.Labels.Action.Modifiers');

        // If applicable apply only override to pool. (User interaction)
        if (this.data.modifiers.override) {
            // Remove all modifiers and only apply override.
            for (const modifier of this.data.modifiers.mod) {
                pool.removePart(modifier.name);
            }

            pool.addUniquePart('SR6.Labels.Action.Modifiers', this.data.modifiers.override.value)
            return;
        }

        // Otherwise apply automated modifiers to pool.
        for (const modifier of this.data.modifiers.mod) {
            // A modifier might have been asked for, but not given by the actor.
            pool.addUniquePart(modifier.name, modifier.value);
        }
    }

    /**
     * To assure all test values are full integers, round all value parts.
     * Don't round the total as this will lead to some values shown as decimals and some as
     * integers.
     *
     * Instead Shadowrun 5e rules expect all individual values to be rounded before use.
     * We use the 'Note on Rounding' on SR5#48 as a guideline.
     */
    roundBaseValueParts() {
        const roundAllMods = (value: Shadowrun.ValueField) => {
            value.base = Math.ceil(value.base);
            if (value.override) value.override.value = Math.ceil(value.override.value);
            if(value.mod instanceof Array) {
                value.mod.forEach(mod => mod.value = Math.ceil(mod.value));
            }
        }

        roundAllMods(this.data.modifiers);
        roundAllMods(this.data.pool);
        roundAllMods(this.data.threshold);
        roundAllMods(this.data.limit);
    }

    /**
     * Calculate only the base test that can be calculated before the test has been evaluated.
     *
     * This will be re applied at multiple points before execution.
     */
    calculateBaseValues() {
        this.roundBaseValueParts();

        this.data.modifiers.value = Helpers.calcTotal(this.data.modifiers);

        this.data.pool.value = Helpers.calcTotal(this.data.pool, { min: 0 });
        this.data.threshold.value = Helpers.calcTotal(this.data.threshold, { min: 0 });
        this.data.limit.value = Helpers.calcTotal(this.data.limit, { min: 0 });

        this.data.manualHits.value = Helpers.calcTotal(this.data.manualHits, { min: 0 });
        this.data.manualGlitches.value = Helpers.calcTotal(this.data.manualGlitches, { min: 0 });

        // Shows AP on incoming attacks
        this.data.damage.ap.value = Helpers.calcTotal(this.data.damage.ap);

        console.debug(`Shadowrun 6e | Calculated base values for ${this.constructor.name}`, this.data);
    }

    /**
     * Allow implementations to validate values before execution.
     */
    validateBaseValues() { }

    /**
     * Helper method to evaluate the internal SR6Roll and SuccessTest values.
     */
    async evaluate(): Promise<this> {
        if (!this.usingManualRoll) {
            // Evaluate all rolls.
            for (const roll of this.rolls) {
                // @ts-expect-error // foundry-vtt-types is missing evaluated.
                if (!roll._evaluated)
                    await roll.evaluate();
            }
        }

        this.data.evaluated = true;
        this.calculateDerivedValues();


        return this;
    }

    /**
     * Allow subclasses to populate a test before execution and any other steps.
     */
    async populateTests() { }

    /**
     * Rehydrate this test with Documents, should they be missing.
     * This can happen when a test is created from a ChatMessage.
     */
    async populateDocuments() {
        // Populate the actor document.
        if (!this.actor && this.data.sourceActorUuid) {
            // SR6Actor.uuid will return an actor id for linked actors but its token id for unlinked actors
            const document = await fromUuid(this.data.sourceActorUuid) || undefined;
            // @ts-expect-error
            this.actor = document instanceof TokenDocument ?
                document.actor :
                document as SR6Actor;
        }

        // Populate the item document.
        if (!this.item && this.data.sourceItemUuid)
            this.item = await fromUuid(this.data.sourceItemUuid) as SR6Item || undefined;

        // Populate targeted token documents.
        if (this.targets.length === 0 && this.data.targetActorsUuid) {
            this.targets = [];
            for (const uuid of this.data.targetActorsUuid) {
                const document = await fromUuid(uuid);
                if (!document) continue;

                const token = document instanceof SR6Actor ? document.getToken() : document;
                if (!(token instanceof TokenDocument)) continue;

                this.targets.push(token as TokenDocument);
            }
        }
    }

    /**
     * Prepare missing data based on tests Documents before anything else is done.
     */
    async prepareDocumentData() {
        // Calculate damage here to have access to actor AND item used.
        this.data.damage = ActionFlow.calcDamageData(this.data.damage, this.actor, this.item);
    }

    /**
     * What Action Categories should be used for this test by default.
     *
     * NOTE: These categories can be overwritten by the source action used to create a test instance.
     * Override this method if you test implementation needs to define different default categories.
     */
    get testCategories(): Shadowrun.ActionCategories[] {
        return [];
    }

    /**
     * What modifiers should be used for this test type by default.
     *
     * NOTE: These modifiers are routed through ModifierFlow.totalFor()
     */
    get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds'];
    }

    /**
     * Prepare this tests categories.
     *
     * By default categories are taken from the test implementation but can be overwritten by the source action.
     *
     * Test categories must be ready before active effects are applied as they rely on this data to be present.
     */
    prepareTestCategories() {
        this.data.categories = this.data.action.categories || this.testCategories;
    }

    /**
     * Prepare modifiers based on connected documents.
     *
     * Documents MUST've been be populated before hand.
     *
     * Main purpose is to populate the configured modifiers for this test based on actor / items used.
     */
    prepareDocumentModifiers() {
        this.prepareActorModifiers();
        this.prepareItemModifiers();
    }

    /**
     * Allow implementations to overwrite default modifiers after document modifiers have been applied to influence
     * pool calculation.
     */
    prepareTestModifiers() { }

    /**
     * Prepare general modifiers based on the actor, as defined within the action or test implementation.
     */
    prepareActorModifiers() {
        if (!this.actor) return;
        // Don't use default test actions when source action provides modifiers.
        if (this.data.action.modifiers.length > 0) return;

        for (const type of this.testModifiers) {
            const { name, value } = this.prepareActorModifier(this.actor, type);
            PartsList.AddUniquePart(this.data.modifiers.mod, name, value, true);
        }
    }

    /**
     * Prepare a single modifier.
     *
     * Extend this method should you want to alter a single modifiers application.
     *
     * @param actor The actor to fetch modifier information for.
     * @param type The modifier type to be prepared.
     */
    prepareActorModifier(actor: SR6Actor, type: ModifierTypes): { name: string, value: number } {
        const options = { test: this, reapply: true };
        const value = actor.modifiers.totalFor(type, options);
        const name = this._getModifierTypeLabel(type);

        return { name, value };
    }

    _getModifierTypeLabel(type: ModifierTypes): string {
        return SR6.modifierTypes[type];
    }

    /**
     * Allow subclasses to alter test modifiers based on the item used for casting.
     */
    prepareItemModifiers() { }

    /**
     * Calculate the total of all values.
     */
    calculateDerivedValues() {
        // Calculate all derived / static values. Order is important.
        this.data.values.hits = this.calculateHits();
        this.data.values.extendedHits = this.calculateExtendedHits();
        this.data.values.netHits = this.calculateNetHits();
        this.data.values.glitches = this.calculateGlitches();

        console.debug(`Shadowrun 6e | Calculated derived values for ${this.constructor.name}`, this.data);
    }

    /**
     * Helper to get the pool value for this success test.
     */
    get pool(): ValueField {
        return this.data.pool;
    }

    /**
     * Helper to get the total limit value for this success test.
     */
    get limit(): ValueField {
        return this.data.limit;
    }

    /**
     * Helper to determine if this success test uses a limit.
     *
     * NOTE: Limits will NEVER apply when the ApplyLimit setting is set accordingly.
     */
    get hasLimit(): boolean {
        const applyLimit = game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits) as boolean;
        return applyLimit && !this.hasPushTheLimit && this.limit.value > 0;
    }

    /**
     * Helper to determine if the hits have been lowered by the limit.
     *
     * This will compare actual roll hits, without applied limit.
     */
    get hasReducedHits(): boolean {
        return this.hits.value > this.limit.value;
    }

    /**
     * Helper to get the total threshold value for this success test.
     */
    get threshold(): ValueField {
        return this.data.threshold;
    }

    /**
     * Helper to determine if this success test uses a threshold.
     */
    get hasThreshold(): boolean {
        return this.threshold.value > 0;
    }

    /**
     * Helper to determine if this success test has a damage value.
     */
    get hasDamage(): boolean {
        // check that we don't have a damage value of 0 and a damage type that isn't empty
        return this.data.action?.damage?.value !== 0 && this.data.action?.damage?.type?.value !== '';
    }

    /**
     * Get the damage data for this test.
     */
    get damage(): Shadowrun.DamageData {
        return this.data.damage;
    }

    get cappedEdge(): boolean {
        console.log('Shadowrun 6e | Capped edge:', this.data.edgeGain.discarded);
        return this.data.edgeGain.discarded;
    }
    get earnedEdge(): boolean {
        return this.data.edgeGain.gained;
    }

    get edgeEarnedReason() : string {
        if(this.data.edgeGain.effect == null) return '';
        if(this.data.edgeGain.gained && this.data.edgeGain.effect instanceof SR6ActiveEffect) {
            return this.data.edgeGain.effect.name ?? '';
        } else {
            return this.data.edgeGain.effect;
        }
    }

    /**
     * Helper to get the net hits value for this success test with a possible threshold.
     */
    calculateNetHits(): ValueField {
        // An extended test will use summed up extended hit, while a normal test will use its own hits.
        const hits = this.extended ? this.extendedHits : this.hits;

        // Maybe lower hits by threshold to get the actual net hits.
        const base = this.hasThreshold ?
            Math.max(hits.value - this.threshold.value, 0) :
            hits.value;

        // Calculate a ValueField for standardization.
        const netHits = DataDefaults.valueData({
            label: "SR6.NetHits",
            base
        });
        netHits.value = Helpers.calcTotal(netHits, { min: 0 });

        return netHits;
    }

    get netHits(): ValueField {
        return this.data.values.netHits;
    }

    /**
     * Helper to get the hits value for this success test with a possible limit.
     */
    calculateHits(): ValueField {
        // Use manual or automated roll for hits.
        const rollHits = this.usingManualRoll ?
            this.manualHits.value :
            this.rolls.reduce((hits, roll) => hits + roll.hits, 0);

        console.log('Shadowrun 6e | Calculating hits from rolls:', this.rolls);
        console.log('Shadowrun 6e | Roll hits calculated:', rollHits);

        // Sum of all rolls!
        this.hits.base = rollHits;

        // First, calculate hits based on roll and modifiers.
        this.hits.value = Helpers.calcTotal(this.hits, { min: 0 });
        console.log('Shadowrun 6e | Hits after modifiers:', this.hits.value);

        // Second, reduce hits by limit.
        this.hits.value = this.hasLimit ? Math.min(this.limit.value, this.hits.value) : this.hits.value;
        console.log('Shadowrun 6e | Final hits value after limit:', this.hits.value);

        return this.hits;
    }

    get hits(): ValueField {
        return this.data.values.hits;
    }

    get extendedHits(): ValueField {
        // Return a default value field, for when no extended hits have been derived yet (or ever).
        return this.data.values.extendedHits || DataDefaults.valueData({ label: 'SR6.ExtendedHits' });
    }

    get manualHits(): ValueField {
        return this.data.manualHits;
    }

    get manualGlitches(): ValueField {
        return this.data.manualGlitches;
    }

    get hitsIcon(): IconWithTooltip | undefined {
        return this.data.hitsIcon;
    }

    get appendedHits(): number | undefined {
        return this.hits.mod.find((mod) => mod.name === "SR6.AppendedHits")?.value;
    }

    // In the case we've added appended hits, we want to separately display the hits value and the appended hits (ie. "7 + 5" instead of "12")
    get displayHits(): number | undefined {
        console.log('Shadowrun 6e | Getting displayHits');
        console.log('Shadowrun 6e | hits.value:', this.hits.value);
        console.log('Shadowrun 6e | hits.base:', this.hits.base);
        console.log('Shadowrun 6e | appendedHits:', this.appendedHits);

        // Make sure we're returning the actual number of hits from the roll
        // For spellcasting tests, we want to show the actual number of hits
        const result = this.hits.base;
        console.log('Shadowrun 6e | displayHits result:', result);
        return result;
    }

    // Hide dice pool and roll results as they are not relevant to the success of the test
    get autoSuccess(): boolean {
        return !!this.data.autoSuccess;
    }

    /**
     * Depending on system settings allow manual hits to skip automated roll.
     */
    get allowManualHits(): boolean {
        return game.settings.get(SYSTEM_NAME, FLAGS.ManualRollOnSuccessTest) as boolean;
    }

    /**
     * Determine if this success test must automated roll or can use a manual roll given by user.
     */
    get usingManualRoll(): boolean {
        return this.allowManualHits && (Boolean(this.data.manualHits.override) || Boolean(this.data.manualGlitches.override))
    }

    /**
     * Helper to get the glitches values for this success test.
     */
    calculateGlitches(): ValueField {
        // When using a manual roll, don't derive glitches from automated rolls.
        const rollGlitches = this.usingManualRoll ?
            this.manualGlitches.value :
            this.rolls.reduce((glitches, roll) => glitches + roll.glitches, 0);

        const glitches = DataDefaults.valueData({
            label: "SR6.Glitches",
            base: rollGlitches
        })
        glitches.value = Helpers.calcTotal(glitches, { min: 0 });

        return glitches;
    }

    /**
     * Gather hits across multiple extended test executions.
     */
    calculateExtendedHits(): ValueField {
        if (!this.extended) return DataDefaults.valueData({ label: 'SR6.ExtendedHits' });

        const extendedHits = this.extendedHits;
        extendedHits.mod = PartsList.AddPart(extendedHits.mod, 'SR6.Hits', this.hits.value);

        Helpers.calcTotal(extendedHits, { min: 0 });

        return extendedHits;
    }

    /**
     * Check if this test is currently being extended.
     */
    get extended(): boolean {
        return this.canBeExtended && this.data.extended;
    }

    /**
     * Check if this test is on it's first or an extended roll.
     */
    get extendedRoll(): boolean {
        return this.data.extendedRoll;
    }

    /**
     * Can this test type be extended or not?
     *
     * If false, will hide extended dialog settings.
     */
    get canBeExtended(): boolean {
        return true;
    }

    get glitches(): ValueField {
        return this.data.values.glitches;
    }

    /**
     * Helper to check if the current test state is glitched.
     */
    get glitched(): boolean {
        return TestRules.glitched(this.glitches.value, this.pool.value);
    }

    /**
     * Helper to check if the current test state is critically glitched.
     */
    get criticalGlitched(): boolean {
        return TestRules.criticalGlitched(this.hits.value, this.glitched);
    }

    /**
     * Check if the current test state is successful.
     *
     * @returns true on a successful test
     */
    get success(): boolean {
        // Extended tests use the sum of all extended hits.
        const hits = this.extended ? this.extendedHits : this.hits;
        return TestRules.success(hits.value, this.threshold.value);
    }

    /**
     * Check if the current test state is unsuccessful.
     *
     * @returns true on a failed test
     */
    get failure(): boolean {
        // Allow extended tests without a threshold and avoid 'failure' confusion.
        if (this.extended && this.threshold.value === 0) return true;
        // When extendedHits have been collected, check against threshold.
        if (this.extendedHits.value > 0 && this.threshold.value > 0) return this.extendedHits.value < this.threshold.value;
        // Otherwise fall back to 'whatever is not a success.
        return !this.success;
    }

    /**
     * Use this method for subclasses which can't reasonably be successful.
     */
    get canSucceed(): boolean {
        // Not extended tests can succeed normally.
        if (!this.extended) return true;

        // Extended tests can only succeed when a threshold is set.
        return this.extended && this.hasThreshold;
    }

    /**
     * Use this method for subclasses which can't reasonably fail.
     */
    get canFail(): boolean {
        return true;
    }

    /**
     * While a test might be successful with a zero threshold, it's
     * unclear if it's meant to be a success.
     *
     * Tests that don't know their threshold, either by GM secrecy or
     * following opposed tests not yet thrown, shouldn't show user
     * their successful.
     */
    get showSuccessLabel(): boolean {
        return this.success && this.hasThreshold;
    }

    /**
     * How to call a successful test of this type.
     */
    get successLabel(): Translation {
        return 'SR6.TestResults.Success';
    }

    /**
     * How to call a failed test of this type.
     */
    get failureLabel(): Translation {
        if (this.extended) return 'SR6.TestResults.Results';
        return 'SR6.TestResults.Failure';
    }

    /**
     * Helper to check if opposing tests exist for this test.
     */
    get opposed(): boolean {
        return !!this.data.opposed && this.data.opposed.test !== undefined && this.data.opposed.test !== '';
    }

    /**
     * Determine if this test is opposing another test.
     */
    get opposing(): boolean {
        return false;
    }

    /**
     * Helper to get an items action result information.
     */
    get results(): ActionResultData | undefined {
        if (!this.item) return;
        return this.item.getActionResult();
    }

    /**
     * Determine if this test has any targets selected using FoundryVTT targeting.
     */
    get hasTargets(): boolean {
        return this.targets.length > 0;
    }

    /**
     * Has this test been derived from an action?
     *
     * This can either be from an items action or a pre-configured action.
     */
    get hasAction(): boolean {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        return !foundry.utils.isEmpty(this.data.action);
    }

    /**
     * TODO: This method results in an ugly description.
     *
     */
    get description(): string {
        const poolPart = this.pool.value;
        const thresholdPart = this.hasThreshold ? `(${this.threshold.value})` : '';
        const limitPart = this.hasLimit ? `[${this.limit.value}]` : '';
        return `${poolPart} ${thresholdPart} ${limitPart}`
    }

    get hasPushTheLimit(): boolean {
        return this.data.pushTheLimit;
    }

    get hasSecondChance(): boolean {
        return this.data.secondChance;
    }

    /**
     * Determine if this test can use second chance rules.
     *
     * Use this property to check if a existing test can use this edge rule.
     *
     * SR5#56.
     */
    get canSecondChance(): boolean {
        if (!this.evaluated) {
            console.error('SR6: Elysium | Second chance edge rules should not be applicable on initial cast');
            return false;
        }
        // According to rules, second chance can't be used on glitched tests.
        if (this.glitched) {
            ui.notifications?.warn('SR6.Warnings.CantSecondChanceAGlitch', { localize: true });
            return false;
        }

        if (this.hasPushTheLimit || this.hasSecondChance) {
            ui.notifications?.warn('SR6.Warnings.CantSpendMulitplePointsOfEdge', { localize: true });
            return false;
        }

        return true;
    }

    /**
     * Determine if this test can use push the limit rules
     *
     * Use this property to check if a existing test can use this edge rule.
     *
     * SR5#56.
     */
    get canPushTheLimit(): boolean {
        if (this.hasPushTheLimit || this.hasSecondChance) {
            ui.notifications?.warn('SR6.Warnings.CantSpendMulitplePointsOfEdge', { localize: true });
            return false;
        }

        return true;
    }

    /**
     * Handle Edge rule 'push the limit', either adding edge before or after casting
     * and exploding sixes for either all dice or only edge dice.
     *
     * Check edge rules on SR5#56.
     *
     * If called without push the limit, all modifiers for it will be removed.
     */
    applyPushTheLimit() {
        if (!this.actor) return;

        const parts = new PartsList(this.pool.mod);

        // During the lifetime of a test (dialog/recasting) the user might want to remove push the limit again.
        if (!this.hasPushTheLimit) {
            parts.removePart('SR6.PushTheLimit');
            return;
        }

        // Edge will be applied differently for when the test has been already been cast or not.
        // Exploding dice will be handled during normal roll creation.
        const edge = this.actor.getEdge().value;
        parts.addUniquePart('SR6.PushTheLimit', edge, true);

        // Before casting edge will be part of the whole dice pool and that pool will explode.
        if (!this.evaluated) return;

        // After casting use a separate roll, as only those will be rolled again and explode.
        const explodeDice = true;
        const formula = this.buildFormula(edge, explodeDice);
        const roll = new SR6Roll(formula);
        this.rolls.push(roll);
    }

    /**
     * Handle Edge rules for 'second chance'.
     *
     * If called without second chance, all modifiers for it will be removed.
     */
    applySecondChance() {
        if (!this.actor) return;

        const parts = new PartsList(this.pool.mod);

        // During test lifetime (dialog/recasting) the user might want to remove second chance again.
        if (!this.hasSecondChance) {
            parts.removePart('SR6.SecondChance');
            return;
        }

        // Since only ONE edge can be spent on a test, last roll will either be a
        // - the original dice pool
        // - an extending dice pool
        const lastRoll = this.rolls[this.rolls.length - 1];
        const dice = lastRoll.poolThrown - lastRoll.hits;
        if (dice <= 0) {
            ui.notifications?.warn('SR6.Warnings.CantSecondChanceWithoutNoneHits', { localize: true });
            return this;
        }

        // Apply second chance modifiers.
        // Overwrite existing, as only ONE edge per test is allowed, therefore stacking is not possible.
        parts.addUniquePart('SR6.SecondChance', dice, true);

        // Add new dice as fully separate Roll.
        const formula = `${dice}d6`;
        const roll = new SR6Roll(formula);
        this.rolls.push(roll);
    }

    /**
     * Make sure ALL resources needed are available.
     *
     * This is checked before any resources are consumed.
     *
     * @returns true when enough resources are available to consume
     */
    canConsumeDocumentResources(): boolean {
        // No actor present? Nothing to consume...
        if (!this.actor) return true;

        // Edge consumption.
        if (this.hasPushTheLimit || this.hasSecondChance) {
            if (this.actor.getEdge().uses <= 0) {
                ui.notifications?.error(game.i18n.localize('SR6.MissingRessource.Edge'));
                return false;
            }
        }

        // Check if this is a major or minor action and if the actor has enough actions
        if (this.data.action && this.data.action.type) {
            // Only proceed if the actor has initiative
            if (!this.actor.system.initiative) {
                console.log(`Shadowrun 6e | Actor ${this.actor.name} has no initiative data`);
                return true; // Allow the test to proceed, but it won't spend an action
            }

            const actions = this.actor.system.initiative.actions;
            if (!actions) return true; // Allow the test to proceed, but it won't spend an action

            if (this.data.action.type === 'major') {
                // Check if the actor has at least 1 major action
                if (actions.major < 1) {
                    ui.notifications?.warn(game.i18n.format('SR6.NoMajorActionsLeft', {
                        name: this.actor.name
                    }));
                    return false;
                }
            } else if (this.data.action.type === 'minor') {
                // Check if the actor has at least 1 minor action
                if (actions.minor < 1) {
                    ui.notifications?.warn(game.i18n.format('SR6.NoMinorActionsLeft', {
                        name: this.actor.name
                    }));
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Handle resulting resource consumption caused by this test.
     *
     * @return true when the resources could be consumed in appropriate amounts.
     */
    async consumeDocumentRessources(): Promise<boolean> {
        if (!this.actor) return true;

        // Edge consumption.
        if (this.hasPushTheLimit || this.hasSecondChance) {
            await this.actor.useEdge();
        }

        // Check if this is a major or minor action and spend it if needed
        if (this.data.action && this.data.action.type) {
            if (this.data.action.type === 'major') {
                console.log(`Shadowrun 6e | Test is a major action, attempting to spend a major action for ${this.actor.name}`);
                // Attempt to spend a major action
                const success = await this.actor.spendMajorAction();

                // If the actor has no major actions left, don't proceed with the test
                if (!success) {
                    console.log(`Shadowrun 6e | ${this.actor.name} has no major actions left, canceling test`);
                    return false;
                }
                console.log(`Shadowrun 6e | Successfully spent a major action for ${this.actor.name}`);
            } else if (this.data.action.type === 'minor') {
                console.log(`Shadowrun 6e | Test is a minor action, attempting to spend a minor action for ${this.actor.name}`);
                // Attempt to spend a minor action
                const success = await this.actor.spendMinorAction();

                // If the actor has no minor actions left, don't proceed with the test
                if (!success) {
                    console.log(`Shadowrun 6e | ${this.actor.name} has no minor actions left, canceling test`);
                    return false;
                }
                console.log(`Shadowrun 6e | Successfully spent a minor action for ${this.actor.name}`);
            }
        }

        return true;
    }

    /**
    * Consume resources according to whats configured for this world.
    * @returns true when the test can process
    */
    async consumeDocumentRessoucesWhenNeeded(): Promise<boolean> {
        const mustHaveRessouces = game.settings.get(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest);
        // Make sure to nest canConsume to avoid unnecessary warnings.
        if (mustHaveRessouces) {
            if (!this.canConsumeDocumentResources()) return false;
        }

        return await this.consumeDocumentRessources();
    }

    /**
     * Executing a test will start all behaviors necessary to:
     * - Calculate its values
     * - Show and handle a user facing test dialog
     * - Render and show a resulting test message
     * - Evaluate all it's roles and consumption of items used
     * - Trigger resulting methods for all results, including success and failure
     *
     * Implementing classes should seek to change out methods used here, or within those methods, to alter test
     * behavior to their needs.
     *
     * When execute methods promise resolves this test and its chain is completed.
     *
     * NOTE: Currently none of these methods trigger Foundry hooks.
     */
    async execute(): Promise<this> {
        await this.populateTests();
        await this.populateDocuments();

        this.prepareTestCategories();

        // Effects need to be applied before any values are calculated.
        await this.effects.applyAllEffects();

        await this.prepareDocumentData();

        // Initial base value preparation will show default result without any user input.
        this.prepareBaseValues();
        this.calculateBaseValues();
        this.validateBaseValues();

        // Allow user to change details.
        const userConsented = await this.showDialog();
        if (!userConsented) return this;

        // Check if actor has all needed resources to even test.
        const actorConsumedResources = await this.consumeDocumentRessoucesWhenNeeded();
        if (!actorConsumedResources) return this;

        this.createRoll();

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
        await this.afterTestComplete();

        return this;
    }

    /**
     * Handle Edge rule 'second chance' within this test according to SR5#56
     *
     * This is a execute method alternative.
     */
    async executeWithSecondChance(): Promise<this> {
        console.debug(`Shadowrun 6e | ${this.constructor.name} will apply second chance rules`);

        if (!this.data.sourceActorUuid) {
            ui.notifications?.warn('SR6.Warnings.EdgeRulesCantBeAppliedOnTestsWithoutAnActor', { localize: true });
            return this;
        }
        if (!this.canSecondChance) return this;

        // Fetch documents.
        await this.populateDocuments();

        //  Trigger edge consumption.
        this.data.secondChance = true;
        this.applySecondChance();

        // Can't use normal #execute as not all general testing flow are needed.
        this.calculateBaseValues();
        this.validateBaseValues();

        const actorConsumedResources = await this.consumeDocumentRessoucesWhenNeeded();
        if (!actorConsumedResources) return this;

        // Remove second chance to avoid edge consumption on any kind of re-rolls.
        this.data.secondChance = false;

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
        await this.afterTestComplete();

        return this;
    }

    /**
     * A execute method alternative to handle Edge rule 'push the limit' within this test.
     */
    async executeWithPushTheLimit(): Promise<this> {
        console.debug(`Shadowrun 6e | ${this.constructor.name} will push the limit rules`);

        if (!this.data.sourceActorUuid) {
            ui.notifications?.warn('SR6.Warnings.EdgeRulesCantBeAppliedOnTestsWithoutAnActor', { localize: true });
            return this;
        }
        if (!this.canPushTheLimit) return this;

        // Fetch documents.
        await this.populateDocuments();

        this.data.pushTheLimit = true;
        this.applyPushTheLimit();

        // Can't use normal #execute as not all general testing flow are needed.
        this.calculateBaseValues();
        this.validateBaseValues();

        const actorConsumedResources = await this.consumeDocumentRessoucesWhenNeeded();
        if (!actorConsumedResources) return this;

        // Keep push the limit active, to have remove limit during derived value calculation.
        await this.evaluate();
        await this.processResults();

        // Remove push the limit to avoid edge consumption on any kind of re-rolls.
        this.data.pushTheLimit = false;

        await this.toMessage();
        await this.afterTestComplete();

        return this;
    }


    /**
     * Allow subclasses to override behavior after a test has finished.
     *
     * This can be used to alter values after a test is over.
     */
    async processResults() {
        const edgeQualities = new Map([
            ['Attribute Mastery: Agility', 'agility'],
            ['Attribute Mastery: Body', 'body'],
            ['Attribute Mastery: Charisma', 'charisma'],
            ['Attribute Mastery: Intuition', 'intuition'],
            ['Attribute Mastery: Reaction', 'reaction'],
            ['Attribute Mastery: Strength', 'strength'],
            ['Attribute Mastery: Willpower', 'willpower'],
            ['Analytical Mind', 'logic']
        ]);
        //['Attribute Mastery','Analytical Mind'];
        const processQuality = async (quality) =>{

            if(edgeQualities.has(quality.name)) {
                const stat = edgeQualities.get(quality.name);
                if(this.data.action.attribute !== stat && this.data.action.attribute2 !== stat) {
                    console.log(`Shadowrun 6e | ${quality.name} does not apply to this test`);
                    return;
                }
                if(this.actor.system.combatRoundTracker.edgeGained >= 2) {
                    this.data.edgeGain = {gained: true, discarded: true, effect: "No more edge may be gained this round."}
                    return;
                } else if (this.actor?.system.attributes.edge.uses >= 7) {
                    this.data.edgeGain = {gained: true, discarded: true, effect: "Edge pool is full"}
                    return;
                }
                this.data.edgeGain = {gained: true, discarded: false, effect: quality.name}
                await this.actor.update({
                    'system.combatRoundTracker.edgeGained': this.actor?.system.combatRoundTracker.edgeGained + 1,
                    'system.attributes.edge.uses': this.actor?.system.attributes.edge.uses + 1
                })
            }
        }

        this.actor?.items.filter(item => item.type === 'quality').forEach(quality => processQuality(quality));


        if (this.success) {
            await this.processSuccess();
        } else {
            await this.processFailure();
        }
    }

    /**
     * Allow subclasses to override behavior after a successful test result.
     *
     * This can be used to alter values after a test succeeded.
     * @override
     */
    async processSuccess() { }

    /**
     * Allow subclasses to override behavior after a failure test result
     *
     * This can be used to alter values after a test failed.
     * @override
     */
    async processFailure() { }

    /**
     * Allow subclasses to override behavior after a test is fully done. This will be called after processResults
     * and allows for additional processes to be triggered that don't affect this test itself.
     *
     * This can be used to trigger other processes like followup tests or saving values.
     */
    async afterTestComplete() {
        console.debug(`SR6: Elysium | Test ${this.constructor.name} completed.`, this);

        if (this.success) {
            await this.afterSuccess();
        } else {
            await this.afterFailure();
        }

        // Check if this is a matrix action and if the actor has an active hacking program
        await this.checkMatrixActionOverwatch();

        if (this.autoExecuteFollowupTest) {
            await this.executeFollowUpTest();
        }

        if (this.extended) {
            await this.executeAsExtended();
        }
    }

    /**
     * Check if this is a matrix action and if the actor has an active hacking program
     * If both conditions are met, increment the overwatch score by 1
     * Also check if this is an illegal matrix action and add overwatch equal to hits scored against the actor
     */
    async checkMatrixActionOverwatch() {
        // Only proceed if we have an actor
        if (!this.actor) return;

        // Check if this is a matrix action
        const isMatrixAction = this.data.action?.categories &&
                              MatrixRules.isMatrixAction(this.data.action.categories);
        if (!isMatrixAction) return;

        let totalOverwatchAdded = 0;
        let overwatchReasons = [];

        // Check if the actor has an active hacking program
        if (this.actor.hasActiveHackingProgram()) {
            // Increment overwatch score by 1
            totalOverwatchAdded += 1;
            overwatchReasons.push(game.i18n.localize('SR6.MatrixAction.HackingProgramReason'));
        }

        // Check if this is an illegal matrix action
        const isIllegalAction = this.data.action &&
                               MatrixRules.isIllegalMatrixAction(this.data.action);

        // If this is an illegal action and it's an opposed test, add overwatch equal to hits scored against the actor
        if (isIllegalAction && this.opposed) {
            // For opposed tests, we need to wait for the opposed test to complete to get the hits against
            // This will be handled in the OpposedTest class
        } else if (isIllegalAction) {
            // For non-opposed illegal matrix actions, add 1 overwatch point
            totalOverwatchAdded += 1;
            overwatchReasons.push(game.i18n.localize('SR6.MatrixAction.IllegalActionReason'));
        }

        // Apply the total overwatch if any was accrued
        if (totalOverwatchAdded > 0) {
            const currentOS = this.actor.getOverwatchScore();
            await this.actor.setOverwatchScore(currentOS + totalOverwatchAdded);

            // Notify the user
            ui.notifications?.info(game.i18n.format('SR6.MatrixAction.OverwatchAccrued', {
                name: this.actor.name,
                amount: totalOverwatchAdded,
                reasons: overwatchReasons.join(', ')
            }));

            console.debug(`Shadowrun 6e | Added ${totalOverwatchAdded} Overwatch Score to ${this.actor.name} for matrix action`);
        }
    }

    /**
     * Allow subclasses to override followup behavior after a successful test result
     * @override
     */
    async afterSuccess() {

        // When an unopposed test succeeds, the test documents targeted effects can be applied
        if (this.opposing) return;
        if (this.opposed) return;

        for (const target of this.targets) {
            if (target.actor === null) continue;
            await this.effects.createTargetActorEffects(target.actor);
        }
    }

    /**
     * Allow subclasses to override followup behavior after a failed test result
     * @override
     */
    async afterFailure() { }

    /**
     * Reroll a specified number of failures
     * @param failuresToReroll The number of failures to reroll
     */
    async rerollFailures(failuresToReroll: number): Promise<this> {
        console.log(`Shadowrun 6e | Rerolling ${failuresToReroll} failures for ${this.actor?.name || 'unknown actor'}`);
        console.log('Shadowrun 6e | Test data before reroll:', this.data);
        console.log('Shadowrun 6e | Original rolls:', this.rolls);

        // We'll allow rerolling even if there's no actor
        if (!this.actor) {
            console.warn('Shadowrun 6e | No actor found, but continuing with reroll');
        }
        if (this.data.rerolledFailures) {
            console.warn('Shadowrun 6e | Cannot reroll failures: Already rerolled');
            return this;
        } // Prevent multiple rerolls

        // Count the total number of failures across all rolls
        const totalFailures = this.rolls.reduce((failures, roll) => {
            // Count dice that are not successes (not 5 or 6)
            const rollFailures = roll.sides.filter(side => !SR.die.success.includes(side)).length;
            console.log(`Shadowrun 6e | Roll ${roll.formula} has ${rollFailures} failures:`, roll.sides);
            return failures + rollFailures;
        }, 0);

        console.log(`Shadowrun 6e | Total failures found: ${totalFailures}`);

        // Limit the number of failures to reroll to the total number of failures
        const actualFailuresToReroll = Math.min(failuresToReroll, totalFailures);
        console.log(`Shadowrun 6e | Actual failures to reroll: ${actualFailuresToReroll}`);

        if (actualFailuresToReroll <= 0) {
            console.warn('Shadowrun 6e | No failures to reroll');
            ui.notifications?.warn(game.i18n.localize('SR6.NoFailuresToReroll'));
            return this;
        }

        // Create a new roll for the rerolled failures
        const formula = this.buildFormula(actualFailuresToReroll, false);
        console.log(`Shadowrun 6e | Creating new roll with formula: ${formula}`);
        const roll = new SR6Roll(formula);

        // Store the rerolled failures roll
        this.data.rerolledFailuresRolls = [roll];
        this.data.rerolledFailuresCount = actualFailuresToReroll;
        this.data.rerolledFailures = true;
        console.log('Shadowrun 6e | Stored rerolled failures in test data');

        // Add these properties to the test object itself for template access
        this.rerolledFailuresRolls = [roll];
        this.rerolledFailures = true;
        this.rerolledFailuresCount = actualFailuresToReroll;
        console.log('Shadowrun 6e | Added rerolled failures properties to test object');

        // Make sure the test has a messageUuid for saving later
        if (!this.data.messageUuid && this.data.previousMessageId) {
            this.data.messageUuid = this.data.previousMessageId;
            console.log(`Shadowrun 6e | Using previousMessageId as messageUuid: ${this.data.messageUuid}`);
        }

        // Evaluate the roll
        console.log('Shadowrun 6e | Evaluating rerolled failures roll...');
        await roll.evaluate({async: true});
        console.log('Shadowrun 6e | Rerolled failures roll results:', roll.sides);
        console.log('Shadowrun 6e | Rerolled failures roll hits:', roll.hits);
        console.log('Shadowrun 6e | Rerolled failures roll total:', roll.total);

        // Show dice animation if DiceSoNice is enabled
        try {
            // @ts-ignore
            if (game.dice3d) {
                console.log('Shadowrun 6e | Showing DiceSoNice animation for rerolled failures');
                // @ts-ignore
                await game.dice3d.showForRoll(roll, game.user, true, null, false);
            }
        } catch (error) {
            console.error('Shadowrun 6e | Error showing DiceSoNice animation:', error);
        }

        // Calculate the number of hits from the rerolled failures
        const rerolledHits = roll.total;
        this.rerolledFailuresHits = rerolledHits;
        this.data.rerolledFailuresHits = rerolledHits;
        console.log(`Shadowrun 6e | Rerolled failures produced ${rerolledHits} hits`);

        // Add the new roll to the rolls array
        this.rolls.push(roll);
        console.log('Shadowrun 6e | Added rerolled failures roll to rolls array:', this.rolls);

        // Recalculate hits
        this.calculateDerivedValues();
        console.log('Shadowrun 6e | Recalculated derived values:', this.data.values);

        // Make sure the rerolled failures rolls are properly set in the data
        // This is important for the template to access them
        this.data.rerolledFailuresRolls = [roll];
        console.log('Shadowrun 6e | Ensured rerolledFailuresRolls is set in data:', this.data.rerolledFailuresRolls);

        // Update the message
        console.log('Shadowrun 6e | Saving rerolled failures to message:', this.data.messageUuid);
        await this.saveToMessage();

        // Force a re-render of the message
        if (this.data.messageUuid) {
            const message = await fromUuid(this.data.messageUuid);
            if (message) {
                console.log('Shadowrun 6e | Re-rendering message:', message.id);
                await message.render(true);
            }
        }

        return this;
    }



    /**
     * Allow a test to determine if it's follow up tests should auto cast after test completion.
     *
     * This could be set to false to allow for tests to NOT have an immediate auto cast, due to
     * current user casting and the user casting the follow differing.
     */
    get autoExecuteFollowupTest() {
        return true;
    }

    /**
     * Depending on the action configuration execute a followup test.
     */
    async executeFollowUpTest() {
        const test = await TestCreator.fromFollowupTest(this, this.data.options);
        if (!test) return;
        await test.execute();

    }

    /**
     * Should this test be an extended test, re-execute it until it can't be anymore.
     *
     * The first roll of extended test will use normal #execute, while the extended rolls
     * will pass through this, both for the action and chat message extension flow.
     */
    async executeAsExtended() {
        if (!this.canBeExtended) return;

        const data = foundry.utils.duplicate(this.data);

        // No extension possible, if test type / class is unknown.
        if (!data.type) return;

        // Apply the extended modifier according the current iteration
        const pool = new PartsList(data.pool.mod);

        const currentModifierValue = pool.getPartValue('SR6.ExtendedTest') || 0;
        const nextModifierValue = TestRules.calcNextExtendedModifier(currentModifierValue);

        // A pool could be overwritten or not.
        if (data.pool.override) {
            data.pool.override.value = Math.max(data.pool.override.value - 1, 0);
        } else {
            pool.addUniquePart('SR6.ExtendedTest', nextModifierValue);
        }

        Helpers.calcTotal(data.pool, { min: 0 });

        if (!TestRules.canExtendTest(data.pool.value, this.threshold.value, this.extendedHits.value)) {
            return ui.notifications?.warn('SR6.Warnings.CantExtendTestFurther', { localize: true });
        }

        // Fetch original tests documents.
        await this.populateDocuments();

        // Create a new test instance of the same type.
        const testCls = TestCreator._getTestClass(data.type);
        if (!testCls) return;
        // The new test will be incomplete.
        data.evaluated = false;
        const test = new testCls(data, { actor: this.actor, item: this.item }, this.data.options);

        // Remove previous edge usage.
        test.data.pushTheLimit = false;
        test.applyPushTheLimit();
        test.data.secondChance = false;
        test.applySecondChance();

        // Mark test as extended to get iterative execution.
        if (!test.extended) {
            test.data.extended = true;
            test.calculateExtendedHits();
        }

        // Mark this roll as an extended roll.
        // This allows execution to determine if data needs to be prepared for the first roll or not.
        test.data.extendedRoll = true;

        await test.execute();

        return test;
    }

    /**
     * DiceSoNice must be implemented locally to avoid showing dice on gmOnlyContent throws while also using
     * FoundryVTT ChatMessage of type roll for their content visibility behavior.
     *
     * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/Integration
     */
    async rollDiceSoNice() {
        // @ts-expect-error
        if (!game.dice3d || !game.user || !game.users) return;

        console.debug('SR6: Elysium | Initiating DiceSoNice throw');

        // Only roll the last dice rolled.
        // This necessary when a test has been recast with second chance, and should only the re-rolled dice instead
        // of all.
        const roll = this.rolls[this.rolls.length - 1];

        // Limit users to show dice to...
        let whisper: User[] | null = null;
        // ...for gmOnlyContent check permissions
        if (this.actor && GmOnlyMessageContentFlow.applyGmOnlyContent(this.actor)) {
            // @ts-expect-error TODO: foundry-vtt-types v10
            whisper = game.users.filter(user => this.actor?.testUserPermission(user, 'OWNER'));
        }
        // ...for rollMode include GM when GM roll
        if (this.data.options?.rollMode === 'gmroll' || this.data.options?.rollMode === "blindroll") {
            whisper = whisper || [];
            whisper = [...game.users.filter(user => user.isGM), ...whisper];
        }

        // Don't show dice to a user casting blind.
        const blind = this.data.options?.rollMode === 'blindroll';
        const synchronize = this.data.options?.rollMode === 'publicroll';

        // @ts-expect-error
        game.dice3d.showForRoll(roll, game.user, synchronize, whisper, blind, this.data.messageUuid);
    }

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage | undefined> {
        if (!this.data.options?.showMessage) return;

        // Prepare message content.
        const templateData = await this._prepareMessageTemplateData();
        const content = await renderTemplate(this._chatMessageTemplate, templateData);
        // Prepare the actual message.
        const messageData = await this._prepareMessageData(content);
        const options = { rollMode: this._rollMode };

        //@ts-expect-error // TODO: foundry-vtt-types v10
        const message = await ChatMessage.create(messageData, options);

        if (!message) return;

        // Store message id for future use.
        this.data.messageUuid = message.uuid;
        await this.saveToMessage();

        await this.rollDiceSoNice();

        return message;
    }

    /**
     * Prepare chat message content data for this success test card.
     *
     * @returns Chat Message template data.
     *
     * TODO: Add template data typing.
     */
    async _prepareMessageTemplateData() {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length >= 1 ? linkedTokens[0] : undefined;


        console.log('SR6: this.data keys:', Object.keys(this.data));

        // Get action type and initiative timing information if available
        let actionType = '';
        let initiativeTiming = '';

        if (this.data.action && this.data.action.type) {
            actionType = this.data.action.type;
            initiativeTiming = this.data.action.initiative_timing || 'none';
        }

        // Debug rerolled failures data
        if (this.data.rerolledFailures) {
            console.log('Shadowrun 6e | Preparing message template data with rerolled failures');
            console.log('Shadowrun 6e | rerolledFailures:', this.data.rerolledFailures);
            console.log('Shadowrun 6e | rerolledFailuresRolls:', this.data.rerolledFailuresRolls);
            console.log('Shadowrun 6e | rerolledFailuresCount:', this.data.rerolledFailuresCount);
            console.log('Shadowrun 6e | rerolledFailuresHits:', this.data.rerolledFailuresHits);
        }

        // Get the message ID if available
        const message = this.data.messageUuid ? await fromUuid(this.data.messageUuid) : null;

        // Debug rerolled failures data
        if (this.data.rerolledFailures) {
            console.log('Shadowrun 6e | Preparing message template data with rerolled failures');
            console.log('Shadowrun 6e | rerolledFailures:', this.data.rerolledFailures);
            console.log('Shadowrun 6e | rerolledFailuresRolls:', this.data.rerolledFailuresRolls);
            console.log('Shadowrun 6e | rerolledFailuresCount:', this.data.rerolledFailuresCount);
            console.log('Shadowrun 6e | rerolledFailuresHits:', this.data.rerolledFailuresHits);
            console.log('Shadowrun 6e | this.rerolledFailures:', this.rerolledFailures);
            console.log('Shadowrun 6e | this.rerolledFailuresRolls:', this.rerolledFailuresRolls);
        }

        // Debug the rolls to see what's in them
        console.log('Shadowrun 6e | Rolls in _prepareMessageTemplateData:', this.rolls);
        if (this.data.rerolledFailuresRolls) {
            console.log('Shadowrun 6e | Rerolled failures rolls:', this.data.rerolledFailuresRolls);
        }

        // Debug the test data before creating the test object
        console.log('Shadowrun 6e | Test data in _prepareMessageTemplateData:', this.data);

        // Create a test object with all the necessary properties for the template
        const testObject = {
            data: this.data,
            type: this.constructor.name,
            // Add properties from the test instance
            rolls: this.rolls,
            rerolledFailures: this.data.rerolledFailures,
            rerolledFailuresRolls: this.data.rerolledFailuresRolls ? this.data.rerolledFailuresRolls.map(roll => ({
                sides: roll.sides,
                formula: roll.formula,
                total: roll.total,
                hits: roll.hits
            })) : [],
            rerolledFailuresCount: this.data.rerolledFailuresCount,
            rerolledFailuresHits: this.data.rerolledFailuresHits,
            // Add computed properties
            displayHits: this.displayHits,
            // Add raw hits from the roll for debugging
            rawHits: this.hits.base,

            // Debug the test data
            debug_data: JSON.stringify(this.data),
            pool: this.pool,
            hits: this.hits,
            threshold: this.threshold,
            limit: this.limit,
            netHits: this.netHits,
            extendedHits: this.extendedHits,
            glitches: this.glitches,
            hasThreshold: this.hasThreshold,
            hasLimit: this.hasLimit,
            canSucceed: this.canSucceed,
            canFail: this.canFail,
            success: this.success,
            failure: this.failure,
            glitched: this.glitched,
            criticalGlitched: this.criticalGlitched,
            showSuccessLabel: this.showSuccessLabel,
            successLabel: this.successLabel,
            failureLabel: this.failureLabel,
            usingManualRoll: this.usingManualRoll,
            hasAction: this.hasAction,
            code: this.code,
            extended: this.extended,
            opposing: this.opposing,
            opposed: this.opposed,
            autoSuccess: this.autoSuccess,
            earnedEdge: this.earnedEdge,
            edgeEarnedReason: this.edgeEarnedReason,
            cappedEdge: this.cappedEdge,
            hasDamage: this.hasDamage
        };

        // Get ammo description for weapon attacks
        let ammoDescription = '';
        let ammoName = '';

        if (this.item?.isWeapon) {
            const equippedAmmo = this.item.getEquippedAmmo();
            if (equippedAmmo) {
                ammoName = equippedAmmo.name || '';
                if (equippedAmmo.system.description?.value) {
                    ammoDescription = await TextEditor.enrichHTML(equippedAmmo.system.description.value, {});
                }
            }
        }

        return {
            title: this.data.title,
            test: testObject,
            // Add isGM flag to control visibility of dice pools and rolls
            isGM: game.user.isGM,
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                actor: this.actor,
                token: token
            },
            item: this.item,
            // Add the message for the reroll button
            message: message,
            // Add action type and initiative timing information
            actionType: actionType,
            actionTypeLabel: actionType ? game.i18n.localize(SR6.actionTypes[actionType]) : '',
            initiativeTiming: initiativeTiming,
            initiativeTimingLabel: initiativeTiming ? game.i18n.localize(SR6.initiativeTiming[initiativeTiming]) : '',
            opposedActions: this._prepareOpposedActionsTemplateData(),
            followupActions: this._prepareFollowupActionsTemplateData(),
            resultActions: this._prepareResultActionsTemplateData(),
            previewTemplate: this._canPlaceBlastTemplate,
            showDescription: this._canShowDescription,
            description: await this.item?.getChatData() || '',
            // Add ammo description for weapon attacks
            ammoDescription: ammoDescription,
            ammoName: ammoName,
            // Some message segments are only meant for the gm, when the gm is the one creating the message.
            // When this test doesn't use an actor, don't worry about hiding anything.
            applyGmOnlyContent: GmOnlyMessageContentFlow.applyGmOnlyContent(this.actor),

            // Effects that should be shown in this tests message for manual drag & drop application.
            effects: [] as SR6ActiveEffect[],
            earnedEdge: this.earnedEdge,
            edgeEarnedReason: this.edgeEarnedReason
        }
    }

    /**
     * Indicate if this test can be used to show the item description.
     */
    get _canShowDescription(): boolean {
        return true;
    }

    /**
     * Indicate if this test can be used to place a blast template using the shown chat message.
     *
     * This is indicated by the source items ability to cause an area of effect blast and which kind
     * of test is used.
     */
    get _canPlaceBlastTemplate(): boolean {
        return this.item?.hasBlastTemplate || false;
    }

    /**
     * This class should be used for the opposing test implementation.
     */
    get _opposedTestClass(): any | undefined {
        if (!this.data.opposed || !this.data.opposed.test) return;
        return TestCreator._getTestClass(this.data.opposed.test);
    }

    /**
     * Prepare opposed test action buttons.
     *
     * Currently, one opposed action is supported, however the template
     * is prepared to support multiple action buttons.
     */
    _prepareOpposedActionsTemplateData() {
        const testCls = this._opposedTestClass;
        // No opposing test configured. Nothing to build.
        if (!testCls) return [];

        const action = {
            // Store the test implementation registration name.
            test: testCls.name,
            label: testCls.label
        };

        // Show the flat dice pool modifier on the chat action.
        if (this.data.opposed.mod) {
            action.label += ` ${this.data.opposed.mod}`;
        }

        return [action]
    }

    /**
     * Prepare followup actions a test allows. These are actions
     * meant to be taken following completion of this test.
     */
    _prepareFollowupActionsTemplateData(): Shadowrun.FollowupAction[] {
        const testCls = TestCreator._getTestClass(this.data.action.followed.test);
        if (!testCls) return [];
        return [{ label: testCls.label }]
    }

    /**
     * Prepare result action buttons
     */
    _prepareResultActionsTemplateData(): ResultActionData[] {
        const actions: ResultActionData[] = [];
        const actionResultData = this.results;
        if (!actionResultData) return actions;

        if (actionResultData.success.matrix.placeMarks) {
            actions.push({
                action: 'placeMarks',
                label: 'SR6.PlaceMarks',
                value: ''
            });
        }

        return actions;
    }

    /**
     * What ChatMessage rollMode is this test supposed to use?
     */
    get _rollMode(): string {
        return this.data.options?.rollMode as string ?? game.settings.get('core', 'rollmode');
    }

    /**
     * Prepare chat message data for this success test card.
     *
     * @param content Pre rendered template content.
     */
    async _prepareMessageData(content: string) {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const actor = this.actor?.id;
        const alias = game.user?.name;

        const formula = `0d6`;
        const roll = new SR6Roll(formula);
        // evaluation is necessary for Roll DataModel validation.
        await roll.evaluate();

        const messageData = {
            user: game.user?.id,
            // Use type roll, for Foundry built in content visibility.
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            speaker: {
                actor,
                alias,
                token
            },
            roll,
            content,
            // Manually build flag data to give renderChatMessage hook flag access.
            // This test data is needed for all subsequent testing based on this chat messages.
            flags: {
                // Add test data to message to allow ChatMessage hooks to access it.
                [SYSTEM_NAME]: {[FLAGS.Test]: this.toJSON()},
                'core.canPopout': true
            },
            sound: CONFIG.sounds.dice,
        }

        // Instead of manually applying whisper ids, let Foundry do it.
        // @ts-expect-error TODO: Types Provide proper SuccessTestData and SuccessTestOptions
        ChatMessage.applyRollMode(messageData, this._rollMode);

        return messageData;
    }

    /**
     * Save this test to the given message uuid
     * @param uuid
     */
    async saveToMessage(uuid: string | undefined = this.data.messageUuid) {
        if (!uuid) {
            console.warn('Shadowrun 6e | Cannot save to message: No message UUID');

            // Try to get the message ID from the chat message element
            const chatMessage = $('.chat-message.selected');
            if (chatMessage.length > 0) {
                const messageId = chatMessage.data('messageId');
                if (messageId) {
                    uuid = `ChatMessage.${messageId}`;
                    console.log(`Shadowrun 6e | Found message ID from selected chat message: ${messageId}`);
                    this.data.messageUuid = uuid;
                }
            }

            if (!uuid) return;
        }

        console.log(`Shadowrun 6e | Saving test to message: ${uuid}`);
        const message = await fromUuid(uuid);

        if (!message) {
            console.warn(`Shadowrun 6e | Cannot save to message: Message not found for UUID ${uuid}`);
            return;
        }

        // Log the test data before saving
        if (this.data.rerolledFailures) {
            console.log('Shadowrun 6e | Test data before saving to message:');
            console.log('Shadowrun 6e | rerolledFailures:', this.data.rerolledFailures);
            console.log('Shadowrun 6e | rerolledFailuresRolls:', this.data.rerolledFailuresRolls);
            console.log('Shadowrun 6e | rerolledFailuresCount:', this.data.rerolledFailuresCount);
            console.log('Shadowrun 6e | rerolledFailuresHits:', this.data.rerolledFailuresHits);
        }

        const testData = this.toJSON();
        console.log('Shadowrun 6e | Test data to save:', testData);

        await message.setFlag(SYSTEM_NAME, FLAGS.Test, testData);
        console.log('Shadowrun 6e | Test saved to message');

        // Force a re-render of the message
        message.render(true);
    }

    /**
     * Register listeners for ChatMessage html created by a SuccessTest.
     *
     * This listener needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     *
     * @param message
     * @param html
     * @param data
     */
    static async chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.show-roll').on('click', this._chatToggleCardRolls);
        html.find('.show-description').on('click', this._chatToggleCardDescription);
        html.find('.chat-document-link').on('click', Helpers.renderEntityLinkSheet);
        html.find('.place-template').on('click', this._placeItemBlastZoneTemplate);
        html.find('.result-action').on('click', this._castResultAction);
        html.find('.chat-select-link').on('click', this._selectSceneToken);
        html.find('.test-action').on('click', this._castTestAction);
        html.find('.reroll-failures').on('click', this._rerollFailures);

        DamageApplicationFlow.handleRenderChatMessage(message, html, data);

        await GmOnlyMessageContentFlow.chatMessageListeners(message, html, data);
    }


    /**
     * Select a Token on the current scene based on the link id.
     * @params event Any user PointerEvent
    */
    static async _selectSceneToken(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!game || !game.ready || !canvas || !canvas.ready) return;

        const selectLink = $(event.currentTarget);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens?.get(tokenId);

        if (token && token instanceof Token) {
            token.control();
        } else {
            ui.notifications?.warn(game.i18n.localize('SR6.NoSelectableToken'))
        }
    }

    /**
     * Cast a item action from a chat message.
     *
     * @param event Any pointer event
     */
    static async _castTestAction(event) {
        event.preventDefault();

        const element = $(event.currentTarget);
        // Grab item uuid or fallback to empty string for foundry
        const uuid = element.data('uuid') ?? '';
        const item = await fromUuid(uuid) as SR6Item;

        if (!item) return console.error("Shadowrun 6e | Item doesn't exist for uuid", uuid);

        item.castAction(event);
    }

    /**
     * Handle the reroll failures button click
     * @param event The click event
     */
    static async _rerollFailures(event) {
        event.preventDefault();
        console.log('Shadowrun 6e | Reroll failures button clicked');

        const button = $(event.currentTarget);
        const chatMessage = button.closest('.chat-message');
        console.log('Shadowrun 6e | Chat message element:', chatMessage);
        const messageId = chatMessage.data('messageId');
        console.log(`Shadowrun 6e | Message ID: ${messageId}`);

        if (!messageId) {
            console.error('Shadowrun 6e | No message ID found');
            ui.notifications?.error(game.i18n.localize('SR6.Errors.NoMessageId'));
            return;
        }

        // Get the test from the message
        console.log(`Shadowrun 6e | Getting test from message: ${messageId}`);
        const test = await TestCreator.fromMessage(messageId);
        console.log('Shadowrun 6e | Test from message:', test);

        if (!test) {
            console.error('Shadowrun 6e | No test found in message');
            ui.notifications?.error(game.i18n.localize('SR6.Errors.NoTestFound'));
            return;
        }

        // Count the total number of failures across all rolls
        console.log('Shadowrun 6e | Counting failures in rolls:', test.rolls);
        const totalFailures = test.rolls.reduce((failures, roll) => {
            // Count dice that are not successes (not 5 or 6)
            const rollFailures = roll.sides.filter(side => !SR.die.success.includes(side)).length;
            console.log(`Shadowrun 6e | Roll ${roll.formula} has ${rollFailures} failures:`, roll.sides);
            return failures + rollFailures;
        }, 0);
        console.log(`Shadowrun 6e | Total failures found: ${totalFailures}`);

        if (totalFailures <= 0) {
            console.warn('Shadowrun 6e | No failures to reroll');
            ui.notifications?.warn(game.i18n.localize('SR6.NoFailuresToReroll'));
            return;
        }

        // Prompt the user for the number of failures to reroll
        const content = `
            <p>${game.i18n.localize('SR6.EnterNumberOfFailuresToReroll')}</p>
            <div class="form-group">
                <label>${game.i18n.localize('SR6.NumberOfFailuresToReroll')}</label>
                <input type="number" name="failures" value="${totalFailures}" min="1" max="${totalFailures}" />
            </div>
            <p class="note">${game.i18n.format('SR6.TotalFailuresFound', {count: totalFailures})}</p>
        `;

        const dialog = new Dialog({
            title: game.i18n.localize('SR6.RerollFailures'),
            content,
            buttons: {
                reroll: {
                    label: game.i18n.localize('SR6.Reroll'),
                    callback: async (html) => {
                        const input = html.find('input[name="failures"]');
                        const inputValue = input.val() as string;
                        console.log(`Shadowrun 6e | Input value: ${inputValue}`);
                        const failures = parseInt(inputValue) || 0;
                        console.log(`Shadowrun 6e | Parsed failures: ${failures}`);

                        if (failures <= 0) {
                            console.warn('Shadowrun 6e | No failures to reroll from input');
                            ui.notifications?.warn(game.i18n.localize('SR6.NoFailuresToReroll'));
                            return;
                        }

                        // Reroll the failures
                        console.log(`Shadowrun 6e | Calling rerollFailures with ${failures} failures`);
                        await test.rerollFailures(failures);
                        console.log('Shadowrun 6e | Reroll complete');
                    }
                },
                cancel: {
                    label: game.i18n.localize('SR6.Cancel')
                }
            },
            default: 'reroll'
        });

        dialog.render(true);
    }

    static async chatLogListeners(chatLog: ChatLog, html, data) {
        // setup chat listener messages for each message as some need the message context instead of ChatLog context.
        html.find('.chat-message').each(async (index, element) => {
            element = $(element);
            const id = element.data('messageId');
            const message = game.messages?.get(id);
            if (!message) return;

            await this.chatMessageListeners(message, element, message.toObject())
        });
    }

    /**
     * Items with an area of effect will allow users to place a measuring template matching the items blast values.
     *
     * @param event A PointerEvent triggered from anywhere within the chat-card
     */
    static async _placeItemBlastZoneTemplate(event) {
        event.preventDefault();
        event.stopPropagation();

        // Get test data from message.
        const element = $(event.currentTarget);
        const card = element.closest('.chat-message');
        const messageId = card.data('messageId');
        const test = await TestCreator.fromMessage(messageId);
        if (!test) return;

        // Get item used in test
        await test.populateDocuments();

        // Place template based on last used spell force for the item.
        if (!test.item) return;
        const template = Template.fromItem(test.item);
        if (!template) return;
        await template.drawPreview();
    }

    /**
     * Foundry ChatMessage context options (right click) used for all test types.
     * @param html
     * @param options
     */
    static chatMessageContextOptions(html, options) {
        const pushTheLimit = async (li) => {
            const messageId = li.data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 6e | Could not restore test from message');

            await test.executeWithPushTheLimit();
        }

        const secondChance = async (li) => {
            const messageId = li.data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 6e | Could not restore test from message');

            await test.executeWithSecondChance();
        };

        const extendTest = async (li) => {
            const messageId = li.data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 6e | Could not restore test from message');

            if (!test.canBeExtended) {
                return ui.notifications?.warn('SR6.Warnings.CantExtendTest', { localize: true });
            }

            await test.executeAsExtended();
        };

        // Keep Foundry delete option at the context menus bottom.
        const deleteOption = options.pop();

        options.push({
            name: game.i18n.localize('SR6.PushTheLimit'),
            callback: pushTheLimit,
            condition: true,
            icon: '<i class="fas fa-meteor"></i>'
        })

        options.push({
            name: game.i18n.localize('SR6.SecondChance'),
            callback: secondChance,
            condition: true,
            icon: '<i class="fas fa-meteor"></i>'
        });

        options.push({
            name: game.i18n.localize('SR6.Extend'),
            callback: extendTest,
            condition: true,
            icon: '<i class="fas fa-clock"></i>'
        })

        // Reinsert Foundry delete option last.
        options.push(deleteOption);

        return options;
    }

    /**
     * By default, roll results are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     *
     * @param event Called from within a card html element.
     */
    static async _chatToggleCardRolls(event) {
        event.preventDefault();
        event.stopPropagation();

        const card = $(event.currentTarget).closest('.chat-card');
        const element = card.find('.dice-rolls');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * By default, item descriptions are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     * @param event A PointerEvent triggered anywhere from within a chat-card
     */
    static async _chatToggleCardDescription(event) {
        event.preventDefault();
        event.stopPropagation();

        const card = $(event.currentTarget).closest('.chat-card');
        const element = card.find('.card-description');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * A test message initiated an action for a test result, extract information from message and execute action.
     *
     * @param event A PointerEvent by user-interaction
     */
    static async _castResultAction(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget)
        const resultAction = element.data('action');

        const messageId = element.closest('.chat-message').data('messageId');
        const test = await TestCreator.fromMessage(messageId);

        if (!test) return console.error(`SR6: Elysium | Couldn't find both a result action ('${resultAction}') and extract test from message ('${messageId}')`);

        await test.populateDocuments();
        await ActionResultFlow.executeResult(resultAction, test);
    }
}
