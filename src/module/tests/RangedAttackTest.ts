import { TestDialog } from '../apps/dialogs/TestDialog';
import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {SR6} from "../config";
import {FireModeRules} from "../rules/FireModeRules";
import { SR6Item } from "../item/SR6Item";
import { TestCreator } from './TestCreator';
import { RANGE_CATEGORIES, WeaponRangeTestBehavior, WeaponRangeTestDataFragment } from '../rules/WeaponRangeRules';
import { Helpers } from '../helpers';
import { SR6Actor } from '../actor/SR6Actor';
import { PartsList } from '../parts/PartsList';
import { SYSTEM_NAME } from '../constants';
import { CharacterPrep } from '../rules/CharacterPrep';
import { SR6ItemDataWrapper } from '../item/SR6ItemDataWrapper';

export interface RangedAttackTestData extends SuccessTestData, WeaponRangeTestDataFragment {
    damage: Shadowrun.DamageData
    fireModes: Shadowrun.FireModeData[]
    fireMode: Shadowrun.FireModeData
    // index of selected fireMode in fireModes
    fireModeSelected: number
    ranges: Shadowrun.RangesTemplateData
    range: number
    targetRanges: Shadowrun.TargetRangeTemplateData[]
    // index of selected target range in targetRanges
    targetRangesSelected: number
    // Distance to target in meters.
    distance: number,
    attackerAR: number
    defenderDRs: number[]
    attackerEdge: boolean
    attackerEdgeAwarded: boolean
    attackerEdgeReason: string
    defenders: {
        actorUuid: string;
        name: string
        dr: number
        isWinner: boolean    // Add this to track who wins
        edgeAwarded: boolean // Add this to track if edge was awarded
        edgeReason: string   // Add this to track the reason for not gaining edge
    }[]
    noEdge: boolean
}


export class RangedAttackTest extends SuccessTest<RangedAttackTestData> {
    public override item: SR6Item;

    override _prepareData(data, options): RangedAttackTestData {
        data = super._prepareData(data, options);



        data.fireModes = [];
        data.fireMode = {value: 0, defense: 0, label: ''};
        WeaponRangeTestBehavior.prepareData(this, data);

        // Copy weapon damage data to test data

        if (this.item?.system?.action?.damage) {
            // Ensure the item is properly prepared
            this.item.prepareData();

            // Copy the prepared damage data
            const weaponDamage = foundry.utils.duplicate(this.item.system.action.damage);

            // Ensure both base and value are set correctly
            if (weaponDamage.base === 0 && weaponDamage.value > 0) {
                weaponDamage.base = weaponDamage.value;
            }

            // Store base damage for display
            data.baseDamage = foundry.utils.duplicate(weaponDamage);

            // Store damage that will be modified with hits later
            data.damage = foundry.utils.duplicate(weaponDamage);

            // Also ensure action.damage is set for hasDamage getter
            if (!data.action) {
                data.action = foundry.utils.duplicate(this.item.system.action);
            } else {
                data.action.damage = weaponDamage;
            }


        }

        data.attackerAR = 5;
        data.attackerEdgeAwarded = false;
        data.attackerEdgeReason = '';

        console.log('Shadowrun 6e | Getting user targets');
        const targets = Helpers.getUserTargets(game.user);
        console.log('Shadowrun 6e | Found targets:', targets);

        if(this.actor) {
            console.log('Shadowrun 6e | Processing targets for actor:', this.actor.name);

            // Map targets to defenders with their actual DR values
            data.defenders = targets.map(token => {
                console.log('Shadowrun 6e | Processing target token:', token.name);

                const targetActor = token.actor;
                let dr = 5; // default DR

                if (!targetActor) {
                    console.log('Shadowrun 6e | No actor found for token:', token.name);
                    return null;
                }

                if (!(targetActor instanceof SR6Actor)) {
                    console.log('Shadowrun 6e | Actor is not SR6Actor:', token.name);
                    return null;
                }

                console.log('Shadowrun 6e | Processing SR6Actor target:', {
                    name: targetActor.name,
                    type: targetActor.type,
                    hasSystem: !!targetActor.system,
                    hasAttributes: !!targetActor.system?.attributes
                });

                // Get the calculated DR
                const targetArmor = targetActor.system.armor;
                dr = targetArmor?.defense_rating?.value || 5;

                console.log('Shadowrun 6e | Target DR Calculation:', {
                    name: targetActor.name,
                    armor: targetArmor,
                    dr: dr,
                    body: targetActor.system.attributes?.body?.value,
                    rawSystem: targetActor.system
                });

                return {
                    actorUuid: targetActor.uuid,
                    dr: dr,
                    name: token.name || '',
                    isWinner: false,
                    edgeAwarded: false,
                    hasSignificantAdvantage: false
                };
            }).filter(defender => defender !== null);

            console.log('Shadowrun 6e | Final defenders data:', data.defenders);
        } else {
            console.log('Shadowrun 6e | No actor found for this test');
        }

        return data;
    }



