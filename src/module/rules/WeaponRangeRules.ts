import { LENGTH_UNIT, SR, SYSTEM_NAME } from '../constants';
import { Helpers } from '../helpers';
import { SR6 } from '../config';
import { RangedWeaponRules } from './RangedWeaponRules';
import { DataDefaults } from '../data/DataDefaults';
import { PartsList } from '../parts/PartsList';
import { DocumentSituationModifiers } from './DocumentSituationModifiers';
import { SuccessTest, SuccessTestData } from '../tests/SuccessTest';
import RangeData = Shadowrun.RangeData;
import WeaponItemData = Shadowrun.WeaponItemData;
import { Translation } from '../utils/strings';

export const RANGE_CATEGORIES = {
    CLOSE: 'CLOSE',
    NEAR: 'NEAR',
    MEDIUM: 'MEDIUM',
    FAR: 'FAR',
    EXTREME: 'EXTREME'
} as const;

export const RANGE_DISTANCES = {
    [RANGE_CATEGORIES.CLOSE]: { min: 0, max: 3 },
    [RANGE_CATEGORIES.NEAR]: { min: 4, max: 50 },
    [RANGE_CATEGORIES.MEDIUM]: { min: 51, max: 250 },
    [RANGE_CATEGORIES.FAR]: { min: 251, max: 500 },
    [RANGE_CATEGORIES.EXTREME]: { min: 501, max: Infinity }
} as const;

export const RANGE_MODIFIERS = {
    [RANGE_CATEGORIES.CLOSE]: 0,
    [RANGE_CATEGORIES.NEAR]: 0,
    [RANGE_CATEGORIES.MEDIUM]: -2,
    [RANGE_CATEGORIES.FAR]: -4,
    [RANGE_CATEGORIES.EXTREME]: -6
} as const;

export class WeaponRangeRules {
    static getRangeCategory(distance: number): keyof typeof RANGE_CATEGORIES {
        if (distance <= RANGE_DISTANCES[RANGE_CATEGORIES.CLOSE].max) return 'CLOSE';
        if (distance <= RANGE_DISTANCES[RANGE_CATEGORIES.NEAR].max) return 'NEAR';
        if (distance <= RANGE_DISTANCES[RANGE_CATEGORIES.MEDIUM].max) return 'MEDIUM';
        if (distance <= RANGE_DISTANCES[RANGE_CATEGORIES.FAR].max) return 'FAR';
        return 'EXTREME';
    }

    static getRangeModifier(distance: number): number {
        const category = this.getRangeCategory(distance);
        return RANGE_MODIFIERS[category];
    }

    static getTargetRangeDescription(distance: number): Shadowrun.RangeDescription {
        const category = this.getRangeCategory(distance);
        const modifier = RANGE_MODIFIERS[category];

        return {
            label: game.i18n.localize(`SR6.WeaponRange.${category.toLowerCase()}` as Translation),
            distance,
            modifier,
            category
        };
    }
}

export interface WeaponRangeTestDataFragment {
    damage: Shadowrun.DamageData
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
}

type WeaponRangeTest = SuccessTest<WeaponRangeTestDataFragment & SuccessTestData>

// Experimental - the idea of a test behavior is that it can be applied to multiple different types of tests
// without having to be a base class of both tests. This paradigm, if implemented correctly,
// should help prevent duplication of common behaviors across different tests
export class WeaponRangeTestBehavior {
    static prepareData(test: WeaponRangeTest, data: any) {
        data.range = 0;
        data.targetRanges = [];
        data.targetRangesSelected = 0;
        data.damage = data.damage || DataDefaults.damageData();
        data.attackerAR = 5;
        data.defenderDR = 5;
    }

    private static prepareTargetRanges(test: WeaponRangeTest) {
        if (!test.actor) return;

        // Get targets from current user instead of test.hasTargets
        const targets = Helpers.getUserTargets(game.user);
        if (targets.length === 0) return;

        const attacker = test.actor.getToken();

        if (!attacker) {
            ui.notifications?.warn(game.i18n.localize('SR6.TargetingNeedsActorWithToken'));
            return;
        }

        // Build target ranges for template display using the current user's targets
        test.data.targetRanges = targets.map(token => {
            const distance = Helpers.measureTokenDistance(attacker, token.document);
            const rangeDescription = WeaponRangeRules.getTargetRangeDescription(distance);

            return {
                tokenUuid: token.document.uuid,
                name: token.name || '',
                unit: LENGTH_UNIT,
                range: rangeDescription,
                distance,
            };
        });

        // Sort targets by ascending distance from attacker
        test.data.targetRanges = test.data.targetRanges.sort((a, b) => a.distance - b.distance);

        // Set initial range modifier
        const modifiers = test.actor.getSituationModifiers();
        modifiers.environmental.apply({test});
        test.data.range = modifiers.environmental.applied.active.range ||
            (test.data.targetRanges[0]?.range.modifier ?? 0);
    }

