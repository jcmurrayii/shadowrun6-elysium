import { SR6TestingDocuments } from "./utils";
import { SR6Actor } from "../module/actor/SR6Actor";
import { SR6Item } from "../module/item/SR6Item";
import { TestCreator } from "../module/tests/TestCreator";
import { SuccessTest } from "../module/tests/SuccessTest";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunTesting = (context: QuenchBatchContext) => {
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

    describe('SuccessTest', () => {
        it('evaluate a roll from action data', async () => {
            const actionData = {
                'type': 'action',
                'system': {
                    'action': {
                        'test': 'SuccessTest',
                        'type': 'simple',
                        'attribute': 'body',
                        'skill': 'automatics',
                        'spec': false,
                        'limit': {
                            base: 1,
                            value: 1,
                            attribute: 'physical',
                        },
                        'threshold': {
                            base: 1,
                            value: 1,
                        },
                        'damage': {
                            ap: { value: 5, base: 5, mod: [] },
                            attribute: "",
                            base: 5,
                            base_formula_operator: "add",
                            element: { value: '', base: '' },
                            itemSource: { actorId: '', itemId: '', itemType: '', itemName: '' },
                            mod: [],
                            type: { value: 'physical', base: 'physical' },
                            value: 5
                        }
                    }
                }
            };

            const action = await testItem.create(actionData);

            const actorData = {
                'type': 'character',
                'system': {
                    'attributes': {
                        'body': { 'value': 5 }
                    },
                    'skills': {
                        'automatics': { 'value': 4 }
                    }
                }
            };
            const actor = await testActor.create(actorData);

            const test = await TestCreator.fromItem(action, actor, { showMessage: false, showDialog: false });

            // For a broken test just fail.
            if (!test) assert.strictEqual(true, false);

            // Evaluate a working test.
            if (test) {
                await test.evaluate();

                assert.strictEqual(test.pool.value, 9); // 5 body, 4 automatics
                assert.strictEqual(test.threshold.value, 1); // 1

                // TODO: Implement mocking for SR6Roll to test none-random results
            }
        });

        it('evaluate a roll from simple pool data', async () => {
            const test = TestCreator.fromPool({ pool: 10 }, { showMessage: false, showDialog: false });
            await test.evaluate();

            assert.strictEqual(test.pool.value, 10);
        });

        it('should correctly calculate edge gain for a test', async () => {
            // Create a test actor
            const actor = await testActor.create({
                name: "Edge Test Character",
                type: "character",
                system: {
                    attributes: {
                        logic: { value: 4 },
                        edge: { value: 4, uses: 0, max: 7 }
                    },
                    skills: {
                        hacking: { value: 3 }
                    }
                }
            });

            // Verify the actor was created and exists in the database
            const actorFromDb = game.actors.get(actor.id);
            assert.isNotNull(actorFromDb, "Actor should exist in the database");
            assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

            // Create the Analytical Mind quality
            const analyticalMindItem = await testItem.create({
                name: "Analytical Mind",
                type: "quality",
                system: {
                    description: {
                        value: "<p>You have a natural affinity for logic and analysis. You gain Edge when making Logic-based tests.</p>"
                    },
                    type: "positive",
                    subtype: "mental",
                    karma: 8
                }
            });

            // Add an effect to the quality
            await analyticalMindItem.createEmbeddedDocuments("ActiveEffect", [{
                label: "Logic Test: Edge gain",
                icon: "icons/svg/aura.svg",
                changes: [],
                disabled: false
            }]);

            // Add the quality to the actor
            await actor.createEmbeddedDocuments("Item", [analyticalMindItem.toObject()]);

            // Create a test using the actual SuccessTest class
            const logicTest = new SuccessTest({
                actor: actor,
                attribute: "logic",
                pool: {
                    attribute: "logic",
                    skill: "hacking"
                }
            });

            // Set initial edge to 0
            await actor.update({ "system.attributes.edge.uses": 0 });

            // Process the test
            await logicTest.execute();

            // Check if edge was awarded
            const newEdge = actor.system.attributes.edge.uses;
            assert.equal(newEdge, 1, "Edge should be awarded for Logic-based test with Analytical Mind");

            // Check if edgeGain data was set correctly
            assert.isTrue(logicTest.data.edgeGain.gained, "edgeGain.gained should be true");
            assert.include(logicTest.data.edgeGain.effect, "Logic Test: Edge gain", "edgeGain.effect should mention Logic Test");
        });

        it('should correctly apply Push the Limit edge action', async () => {
            // Create a test actor
            const actor = await testActor.create({
                name: "Edge Test Character",
                type: "character",
                system: {
                    attributes: {
                        logic: { value: 4 },
                        edge: { value: 4, uses: 3, max: 7 }
                    },
                    skills: {
                        hacking: { value: 3 }
                    }
                }
            });

            // Create a test using the actual SuccessTest class
            const logicTest = new SuccessTest({
                actor: actor,
                attribute: "logic",
                pool: {
                    attribute: "logic",
                    skill: "hacking"
                }
            });

            // Apply Push the Limit
            logicTest.data.pushTheLimit = true;
            logicTest.applyPushTheLimit();

            // Execute the test
            await logicTest.execute();

            // Check if edge was spent
            const newEdge = actor.system.attributes.edge.uses;
            assert.equal(newEdge, 2, "Edge should be spent when using Push the Limit");

            // Check if the dice pool was modified
            const poolMods = logicTest.pool.mod;
            assert.isTrue(poolMods.some(mod => mod.name === "SR6.PushTheLimit"), "Pool should be modified by Push the Limit");
        });
    });

    describe('OpposedTest', () => {
        it('should correctly handle opposed tests', async () => {
            // Create attacker and defender actors
            const attacker = await testActor.create({
                name: "Attacker",
                type: "character",
                system: {
                    attributes: {
                        agility: { value: 5 },
                        edge: { value: 4, uses: 2, max: 7 }
                    },
                    skills: {
                        firearms: { value: 4 }
                    }
                }
            });

            const defender = await testActor.create({
                name: "Defender",
                type: "character",
                system: {
                    attributes: {
                        reaction: { value: 3 },
                        intuition: { value: 4 },
                        edge: { value: 3, uses: 1, max: 7 }
                    }
                }
            });

            // Create an action with opposed test
            const actionData = {
                'type': 'action',
                'system': {
                    'action': {
                        'test': 'SuccessTest',
                        'type': 'simple',
                        'attribute': 'agility',
                        'skill': 'firearms',
                        'opposed': {
                            "type": "custom",
                            "test": "OpposedTest",
                            "attribute": "reaction",
                            "attribute2": "intuition",
                            "skill": "",
                            "mod": 0,
                            "description": "Dodge"
                        }
                    }
                }
            };

            const action = await testItem.create(actionData);

            // Create the test
            const test = await TestCreator.fromItem(action, attacker, { showMessage: false, showDialog: false });

            if (test) {
                // Set the defender
                test.setDefender(defender);

                // Execute the test
                await test.execute();

                // Verify the test results
                assert.isNotNull(test.data.opposed, "Opposed test data should exist");
                assert.equal(test.data.opposed.actor.id, defender.id, "Defender should be set correctly");
                
                // Verify the attacker's pool
                assert.equal(test.pool.value, 9, "Attacker's pool should be agility (5) + firearms (4)");
                
                // Verify the defender's pool
                if (test.data.opposed.test) {
                    assert.equal(test.data.opposed.test.pool.value, 7, "Defender's pool should be reaction (3) + intuition (4)");
                }
            }
        });
    });

    describe('AR vs DR Tests', () => {
        it('should correctly calculate attack rating and defense rating', async () => {
            // Create attacker with a weapon
            const attacker = await testActor.create({
                name: "Attacker",
                type: "character",
                system: {
                    attributes: {
                        agility: { value: 5 },
                        edge: { value: 4, uses: 2, max: 7 }
                    }
                }
            });

            // Create a weapon with attack rating
            const weapon = await testItem.create({
                name: "Test Pistol",
                type: "weapon",
                system: {
                    category: "ranged",
                    range: {
                        attackRating: {
                            short: 10,
                            medium: 8,
                            long: 6,
                            extreme: 4
                        },
                        current: "short",
                        current_mode: "SA"
                    }
                }
            });

            // Add the weapon to the attacker
            await attacker.createEmbeddedDocuments("Item", [weapon.toObject()]);

            // Create defender with defense rating
            const defender = await testActor.create({
                name: "Defender",
                type: "character",
                system: {
                    attributes: {
                        body: { value: 4 }
                    },
                    armor: {
                        defense_rating: {
                            base: 2,
                            mod: [],
                            value: 0
                        }
                    }
                }
            });

            // Calculate defense rating for defender
            const defenseRating = defender.getDefenseRating();
            
            // Get the attack rating from the weapon
            const attackRating = attacker.getAttackRating(weapon);

            // Verify the ratings
            assert.equal(attackRating, 10, "Attack rating should be 10 for short range");
            assert.equal(defenseRating, 6, "Defense rating should be base (2) + body (4)");

            // Check if attacker has significant advantage
            const attackerWins = attackRating >= defenseRating;
            const hasSignificantAdvantage = Math.abs(attackRating - defenseRating) >= 4;
            
            assert.isTrue(attackerWins, "Attacker should win the AR vs DR comparison");
            assert.isTrue(hasSignificantAdvantage, "Attacker should have significant advantage");
        });
    });
};
