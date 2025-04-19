import { SR6TestingDocuments } from "./utils";
import { SR6Actor } from "../module/actor/SR6Actor";
import { SR6Item } from "../module/item/SR6Item";
import { TestCreator } from "../module/tests/TestCreator";
import { SpellCastingTest } from "../module/tests/SpellCastingTest";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { CombatSpellRules } from "../module/rules/CombatSpellRules";

/**
 * Tests for spellcasting functionality
 *
 * @param context Quench test context
 */
export const shadowrunSpellCastingTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR6TestingDocuments(SR6Actor);
        testItem = new SR6TestingDocuments(SR6Item);
    });

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    });

    describe("Spellcasting Tests", () => {
        it("should correctly handle amp up in spell damage and drain calculations", async () => {
            // Create a test actor
            const actor = await testActor.create({
                name: "Spellcaster",
                type: "character",
                system: {
                    attributes: {
                        magic: { value: 5 },
                        charisma: { value: 4 },
                        willpower: { value: 3 }
                    },
                    skills: {
                        spellcasting: { value: 4 }
                    }
                }
            });

            // Create a test combat spell
            const spell = await testItem.create({
                name: "Fireball",
                type: "spell",
                system: {
                    category: "combat",
                    type: "physical",
                    combat: {
                        type: "indirect"
                    },
                    action: {
                        damage: {
                            base: 5,
                            value: 5,
                            type: {
                                base: "physical",
                                value: "physical"
                            }
                        }
                    }
                }
            });

            // Create a spellcasting test with amp up
            const test = new SpellCastingTest({
                actor: actor,
                item: spell,
                ampUp: 3, // Amp up by 3 levels
                pool: {
                    attribute: "magic",
                    skill: "spellcasting"
                }
            });

            // Calculate base damage with amp up
            const baseDamage = CombatSpellRules.calculateBaseDamage(
                spell.system.combat.type,
                spell.system.action.damage,
                test.data.ampUp
            );

            // Verify that amp up increases damage
            assert.equal(baseDamage.value, 8, "Damage should be base (5) + amp up (3)");
        });

        it("should correctly handle different spell types and combat types", async () => {
            // Create a test actor
            const actor = await testActor.create({
                name: "Spellcaster",
                type: "character",
                system: {
                    attributes: {
                        magic: { value: 5 },
                        charisma: { value: 4 },
                        willpower: { value: 3 }
                    },
                    skills: {
                        spellcasting: { value: 4 }
                    }
                }
            });

            // Create a direct mana combat spell
            const directManaSpell = await testItem.create({
                name: "Mana Bolt",
                type: "spell",
                system: {
                    category: "combat",
                    type: "mana",
                    combat: {
                        type: "direct"
                    },
                    action: {
                        damage: {
                            base: 5,
                            value: 5,
                            type: {
                                base: "stun",
                                value: "stun"
                            }
                        }
                    }
                }
            });

            // Create a direct physical combat spell
            const directPhysicalSpell = await testItem.create({
                name: "Toxic Wave",
                type: "spell",
                system: {
                    category: "combat",
                    type: "physical",
                    combat: {
                        type: "direct"
                    },
                    action: {
                        damage: {
                            base: 5,
                            value: 5,
                            type: {
                                base: "physical",
                                value: "physical"
                            }
                        }
                    }
                }
            });

            // Create an indirect physical combat spell
            const indirectPhysicalSpell = await testItem.create({
                name: "Fireball",
                type: "spell",
                system: {
                    category: "combat",
                    type: "physical",
                    combat: {
                        type: "indirect"
                    },
                    action: {
                        damage: {
                            base: 5,
                            value: 5,
                            type: {
                                base: "physical",
                                value: "physical"
                            }
                        }
                    }
                }
            });

            // Test direct mana spell defense
            const directManaDefenseAction = CombatSpellRules.defenseTestAction("mana", "direct");
            assert.equal(directManaDefenseAction.attribute, "willpower", "Direct mana spells should be defended with willpower");

            // Test direct physical spell defense
            const directPhysicalDefenseAction = CombatSpellRules.defenseTestAction("physical", "direct");
            assert.equal(directPhysicalDefenseAction.attribute, "body", "Direct physical spells should be defended with body");

            // Test indirect physical spell defense
            const indirectPhysicalDefenseAction = CombatSpellRules.defenseTestAction("physical", "indirect");
            assert.equal(indirectPhysicalDefenseAction.attribute, "reaction", "Indirect spells should be defended with reaction");
            assert.equal(indirectPhysicalDefenseAction.attribute2, "intuition", "Indirect spells should also use intuition for defense");
        });
    });
};