    override _testDialogListeners() {
        return [{
            query: '#reset-progressive-recoil',
            on: 'click',
            callback: this._handleResetProgressiveRecoil
        }]
    }

    /**
     * User want's to manually reset progressive recoil before casting the attack test.
     */
    async _handleResetProgressiveRecoil(event: JQuery<HTMLElement>, test: TestDialog) {
        if (!this.actor) return;
        await this.actor.clearProgressiveRecoil();

        // Refresh test values.
        this.prepareBaseValues();
        this.calculateBaseValues();

        // Inform user about changes.
        test.render();
    }

    override get canBeExtended() {
        return false;
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    _selectFireMode(index: number) {
        this.data.fireMode = this.data.fireModes[index];
    }

    /**
     * Weapon fire modes will affect recoil during test.
     *
     * To show the user the effect of recoil, it's applied during selection but progressive recoil is only ever fully applied
     * after the test is executed.
     */
    _prepareFireMode() {
        // No fire modes selectable on dialog for invalid item provided.
        const weapon = this.item.asWeapon;
        if (!weapon) return;

        this.data.fireModes = FireModeRules.availableFireModes(weapon.system.range.modes);

        // To avoid problems when no firemode is configured on the weapon, add at least one to what's available
        if (this.data.fireModes.length === 0) {
            this.data.fireModes.push(SR6.fireModes[0]);
            ui.notifications?.warn('SR6.Warnings.NoFireModeConfigured', {localize: true});
        }

        // Current firemode selected
        const lastFireMode = this.item.getLastFireMode() || DataDefaults.fireModeData();
        // Try pre-selection based on last fire mode.
        this.data.fireModeSelected = this.data.fireModes.findIndex(available => lastFireMode.label === available.label);
        if (this.data.fireModeSelected == -1) this.data.fireModeSelected = 0;
        this._selectFireMode(this.data.fireModeSelected);
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['attack', 'attack_ranged']
    }

    override get testModifiers(): Shadowrun.ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    override async prepareDocumentData() {
        WeaponRangeTestBehavior.prepareDocumentData(this);
        this._prepareFireMode();

        await super.prepareDocumentData();
    }

    override get _dialogTemplate(): string {
        return 'systems/sr6elysium/dist/templates/apps/dialogs/ranged-attack-test-dialog.html';
    }

    /**
     * If a suppression fire mode is used, ignore action opposed test configuration.
     */
    override get _opposedTestClass() {
        if (this.data.fireMode.suppression) return TestCreator._getTestClass(SR6.suppressionDefenseTest);
        return super._opposedTestClass;
    }

    /**
     * Save selections made back to documents.
     * @returns
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.actor) return;
        if (!this.item) return;

        // Save fire mode selection
        await this.item.setLastFireMode(this.data.fireMode);
        await WeaponRangeTestBehavior.saveUserSelectionAfterDialog(this);
    }

    /**
     * Apply test selections made by user in dialog.
     * @returns
     */
    override async prepareBaseValues() {
        await super.prepareBaseValues();

        if (!this.actor || !this.item) return;

        // Use selection for actual fireMode, overwriting possible previous selection for item.
        this._selectFireMode(this.data.fireModeSelected);

        // Alter fire mode by ammunition constraints.
        this.data.fireMode.defense = FireModeRules.fireModeDefenseModifier(this.data.fireMode, this.item.ammoLeft);

        // Calculate AR
        this.calculateAR();

        // Get range data for selected target
        if (this.data.targetRanges.length > 0) {
            const selectedTarget = this.data.targetRanges[this.data.targetRangesSelected];
            if (selectedTarget) {
                // Update weapon range data
                await this.item.update({
                    'system.range.current': selectedTarget.distance,
                    'system.range.category': selectedTarget.range.category,
                    'system.range.modifier': selectedTarget.range.modifier
                });
            }
        }
    }

    /**
     * Ranged attack tests allow for temporarily changing of modifiers without altering the document.
     */
    override prepareTestModifiers() {
        const modifiers = new PartsList<number>(this.data.modifiers.mod);

        // Add range modifier if we have a target
        if (this.data.targetRanges.length > 0) {
            const selectedTarget = this.data.targetRanges[this.data.targetRangesSelected];
            if (selectedTarget) {
                modifiers.addUniquePart('range', selectedTarget.range.modifier);
            }
        }

        super.prepareTestModifiers();
    }

    /**
     * Enough resources according to test configuration?
     *
     * Ranged weapons need ammunition in enough quantity.
     *
     * NOTE: In this case it's only checked if at least ONE bullet exists.
     *       It's done this way as no matter the fire mode, you can fire it.
     */
    override canConsumeDocumentResources() {
        if (!this.item.isRangedWeapon) return true;

        // Ammo consumption
        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        if (!this.item.hasAmmo(1)) {
            ui.notifications?.error('SR6.MissingRessource.Ammo', {localize: true});
            return false;
        }

        return super.canConsumeDocumentResources();
    }

    /**
     * Ranged Attacks not only can consume edge but also reduce ammunition.
     *
     */
    override async consumeDocumentRessources() {
        if (!await super.consumeDocumentRessources()) return false;
        if (!await this.consumeWeaponAmmo()) return false;

        return true;
    }

    /**
     * Reduce ranged weapon ammunition according to the fire mode used.
     */
    async consumeWeaponAmmo(): Promise<boolean> {
        if (!this.item) return true;
        if (!this.item.isRangedWeapon) return true;

        const fireMode = this.data.fireMode;
        if (fireMode.value === 0) return true;

        // Notify user about some but not no ammo. Still fire though.
        if (!this.item.hasAmmo(fireMode.value)) {
            ui.notifications?.warn('SR6.MissingRessource.SomeAmmo', {localize: true});
        }

        await this.item.useAmmo(fireMode.value);
        await this.actor?.addProgressiveRecoil(fireMode);

        return true;
    }

    override async processResults() {
        console.log('Shadowrun 6e | Processing ranged attack test results');
        await super.processResults();

        // Update damage with attack hits for display
        if (this.data.damage && this.hits.value > 0) {
            this.data.damage.mod = PartsList.AddUniquePart(this.data.damage.mod, 'SR6.Attacker', this.hits.value);
            this.data.damage.value = Helpers.calcTotal(this.data.damage, {min: 0});
        }

        console.log('Shadowrun 6e | Starting edge award calculations');
        await this.calculateEdgeAwards();
        console.log('Shadowrun 6e | Finished edge award calculations');
        await WeaponRangeTestBehavior.processResults(this);
    }

    private async calculateEdgeAwards() {
        if (!this.actor) {
            console.log('Shadowrun 6e | Cannot calculate edge awards: No actor found');
            return;
        }

        console.log(`Shadowrun 6e | Calculating edge awards for combat between ${this.actor.name} and ${this.data.defenders.length} defender(s)`);

        for (const defender of this.data.defenders) {
            console.log('Shadowrun 6e | Processing defender:', {
                name: defender.name,
                uuid: defender.actorUuid,
                dr: defender.dr
            });

            const attackerWins = this.data.attackerAR >= defender.dr;
            const hasSignificantAdvantage = Math.abs(this.data.attackerAR - defender.dr) >= 4;

            defender.isWinner = !attackerWins;
            defender.hasSignificantAdvantage = hasSignificantAdvantage;
            defender.edgeReason = ''; // Add this to track the reason

            // Award edge to attacker if they win with significant advantage
            if (attackerWins && hasSignificantAdvantage) {
                console.log(`Shadowrun 6e | ${this.actor.name} (AR: ${this.data.attackerAR}) has significant advantage over ${defender.name} (DR: ${defender.dr})`);

                if (this.isSpirit(this.actor)) {
                    this.data.attackerEdgeReason = `${this.actor.name} is a spirit and cannot gain Edge`;
                    console.log('Shadowrun 6e | Attacker is a spirit and cannot gain Edge');
                } else {
                    const edge = this.actor.getEdge();
                    const edgeGainedThisRound = this.actor.getFlag(SYSTEM_NAME, 'edgeGainedThisRound') || 0;

                    if (!edge) {
                        this.data.attackerEdgeReason = `${this.actor.name} has no Edge attribute`;
                        console.log('Shadowrun 6e | Attacker has no Edge attribute');
                    } else if (edgeGainedThisRound >= 2) {
                        this.data.attackerEdgeReason = `${this.actor.name} has already gained the maximum Edge (${edgeGainedThisRound}) this round`;
                        console.log('Shadowrun 6e | Attacker has already gained maximum Edge this round');
                    } else if (edge.uses >= 7) {
                        this.data.attackerEdgeReason = `${this.actor.name} is already at maximum Edge (${edge.uses})`;
                        console.log('Shadowrun 6e | Attacker is already at maximum Edge');
                    } else {
                        console.log('Shadowrun 6e | Attempting to award edge to attacker');
                        this.data.attackerEdgeAwarded = await this.awardEdge(this.actor);
                    }
                }
            }
            // Award edge to defender if they win with significant advantage
            else if (!attackerWins && hasSignificantAdvantage) {
                console.log(`Shadowrun 6e | ${defender.name} (DR: ${defender.dr}) has significant advantage over ${this.actor.name} (AR: ${this.data.attackerAR})`);

                try {
                    const defenderActor = await fromUuid(defender.actorUuid);
                    console.log('Shadowrun 6e | Defender actor lookup result:', {
                        found: !!defenderActor,
                        type: defenderActor?.constructor.name,
                        name: defenderActor?.name
                    });

                    if (defenderActor instanceof SR6Actor) {
                        // Check if defender is a spirit first
                        if (this.isSpirit(defenderActor)) {
                            defender.edgeReason = `${defenderActor.name} is a spirit and cannot gain Edge`;
                        } else {
                            const edge = defenderActor.getEdge();
                            const edgeGainedThisRound = defenderActor.getFlag(SYSTEM_NAME, 'edgeGainedThisRound') || 0;

                            // Check conditions and set reasons
                            if (!edge) {
                                defender.edgeReason = `${defenderActor.name} has no Edge attribute`;
                            } else if (edgeGainedThisRound >= 2) {
                                defender.edgeReason = `${defenderActor.name} has already gained the maximum Edge (${edgeGainedThisRound}) this round`;
                            } else if (edge.uses >= 7) {
                                defender.edgeReason = `${defenderActor.name} is already at maximum Edge (${edge.uses})`;
                            }
                        }

                        const canGainEdge = !this.isSpirit(defenderActor) && edge && edgeGainedThisRound < 2 && edge.uses < 7;

                        console.log('Shadowrun 6e | Edge check for defender:', {
                            hasEdge: !!edge,
                            edgeValue: edge?.uses,
                            edgeGainedThisRound,
                            canGainEdge
                        });

                        if (canGainEdge) {
                            console.log('Shadowrun 6e | Attempting to award edge to defender');
                            defender.edgeAwarded = await this.awardEdge(defenderActor);
                        }
                    } else {
                        defender.edgeReason = 'Invalid actor type for Edge calculation';
                        console.log('Shadowrun 6e | Defender actor is not an SR6Actor:', defenderActor);
                    }
                } catch (error) {
                    defender.edgeReason = 'Error processing Edge calculation';
                    console.error('Shadowrun 6e | Error processing defender:', error);
                }
            }
        }
    }

    private async awardEdge(actor: SR6Actor) {
        // Spirits never gain edge
        if (this.isSpirit(actor)) {
            console.log(`Shadowrun 6e | Could not award edge to ${actor.name}: Spirits cannot gain Edge`);
            return false;
        }

        const edge = actor.getEdge();
        if (!edge) {
            console.log(`Shadowrun 6e | Could not award edge to ${actor.name}: No edge attribute found`);
            await ChatMessage.create({
                content: `${actor.name} cannot gain Edge (no Edge attribute found)`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
            return false;  // Return false to indicate edge was not awarded
        }

        // Check if actor has already gained maximum edge this round
        const edgeGainedThisRound = actor.getFlag(SYSTEM_NAME, 'edgeGainedThisRound') || 0;
        if (edgeGainedThisRound >= 2) {
            console.log(`Shadowrun 6e | Could not award edge to ${actor.name}: Maximum edge gained this round (${edgeGainedThisRound})`);
            await ChatMessage.create({
                content: `${actor.name} has already gained maximum Edge this round (${edgeGainedThisRound})`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
            return false;  // Return false to indicate edge was not awarded
        }

        // Check if adding edge would exceed maximum
        const newEdgeUses = Math.min(7, edge.uses + 1);
        if (newEdgeUses <= edge.uses) {
            console.log(`Shadowrun 6e | Could not award edge to ${actor.name}: Already at maximum edge (${edge.uses})`);
            await ChatMessage.create({
                content: `${actor.name} is already at maximum Edge (${edge.uses})`,
                speaker: ChatMessage.getSpeaker({actor: actor})
            });
            return false;  // Return false to indicate edge was not awarded
        }

        // Only proceed with edge award if we haven't returned false above
        await actor.update({
            'system.attributes.edge.uses': newEdgeUses
        });
        await actor.setFlag(SYSTEM_NAME, 'edgeGainedThisRound', edgeGainedThisRound + 1);

        // Show floating text - try both token and primary token
        const token = actor.token || actor.getActiveTokens()[0];
        if (token && token.center && token.center.x !== undefined && token.center.y !== undefined) {
            canvas.interface?.createScrollingText(token.center, `Edge +1`, {
                anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                direction: CONST.TEXT_ANCHOR_POINTS.TOP,
                distance: 20,
                fontSize: 24,
                fill: "#00FF00",
                stroke: "#000000",
                strokeThickness: 4,
                duration: 1000
            });
        } else {
            console.log('Shadowrun 6e | Could not show floating text: token or token.center not available');
        }

        // Notify in chat
        await ChatMessage.create({
            content: `${actor.name} gains Edge (+1)`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });

        console.log(`Shadowrun 6e | Edge awarded to ${actor.name}: ${edge.uses} → ${newEdgeUses}`);
        return true;  // Return true to indicate edge was successfully awarded
    }

    /**
     * Get the Attack Rating (AR) for the current range.
     * Each weapon has specific ARs defined for different ranges.
     * If no AR is defined for the current range, the weapon cannot be used.
     */
    calculateAR(): number {
        if (!this.actor || !this.item) return 0;

        const weapon = this.item.asWeapon;
        if (!weapon) return 0;

        // Get the current range category
        let rangeCategory = RANGE_CATEGORIES.NEAR.toLowerCase(); // Convert to lowercase to match data structure
        if (this.data.targetRanges.length > 0) {
            const selectedTarget = this.data.targetRanges[this.data.targetRangesSelected];
            if (selectedTarget) {
                rangeCategory = selectedTarget.range.category.toLowerCase(); // Convert to lowercase
            }
        }

        // Get the AR for the specific range
        const rangeAR = weapon.system.range.attackRating?.[rangeCategory];

        // If no AR is defined for this range, the weapon cannot be used
        if (typeof rangeAR !== 'number') {
            console.log('Shadowrun 6e | Weapon cannot be used at range:', {
                weapon: weapon.name,
                targetName: this.data.targetRanges[this.data.targetRangesSelected]?.name,
                range: {
                    category: rangeCategory,
                    distance: this.data.targetRanges[this.data.targetRangesSelected]?.distance
                },
                attackRatings: weapon.system.range.attackRating,
                selectedTarget: this.data.targetRanges[this.data.targetRangesSelected],
                hasTargets: this.data.targetRanges.length > 0,
                selectedTargetIndex: this.data.targetRangesSelected
            });

            ui.notifications?.warn(
                game.i18n.format('SR6.WeaponRange.CannotBeUsedAtRange', {
                    weapon: weapon.name,
                    range: game.i18n.localize(`SR6.WeaponRange.${rangeCategory}`)
                })
            );
            return 0;
        }

        this.data.attackerAR = rangeAR;

        console.log('Shadowrun 6e | AR Selection:', {
            weapon: weapon.name,
            range: rangeCategory,
            ar: rangeAR,
            allRanges: weapon.system.range.attackRating
        });

        return this.data.attackerAR;
    }

    /**
     * Check if an actor is a spirit (spirits cannot gain edge)
     */
    private isSpirit(actor: SR6Actor): boolean {
        return actor.system.is_npc && actor.system.npc?.is_spirit;
    }
}