    static prepareDocumentData(test: WeaponRangeTest) {
        WeaponRangeTestBehavior.prepareTargetRanges(test);
    }

    /**
     * Save selections made back to documents.
     * @returns
     */
    static async saveUserSelectionAfterDialog(test: WeaponRangeTest) {
        if (!test.actor) return;
        if (!test.item) return;

        // Save range selection
        const modifiers = test.actor.getSituationModifiers();
        modifiers.environmental.setActive('range', test.data.range);
        await test.actor.setSituationModifiers(modifiers);
    }

    /**
     * Apply test selections made by user in dialog.
     * @returns
     */
    static prepareBaseValues(test: WeaponRangeTest) {
        if (!test.actor) return;
        if (!test.item) return;

        // Get targets from current user
        const targets = Helpers.getUserTargets(game.user);
        if (targets.length > 0) {
            // Set all selected targets for display in chat message
            test.targets = targets.map(token => token.document);

            if (test.data.targetRanges.length > 0) {
                // Cast select options string to integer index.
                test.data.targetRangesSelected = Number(test.data.targetRangesSelected);

                // Add safety check for valid index
                if (test.data.targetRangesSelected >= 0 &&
                    test.data.targetRangesSelected < test.data.targetRanges.length) {

                    const target = test.data.targetRanges[test.data.targetRangesSelected];
                    if (target && target.range) {
                        test.data.range = target.range.modifier;

                        // Set the specific target being fired upon
                        const token = fromUuidSync(target.tokenUuid) as TokenDocument;
                        if (!(token instanceof TokenDocument)) return console.error(`Shadowrun 6e | ${test.type} got a target that is no TokenDocument`, token);
                        if (!token.actor) return console.error(`Shadowrun 6e | ${test.type} got a token that has no actor`, token);
                        test.data.targetActorsUuid = [token.actor.uuid];
                    }
                }
            }
        }

        // Alter test data for range.
        test.data.range = Number(test.data.range);
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    static prepareTestModifiers(test: WeaponRangeTest) {
        WeaponRangeTestBehavior.prepareEnvironmentalModifier(test);
    }

    private static prepareEnvironmentalModifier(test: WeaponRangeTest) {
        if (!test.actor) return;

        const poolMods = new PartsList(test.data.modifiers.mod);
        const modifiers = DocumentSituationModifiers.getDocumentModifiers(test.actor);

        // Get targets from current user
        const targets = Helpers.getUserTargets(game.user);
        let range = 0;  // Default to 0 if no valid range is found

        if (targets.length > 0 &&
            test.data.targetRanges &&
            test.data.targetRanges.length > 0 &&
            test.data.targetRangesSelected >= 0 &&
            test.data.targetRangesSelected < test.data.targetRanges.length) {

            const selectedTarget = test.data.targetRanges[test.data.targetRangesSelected];
            if (selectedTarget && selectedTarget.range && typeof selectedTarget.range.modifier === 'number') {
                range = selectedTarget.range.modifier;
            }
        } else if (typeof test.data.range === 'number') {
            range = test.data.range;
        }

        // Locally set env modifier temporarily.
        modifiers.environmental.setActive('range', range);
        modifiers.environmental.apply({reapply: true, test});

        poolMods.addUniquePart(SR6.modifierTypes.environmental, modifiers.environmental.total);
    }

    static async processResults(test: WeaponRangeTest) {
        await WeaponRangeTestBehavior.markActionPhaseAsAttackUsed(test);
    }

    private static async markActionPhaseAsAttackUsed(test: WeaponRangeTest) {
        if (!test.actor! || !test.actor.combatActive) return;

        const combatant = test.actor.combatant;
        if (!combatant) return;

        await combatant.setFlag(SYSTEM_NAME, 'turnsSinceLastAttack', 0);
    }
}
