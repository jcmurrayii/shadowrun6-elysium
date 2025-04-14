import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";
import {PartsList} from "../parts/PartsList";
import {DataDefaults} from "../data/DataDefaults";
import {DrainRules} from "../rules/DrainRules";
import {Helpers} from "../helpers";
import {SYSTEM_NAME} from "../constants";
import {SR6Actor} from "../actor/SR6Actor";
import { SpellcastingTestDialog } from "../apps/dialogs/SpellcastingTestDialog";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;


export interface SpellCastingTestData extends SuccessTestData {
    drain: number
    reckless: boolean
    attackerAR: number
    attackerEdge: boolean
    ampUp: number       // Number of amp up levels applied
    increasedArea: number  // Number of increased area levels applied
    defenders: {
        actorUuid: string;
        name: string
        dr: number
        isWinner: boolean    // Track who wins
        edgeAwarded: boolean // Track if edge was awarded
        hasSignificantAdvantage: boolean // Track if there's a significant advantage
        edgeReason: string   // Track the reason for not gaining edge
    }[]

    drainDamage: DamageData
}


/**
 * Spellcasting tests as described on SR5#281 in the spellcasting chapter.
 *
 */
export class SpellCastingTest extends SuccessTest<SpellCastingTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.drain = data.drain || 0;
        data.reckless = data.reckless || false;
        data.attackerAR = data.attackerAR || 0;
        data.attackerEdge = data.attackerEdge || false;
        data.ampUp = data.ampUp || 0;
        data.increasedArea = data.increasedArea || 0;
        data.defenders = data.defenders || [];
        data.drainDamage = data.drainDamage || DataDefaults.damageData();

        // Ensure the drain damage has a value property
        if (data.drainDamage && data.drainDamage.value === undefined) {
            data.drainDamage.value = data.drainDamage.base || 0;
        }

        console.log('Shadowrun 6e | SpellCastingTest prepared data:', {
            drain: data.drain,
            ampUp: data.ampUp,
            increasedArea: data.increasedArea,
            drainDamage: data.drainDamage
        });

        // Initialize defenders data with target tokens
        if (data.defenders.length === 0 && this.actor) {
            console.log('Shadowrun 6e | Getting user targets for spell casting');
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

    override get _dialogTemplate()  {
        return 'systems/shadowrun6-elysium/dist/templates/apps/dialogs/spellcasting-test-dialog.html';
    }

    /**
     * Override to use the SpellcastingTestDialog class
     */
    override _createTestDialog() {
        return new SpellcastingTestDialog({ test: this, templatePath: this._dialogTemplate }, undefined, this._testDialogListeners());
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun6-elysium/dist/templates/rolls/spellcasting-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            skill: 'spellcasting',
            attribute: 'magic'
        };
    }

    /**
     * Spellcasting test category directly depends on the spell cast.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        const spell = this.item?.asSpell;
        if (!spell) return [];

        switch (spell.system.category) {
            case 'combat': return ['spell_combat'];
            case 'detection': return ['spell_detection'];
            case 'health': return ['spell_healing'];
            case 'illusion': return ['spell_illusion'];
            case 'manipulation': return ['spell_manipulation'];
            case 'ritual': return ['spell_ritual'];
        }

        return []

    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'background_count'];
    }

    override async prepareDocumentData() {
        // Calculate the attack rating for magical attacks
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

        console.log('Shadowrun 6e | Prepared targets for spell casting test:', this.targets);
    }

    /**
     * Calculate the Attack Rating (AR) for magical attacks
     * For magical attack rating, the AR is the Magic + tradition attribute
     * The tradition attribute comes from the drain attribute setting
     */
    calculateAR(): number {
        if (!this.actor) return 0;

        // Get the magic attribute
        const magicAttr = this.actor.findAttribute('magic');
        if (!magicAttr) return 0;

        // Get the drain attribute (tradition attribute)
        let drainAttr = 'charisma'; // Default to charisma if no drain attribute is found

        // Log the actor's magic data for debugging
        console.log('Shadowrun 6e | Actor magic data:', {
            actorName: this.actor.name,
            magicData: this.actor.system.magic,
            drainAttribute: this.actor.system.magic?.attribute
        });

        // Check if the actor has a drain attribute defined
        if (this.actor.system.magic?.attribute) {
            drainAttr = this.actor.system.magic.attribute;
            console.log(`Shadowrun 6e | Using drain attribute from actor: ${drainAttr}`);
        } else {
            console.log(`Shadowrun 6e | No drain attribute found, using default: ${drainAttr}`);
        }

        // Get the drain attribute value
        const drainAttrValue = this.actor.findAttribute(drainAttr)?.value || 0;

        // Calculate the total AR as Magic + drain attribute
        this.data.attackerAR = magicAttr.value + drainAttrValue;

        // Create a detailed log message
        const logMessage = `Magical AR Calculation for ${this.actor.name}:\n` +
                          `Magic (${magicAttr.value}) + ${drainAttr.charAt(0).toUpperCase() + drainAttr.slice(1)} (${drainAttrValue}) = ${this.data.attackerAR}`;

        // Log the calculation details
        console.log(logMessage);

        // Also log the object for debugging
        console.log('Shadowrun 6e | Magical AR Calculation Details:', {
            actor: this.actor.name,
            magic: magicAttr.value,
            drainAttribute: drainAttr,
            drainValue: drainAttrValue,
            formula: `${magicAttr.value} + ${drainAttrValue} = ${this.data.attackerAR}`,
            totalAR: this.data.attackerAR
        });

        // Add a chat message to show the calculation
        if (this.item) {
            ChatMessage.create({
                content: `<div class="sr6 chat-card roll-card"><div class="card-content"><b>Spell AR Calculation for ${this.item.name}:</b><br>Magic (${magicAttr.value}) + ${drainAttr.charAt(0).toUpperCase() + drainAttr.slice(1)} (${drainAttrValue}) = ${this.data.attackerAR}</div></div>`,
                speaker: ChatMessage.getSpeaker({actor: this.actor})
            });
        }

        return this.data.attackerAR;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateDrainValue();
    }

    /**
     * Precalculate drain for user display.
     */
    calculateDrainValue() {
        const drain = Number(this.item?.getDrain);
        const reckless = this.data.reckless;
        const ampUp = Number(this.data.ampUp);
        const increasedArea = Number(this.data.increasedArea);

        // In SR6e, drain is the base drain value of the spell
        let totalDrain = drain;

        // Add drain for reckless casting if applicable
        if (reckless) {
            totalDrain += 3; // Keeping the SR5 reckless modifier for now
        }

        // Add drain for amp up: +2 drain per level
        if (ampUp > 0) {
            totalDrain += ampUp * 2;
        }

        // Add drain for increased area: +1 drain per level
        if (increasedArea > 0) {
            totalDrain += increasedArea;
        }

        // Ensure minimum drain of 2
        totalDrain = Math.max(2, totalDrain);

        console.log('Shadowrun 6e | Calculated drain value:', {
            baseDrain: drain,
            reckless,
            ampUp,
            increasedArea,
            totalDrain
        });

        this.data.drain = totalDrain;
    }

    /**
     * Derive the actual drain damage from spellcasting values.
     */
    calcDrainDamage() {
        if (!this.actor) return DataDefaults.damageData();

        const drain = Number(this.data.drain);
        const magic = this.actor.getAttribute('magic').value;

        console.log('Shadowrun 6e | Calculating drain damage with:', { drain, magic, hits: this.hits.value });

        // Create drain damage data with isDrain=true to default to stun damage
        const damage = DataDefaults.damageData({}, true);
        damage.base = drain;
        damage.value = drain;

        // In SR6e, drain is always stun damage unless the number of hits exceeds the magic attribute
        // Only change to physical in rare cases
        if (this.hits.value > magic) {
            damage.type.base = 'physical';
            damage.type.value = 'physical';
        }

        this.data.drainDamage = damage;

        // Ensure all properties are set
        this._ensureDamageProperties(this.data.drainDamage);

        console.log('Shadowrun 6e | Created drain damage:', this.data.drainDamage);
    }

    /**
     * Ensure that a damage object has all the required properties
     */
    _ensureDamageProperties(damage) {
        if (!damage) return;

        // Ensure value is set
        if (damage.value === undefined) {
            damage.value = damage.base || 0;
        }

        // Ensure type is set
        if (!damage.type) {
            damage.type = { base: 'stun', value: 'stun' };
        } else {
            // Ensure type.value is set
            if (damage.type.value === undefined) {
                damage.type.value = damage.type.base || 'stun';
            }
        }

        console.log('Shadowrun 6e | Ensured damage properties:', damage);
    }

    override async processResults() {
        this.calcDrainDamage();
        this.modifySpellDamageForAmpUp();

        // Debug the drain damage before processing results
        console.log('Shadowrun 6e | Drain damage before processing results:', {
            drainDamage: this.data.drainDamage,
            drain: this.data.drain
        });

        // Force the drain damage to have the correct values
        if (this.data.drainDamage) {
            this.data.drainDamage.value = this.data.drain;
            this.data.drainDamage.base = this.data.drain;
            if (this.data.drainDamage.type) {
                this.data.drainDamage.type.value = 'stun';
                this.data.drainDamage.type.base = 'stun';
            }
            console.log('Shadowrun 6e | Forced drain damage values:', this.data.drainDamage);
        }

        await super.processResults();

        // Debug the drain damage after processing results
        console.log('Shadowrun 6e | Drain damage after processing results:', {
            drainDamage: this.data.drainDamage,
            drain: this.data.drain
        });

        console.log('Shadowrun 6e | Starting edge award calculations');
        await this.calculateEdgeAwards();
        console.log('Shadowrun 6e | Finished edge award calculations');
    }

    /**
     * Modify the spell's damage value based on amp up levels
     * In SR6e, each amp up level increases damage by 1
     */
    modifySpellDamageForAmpUp() {
        const spell = this.item?.asSpell;
        if (!spell) return;

        const ampUp = Number(this.data.ampUp);
        if (ampUp <= 0) return;

        // Only modify damage for combat spells
        if (spell.system.category !== 'combat') return;

        // Get the action damage
        const damage = spell.system.action.damage;
        if (!damage) return;

        // Increase damage by 1 for each level of amp up
        const damageBonus = ampUp;

        console.log('Shadowrun 6e | Modifying spell damage for amp up:', {
            originalDamage: damage.value,
            ampUp,
            damageBonus,
            newDamage: damage.value + damageBonus
        });

        // Create a chat message to show the damage modification
        ChatMessage.create({
            content: `<div class="sr6 chat-card roll-card"><div class="card-content"><b>Amp Up Damage Bonus:</b> +${damageBonus} damage</div></div>`,
            speaker: ChatMessage.getSpeaker({actor: this.actor})
        });
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
                            defender.edgeReason = `${defenderActor.name} did not have a higher DR than the caster's AR`;
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

    // No need to save force value in SR6e

    /**
     * Override to ensure drain value is properly passed to the template
     */
    override async _prepareMessageTemplateData() {
        const templateData = await super._prepareMessageTemplateData();

        // Add debugging to see what's in the template data
        console.log('Shadowrun 6e | SpellCastingTest _prepareMessageTemplateData - Template data:', templateData);

        // Ensure the test object has the correct drain value
        if (templateData && templateData.test) {
            // Make sure the data property exists
            if (!templateData.test.data) {
                templateData.test.data = {};
            }

            // Log the original drain value
            console.log('Shadowrun 6e | SpellCastingTest _prepareMessageTemplateData - Original drain value:', templateData.test.data.drain);

            // Make sure the drain value is set
            if (templateData.test.data.drain === undefined || templateData.test.data.drain === 0) {
                templateData.test.data.drain = this.data.drain || 4; // Default to 4 if no drain value is set
            }

            console.log('Shadowrun 6e | SpellCastingTest _prepareMessageTemplateData - Updated drain value:', templateData.test.data.drain);
        }

        return templateData;
    }
}
