import { SuccessTest, SuccessTestData } from "./SuccessTest";
import { DataDefaults } from "../data/DataDefaults";
import { SR6Actor } from "../actor/SR6Actor";
import { Helpers } from "../helpers";
import { SYSTEM_NAME } from "../constants";
import ModifierTypes = Shadowrun.ModifierTypes;

export interface MeleeAttackData extends SuccessTestData {
    reach: number
    attackerAR: number
    attackerEdge: boolean
    defenders: {
        actorUuid: string;
        name: string
        dr: number
        isWinner: boolean    // Track who wins
        edgeAwarded: boolean // Track if edge was awarded
        hasSignificantAdvantage: boolean // Track if there's a significant advantage
        edgeReason: string   // Track the reason for not gaining edge
    }[]
}

export class MeleeAttackTest extends SuccessTest<MeleeAttackData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.damage = data.damage || DataDefaults.damageData();
        data.attackerAR = data.attackerAR || 0;
        data.attackerEdge = data.attackerEdge || false;
        data.defenders = data.defenders || [];

        // Initialize defenders data with target tokens
        if (data.defenders.length === 0 && this.actor) {
            console.log('Shadowrun 6e | Getting user targets for melee attack');
            const targets = Helpers.getUserTargets(game.user);
            console.log('Shadowrun 6e | Found targets:', targets);

            if (targets && targets.length > 0) {
                data.defenders = targets.map(token => {
                    const targetActor = token.actor;
                    if (!targetActor) return null;

                    // Get the defense rating
                    let dr = 5; // Default DR

                    // Get the calculated DR
                    const targetArmor = targetActor.system.armor;
                    dr = targetArmor?.defense_rating?.value || 5;

                    console.log('Shadowrun 6e | Target DR Calculation:', {
                        name: targetActor.name,
                        armor: targetArmor,
                        dr: dr
                    });

                    return {
                        actorUuid: targetActor.uuid,
                        dr: dr,
                        name: token.name || '',
                        isWinner: false,
                        edgeAwarded: false,
                        hasSignificantAdvantage: false,
                        edgeReason: ''
                    };
                }).filter(defender => defender !== null);

                console.log('Shadowrun 6e | Final defenders data:', data.defenders);
            } else {
                console.log('Shadowrun 6e | No targets found for this test');
            }
        }

        return data;
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['attack', 'attack_melee'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'environmental'];
    }

    override get _dialogTemplate(): string {
        return 'systems/sr6elysium/dist/templates/apps/dialogs/melee-attack-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/sr6elysium/dist/templates/rolls/success-test-message.html';
    }

    override get showSuccessLabel(): boolean {
        return this.success;
    }

    override async prepareDocumentData() {
        if (!this.item || !this.item.isMeleeWeapon) return;

        this.data.reach = this.item.getReach();
        this.data.reach += this.actor?.system.modifiers.reach || 0;

        // Calculate the attack rating for melee weapons
        this.calculateAR();

        // Set targets for the chat message
        this.prepareTargets();

        await super.prepareDocumentData();
    }

    /**
     * Prepare targets for the chat message
     */
    prepareTargets() {
        // Only proceed if we have defenders
        if (!this.data.defenders || this.data.defenders.length === 0) return;

        // Set targets for the chat message
        this.targets = [];

        // Add each defender as a target
        for (const defender of this.data.defenders) {
            // Try to get the token for this actor
            const actor = game.actors?.get(defender.actorUuid.split('.').pop());
            if (!actor) continue;

            // Get the token for this actor
            const token = actor.getActiveTokens()[0];
            if (!token) continue;

            // Add the token to the targets
            this.targets.push(token);
        }

        console.log('Shadowrun 6e | Prepared targets for melee attack test:', this.targets);
    }

    /**
     * Calculate the Attack Rating (AR) for melee weapons
     * If the melee attack is using strength, then Agility is used as the AR calculation
     * If the melee attack uses agility, then Strength is used for calculating the AR
     * Melee AR calculation is AR stat + weapon AR
     */
    calculateAR(): number {
        if (!this.actor || !this.item) return 0;

        // Default AR value
        let arStat = 0;
        let weaponAR = 0;

        // Get the weapon AR from the item
        if (this.item.system.action?.damage?.value) {
            weaponAR = this.item.system.action.damage.value;
        }

        // Determine which attribute to use based on the weapon type
        if (this.item.usesAgility()) {
            // If the weapon uses agility, use strength for AR
            const strengthAttr = this.actor.findAttribute('strength');
            if (strengthAttr) {
                arStat = strengthAttr.value;
            }
        } else {
            // If the weapon uses strength (default), use agility for AR
            const agilityAttr = this.actor.findAttribute('agility');
            if (agilityAttr) {
                arStat = agilityAttr.value;
            }
        }

        // For unarmed combat, AR is Strength + Reaction
        if (this.item.system.category === 'unarmed') {
            const strengthAttr = this.actor.findAttribute('strength');
            const reactionAttr = this.actor.findAttribute('reaction');

            arStat = (strengthAttr ? strengthAttr.value : 0) + (reactionAttr ? reactionAttr.value : 0);
            weaponAR = 0; // No weapon AR for unarmed
        }

        // Calculate the total AR
        this.data.attackerAR = arStat + weaponAR;

        // Determine which attributes were used
        let statName = this.item.usesAgility() ? 'Strength' : 'Agility';
        if (this.item.system.category === 'unarmed') {
            statName = 'Strength + Reaction';
        }

        // Create a detailed log message
        const logMessage = `Melee AR Calculation for ${this.actor.name} using ${this.item.name}:\n` +
                          `${statName} (${arStat}) + Weapon AR (${weaponAR}) = ${this.data.attackerAR}`;

        // Log the calculation details
        console.log(logMessage);

        // Also log the object for debugging
        console.log('Shadowrun 6e | Melee AR Calculation Details:', {
            actor: this.actor.name,
            weapon: this.item.name,
            statName,
            arStat,
            weaponAR,
            formula: `${arStat} + ${weaponAR} = ${this.data.attackerAR}`,
            totalAR: this.data.attackerAR
        });

        // Add a chat message to show the calculation
        ChatMessage.create({
            content: `<div class="sr6 chat-card roll-card"><div class="card-content"><b>Melee AR Calculation for ${this.item.name}:</b><br>${statName} (${arStat}) + Weapon AR (${weaponAR}) = ${this.data.attackerAR}</div></div>`,
            speaker: ChatMessage.getSpeaker({actor: this.actor})
        });

        return this.data.attackerAR;
    }

    /**
     * Remove unneeded environmental modifier categories for melee tests.
     *
     * See SR5#187 'Environmental Modifiers'
     *
     * @param actor
     * @param type
     */
    override prepareActorModifier(actor: SR6Actor, type: ModifierTypes): { name: string; value: number; } {
        if (type !== 'environmental') return super.prepareActorModifier(actor, type);

        // Only light and visibility apply.
        const modifiers = actor.getSituationModifiers();
        modifiers.environmental.apply({ applicable: ['light', 'visibility'] });

        const name = this._getModifierTypeLabel(type);
        const value = modifiers.environmental.total;

        return { name, value };
    }

    /**
     * Some Melee Weapons have ammo and can consume it.
     */
    override canConsumeDocumentResources(): boolean {
        if (this.item === undefined) return true;
        if (!this.item.usesAmmo) return true;

        // Consume one ammo per attack.
        if (!this.item.hasAmmo(1)) {
            ui.notifications?.error('SR6.MissingRessource.SomeAmmoMelee', {localize: true});
            return false;
        }

        return super.canConsumeDocumentResources();
    }

    /**
     * Some Melee Weapons can consume ammo resources.
     */
    override async consumeDocumentRessources(): Promise<boolean> {
        if (!await super.consumeDocumentRessources()) return false;
        if (!await this.consumeWeaponAmmo()) return false;

        return true;
    }

    /**
     * Reduce the melee weapon ammunition for this attack.
     */
    async consumeWeaponAmmo(): Promise<boolean> {
        if (this.item === undefined) return true;
        if (!this.item.usesAmmo) return true;

        // Notify user about some but not no ammo. Still let them punch though.
        if (!this.item.hasAmmo(1)) {
            ui.notifications?.warn('SR6.MissingRessource.SomeAmmoMelee', {localize: true});
        }

        await this.item.useAmmo(1);

        return true;
    }

    override async processResults() {
        console.log('Shadowrun 6e | Processing melee attack test results');
        await super.processResults();
        console.log('Shadowrun 6e | Starting edge award calculations');
        await this.calculateEdgeAwards();
        console.log('Shadowrun 6e | Finished edge award calculations');
    }

    /**
     * Calculate edge awards based on Attack Rating vs Defense Rating
     * Edge is awarded when there is a significant advantage (AR vs DR difference >= 4)
     */
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
            defender.edgeReason = ''; // Reset the reason

            if (!attackerWins && hasSignificantAdvantage) {
                console.log(`Shadowrun 6e | ${defender.name} (DR: ${defender.dr}) has significant advantage over ${this.actor.name} (AR: ${this.data.attackerAR})`);

                try {
                    const defenderActor = await fromUuid(defender.actorUuid);
                    if (defenderActor instanceof SR6Actor) {
                        const edge = defenderActor.getEdge();
                        const edgeGainedThisRound = defenderActor.getFlag(SYSTEM_NAME, 'edgeGainedThisRound') || 0;

                        // Check conditions and set reasons with detailed explanations
                        if (!edge) {
                            defender.edgeReason = `${defenderActor.name} has no Edge attribute`;
                        } else if (edgeGainedThisRound >= 2) {
                            defender.edgeReason = `${defenderActor.name} has already gained the maximum Edge (${edgeGainedThisRound}) this round`;
                        } else if (edge.uses >= 7) {
                            defender.edgeReason = `${defenderActor.name} is already at maximum Edge (${edge.uses})`;
                        } else if (!defender.hasSignificantAdvantage) {
                            defender.edgeReason = `No significant advantage (DR vs AR difference must be 4+)`;
                        } else if (!defender.isWinner) {
                            defender.edgeReason = `${defenderActor.name} did not have a higher DR than the attacker's AR`;
                        }

                        const canGainEdge = edge && edgeGainedThisRound < 2 && edge.uses < 7;

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

    /**
     * Award edge to an actor
     * @param actor The actor to award edge to
     * @returns True if edge was awarded, false otherwise
     */
    private async awardEdge(actor: SR6Actor) {
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
        if (token) {
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
        }

        // Notify in chat
        await ChatMessage.create({
            content: `${actor.name} gains Edge (+1)`,
            speaker: ChatMessage.getSpeaker({actor: actor})
        });

        console.log(`Shadowrun 6e | Edge awarded to ${actor.name}: ${edge.uses} → ${newEdgeUses}`);
        return true;  // Return true to indicate edge was successfully awarded
    }
}
