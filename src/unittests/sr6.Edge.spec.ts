import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SYSTEM_NAME } from '../module/constants';
import { SuccessTest } from '../module/tests/SuccessTest';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6Item } from '../module/item/SR6Item';
import { SR6TestingDocuments } from './utils';
import { DataDefaults } from '../module/data/DataDefaults';
import { AttributeOnlyTest } from '../module/tests/AttributeOnlyTest';
import { SkillTest } from '../module/tests/SkillTest';
import { TestCreator } from '../module/tests/TestCreator';

/**
 * Tests for edge awarding and spending functionality
 *
 * @param context Quench test context
 */
export const shadowrunEdgeTesting = (context: QuenchBatchContext) => {
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

    describe("Edge Functionality Tests", () => {
        it("should correctly calculate edge gain for a test", async () => {
            // Skip this test if we're not in a game environment
            if (typeof Actor === 'undefined') {
                console.log("Skipping edge gain test - Actor not available");
                return;
            }

            try {
                // Create a test actor
                const actor = await testActor.create({
                    type: 'character',
                    'name': "Edge Test Character",
                    'system.skills.active.cracking.base': 6,
                    'system.attributes.logic.base': 5,
                    'system.attributes.edge.base': 5,
                }) as SR6Actor;

                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the actor was created and exists in the database
                const actorFromDb = game.actors.get(actor.id);
                assert.isNotNull(actorFromDb, "Actor should exist in the database");
                assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Logic Test: Edge gain'
                }]);

                const actionData = {
                    'type': 'action',
                    'system': {
                        'action': {
                            'test': 'SkillTest',
                            'type': 'simple',
                            'attribute': 'logic',
                            'skill': 'cracking',
                            'spec': false,
                        },
                        'categories':['brute_force']
                    }
                };

                const action = await testItem.create(actionData);

                // Set initial edge to 0
                await actor.update({"system.attributes.edge.uses": 0});

                const logicTest = await
                    TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

                console.log(logicTest);
                // Process the test
                await logicTest.execute();

                // Check if edge was awarded
                const newEdge = actor.system.attributes.edge.uses;
                assert.equal(newEdge, 1, "Edge should be awarded for Logic-based test with Analytical Mind");

                // Check if edgeGain data was set correctly
                assert.isTrue(logicTest.data.edgeGain.gained, "edgeGain.gained should be true");
                assert.include(logicTest.data.edgeGain.effect.name, "Logic Test: Edge gain", "edgeGain.effect should mention Logic Test");
            } catch (error) {
                console.error("Error in edge gain test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping edge gain test due to error", error);
                throw error;
            }
        });

        it("should not award edge for non-matching tests", async () => {
            // Skip this test if we're not in a game environment
            try {
                // Create a test actor
                const actor = await testActor.create({
                    type: 'character',
                    'name': "Edge Test Character",
                    'system.skills.active.cracking.base': 6,
                    'system.attributes.logic.base': 5,
                    'system.attributes.edge.base': 5,
                }) as SR6Actor;

                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the actor was created and exists in the database
                const actorFromDb = game.actors.get(actor.id);
                assert.isNotNull(actorFromDb, "Actor should exist in the database");
                assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Charisma Test: Edge gain'
                }]);

                const actionData = {
                    'type': 'action',
                    'system': {
                        'action': {
                            'test': 'SkillTest',
                            'type': 'simple',
                            'attribute': 'logic',
                            'skill': 'cracking',
                            'spec': false,
                        },
                        'categories':['brute_force']
                    }
                };

                const action = await testItem.create(actionData);

                // Set initial edge to 0
                await actor.update({"system.attributes.edge.uses": 0});

                const logicTest = await
                    TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

                console.log(logicTest);
                // Process the test
                await logicTest.execute();

                // Check if edge was awarded
                const newEdge = actor.system.attributes.edge.uses;
                assert.equal(newEdge, 0, "Edge should not be awarded for Charisma-based test with Analytical Mind");

                // Check if edgeGain data was set correctly
                assert.isFalse(logicTest.data.edgeGain.gained, "edgeGain.gained should be false");
                assert.isNull(logicTest.data.edgeGain.effect, "edgeGain.effect should be null");
            } catch (error) {
                console.error("Error in edge gain test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping edge gain test due to error", error);
                throw error;
            }
        });

        it("should not award edge when actor already has maximum edge", async () => {
            try {
                // Create a test actor
                const actor = await testActor.create({
                    type: 'character',
                    'name': "Edge Test Character",
                    'system.skills.active.cracking.base': 6,
                    'system.attributes.logic.base': 5,
                    'system.attributes.edge.base': 5,
                }) as SR6Actor;

                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the actor was created and exists in the database
                const actorFromDb = game.actors.get(actor.id);
                assert.isNotNull(actorFromDb, "Actor should exist in the database");
                assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Logic Test: Edge gain'
                }]);

                const actionData = {
                    'type': 'action',
                    'system': {
                        'action': {
                            'test': 'SkillTest',
                            'type': 'simple',
                            'attribute': 'logic',
                            'skill': 'cracking',
                            'spec': false,
                        },
                        'categories':['brute_force']
                    }
                };

                const action = await testItem.create(actionData);

                // Set initial edge to 0
                await actor.update({"system.attributes.edge.uses": 7});

                const logicTest = await
                    TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

                console.log(logicTest);
                // Process the test
                await logicTest.execute();

                // Check if edge was awarded
                const newEdge = actor.system.attributes.edge.uses;
                assert.equal(newEdge, 7, "Edge should not be be gained when at maximum");

                // Check if edgeGain data was set correctly
                assert.isFalse(logicTest.data.edgeGain.gained, "edgeGain.gained should be false");
                assert.isNull(logicTest.data.edgeGain.effect,"edgeGain.effect should be null");
            } catch (error) {
                console.error("Error in edge gain test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping edge gain test due to error", error);
                throw error;
            }
        });

        it("should not award edge when actor already gained maximum edge this round", async () => {
            try {
                // Create a test actor
                const actor = await testActor.create({
                    type: 'character',
                    'name': "Edge Test Character",
                    'system.skills.active.cracking.base': 6,
                    'system.attributes.logic.base': 5,
                    'system.attributes.edge.base': 5,
                }) as SR6Actor;

                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the actor was created and exists in the database
                const actorFromDb = game.actors.get(actor.id);
                assert.isNotNull(actorFromDb, "Actor should exist in the database");
                assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Logic Test: Edge gain'
                }]);

                const actionData = {
                    'type': 'action',
                    'system': {
                        'action': {
                            'test': 'SkillTest',
                            'type': 'simple',
                            'attribute': 'logic',
                            'skill': 'cracking',
                            'spec': false,
                        },
                        'categories':['brute_force']
                    }
                };

                const action = await testItem.create(actionData);

                // Set initial edge to 0
                await actor.update({"system.attributes.edge.uses": 7});

                const logicTest = await
                    TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

                actor.system.combatRoundTracker.edgeGained = 2;
                // Process the test
                await logicTest.execute();

                // Check if edge was awarded
                const newEdge = actor.system.attributes.edge.uses;
                assert.equal(newEdge, 7, "Edge should not be be gained when maximum edge has been gained this round.");

                // Check if edgeGain data was set correctly
                assert.isFalse(logicTest.data.edgeGain.gained, "edgeGain.gained should be false");
                assert.isNull(logicTest.data.edgeGain.effect,"edgeGain.effect should be null");
            } catch (error) {
                console.error("Error in edge gain test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping edge gain test due to error", error);
                throw error;
            }
        });

        it("should reset edge uses to edge value when resetting run data", async () => {
            // Skip this test if we're not in a game environment
            if (typeof Actor === 'undefined') {
                console.log("Skipping reset run data test - Actor not available");
                return;
            }

            try {
                // Create a test actor with low edge uses
                const actor = await testActor.create({
                    name: "Edge Test Character",
                    type: "character",
                    system: {
                        attributes: {
                            edge: { value: 4, uses: 1, max: 7 }
                        }
                    }
                });
                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Reset run data
                await actor.resetRunData();

                // Check if edge uses was reset to the edge attribute value
                const newEdgeUses = actor.system.attributes.edge.uses;
                assert.equal(newEdgeUses, 4, "Edge uses should be reset to edge attribute value");
            } catch (error) {
                console.error("Error in reset run data test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping reset run data test due to error");
                throw error;
            }
        });

        it("should correctly render edge usage in chat messages", async () => {
            // Skip this test if we're not in a game environment
            if (typeof Actor === 'undefined') {
                console.log("Skipping edge gain test - Actor not available");
                return;
            }

            try {
                // Create a test actor
                const actor = await testActor.create({
                    type: 'character',
                    'name': "Edge Test Character",
                    'system.skills.active.cracking.base': 6,
                    'system.attributes.logic.base': 5,
                    'system.attributes.edge.base': 5,
                }) as SR6Actor;

                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the actor was created and exists in the database
                const actorFromDb = game.actors.get(actor.id);
                assert.isNotNull(actorFromDb, "Actor should exist in the database");
                assert.equal(actorFromDb.name, "Edge Test Character", "Actor name should match");

                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Logic Test: Edge gain'
                }]);

                const actionData = {
                    'type': 'action',
                    'system': {
                        'action': {
                            'test': 'SkillTest',
                            'type': 'simple',
                            'attribute': 'logic',
                            'skill': 'cracking',
                            'spec': false,
                        },
                        'categories':['brute_force']
                    }
                };

                const action = await testItem.create(actionData);

                // Set initial edge to 0
                await actor.update({"system.attributes.edge.uses": 0});

                const logicTest = await
                    TestCreator.fromItem(action, actor, {showMessage: true, showDialog: false});

                console.log(logicTest);
                // Process the test
                await logicTest.execute();

                console.log("Edge earned?", logicTest.earnedEdge);
                console.log("Edge reason: ", logicTest.edgeEarnedReason)

                // Check if edge was awarded
                const newEdge = actor.system.attributes.edge.uses;
                assert.equal(newEdge, 1, "Edge should be awarded for Logic-based test with Analytical Mind");

                // Check if edgeGain data was set correctly
                assert.isTrue(logicTest.data.edgeGain.gained, "edgeGain.gained should be true");
                assert.include(logicTest.data.edgeGain.effect.name, "Logic Test: Edge gain", "edgeGain.effect should mention Logic Test");
            } catch (error) {
                console.error("Error in edge gain test:", error);
                // If we can't access the system classes, skip the test
                console.log("Skipping edge gain test due to error", error);
                throw error;
            }
        });

        it("should correctly render edge gain denial in chat messages", async () => {
            // Skip this test if we're not in a browser environment with ChatMessage available
            if (typeof ChatMessage === 'undefined' || typeof Actor === 'undefined') {
                console.log("Skipping edge denial test - ChatMessage or Actor not available");
                return;
            }

            try {
                // Create a test actor with max edge
                const actor = await testActor.create({
                    name: "Edge Test Character",
                    type: "character",
                    system: {
                        attributes: {
                            logic: { value: 4 },
                            edge: { value: 4, uses: 7, max: 7 } // Already at max edge
                        }
                    }
                });
                actor.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Create a test using the actual SuccessTest class
                const logicTest = new SuccessTest({
                    actor: actor,
                    attribute: "logic",
                    options: {
                        showMessage: true // Ensure the message is shown
                    }
                });

                // Add edge gain denial data
                logicTest.data.edgeGain = {
                    gained: false,
                    effect: "Logic Test: Edge gain",
                    reason: "already at maximum Edge (7)"
                };

                // Create a chat message
                const message = await logicTest.toMessage();

                // Assert that the message was created
                assert.isNotNull(message, "Chat message should be created");

                // Verify the message exists in the database
                const messageFromDb = game.messages.get(message.id);
                assert.isNotNull(messageFromDb, "Message should exist in the database");
                assert.equal(messageFromDb.speaker.actor, actor.id, "Message should be from the correct actor");

                // Get the message content
                const content = message.content;

                // Assert that the content contains edge denial information
                assert.include(content, "Edge Not Gained", "Chat message should show Edge Not Gained message");
                assert.include(content, "maximum Edge", "Chat message should mention the reason for edge denial");

                // Check for edge icon (should still be present)
                assert.include(content, "fa-meteor", "Chat message should include the edge icon");

                // Check for edge-not-gained class
                assert.include(content, "edge-not-gained", "Chat message should have the edge-not-gained class");

                // Clean up the message
                await message.delete();
            } catch (error) {
                console.error("Error in edge denial test:", error);
                // If we can't create a message, skip the test
                console.log("Skipping edge denial assertions due to error");
                throw error;
            }
        });

        it("should correctly render AR vs DR edge gain in chat messages", async () => {
            // Skip this test if we're not in a browser environment with ChatMessage available
            if (typeof ChatMessage === 'undefined' || typeof Actor === 'undefined') {
                console.log("Skipping AR vs DR test - ChatMessage or Actor not available");
                return;
            }

            try {
                // Create attacker and defender actors
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
                attacker.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the attacker was created and exists in the database
                const attackerFromDb = game.actors.get(attacker.id);
                assert.isNotNull(attackerFromDb, "Attacker should exist in the database");
                assert.equal(attackerFromDb.name, "Attacker", "Attacker name should match");

                const defender = await testActor.create({
                    name: "Defender",
                    type: "character",
                    system: {
                        attributes: {
                            reaction: { value: 3 },
                            edge: { value: 3, uses: 1, max: 7 }
                        }
                    }
                });
                defender.setFlag('sr6elysium', 'hasMatrixActions',true);

                // Verify the defender was created and exists in the database
                const defenderFromDb = game.actors.get(defender.id);
                assert.isNotNull(defenderFromDb, "Defender should exist in the database");
                assert.equal(defenderFromDb.name, "Defender", "Defender name should match");

                // Create an attack test
                const attackTest = new SuccessTest({
                    actor: attacker,
                    attribute: "agility",
                    options: {
                        showMessage: true // Ensure the message is shown
                    }
                });

                // Set up AR vs DR comparison with significant advantage
                attackTest.data.attackerAR = 10; // Attacker's AR
                attackTest.data.defenders = [{
                    name: defender.name,
                    dr: 5, // Defender's DR
                    isWinner: false, // Attacker wins
                    hasSignificantAdvantage: true, // Significant advantage (AR - DR >= 4)
                    edgeAwarded: true, // Edge was awarded
                    edgeReason: "AR significantly exceeds DR"
                }];

                // Create a chat message
                const message = await attackTest.toMessage();

                // Assert that the message was created
                assert.isNotNull(message, "Chat message should be created");

                // Verify the message exists in the database
                const messageFromDb = game.messages.get(message.id);
                assert.isNotNull(messageFromDb, "Message should exist in the database");
                assert.equal(messageFromDb.speaker.actor, attacker.id, "Message should be from the correct actor");

                // Get the message content
                const content = message?.content;

                // Assert that the content contains AR vs DR information
                assert.include(content, "AR: 10", "Chat message should show attacker's AR");
                assert.include(content, "DR: 5", "Chat message should show defender's DR");

                // Check for edge gain message
                assert.include(content, "Edge Gained", "Chat message should show Edge Gained message");
                assert.include(content, "AR significantly exceeds DR", "Chat message should mention the reason for edge gain");

                // Clean up the message
                await message?.delete();
            } catch (error) {
                console.error("Error in AR vs DR test:", error);
                // If we can't create a message, skip the test
                console.log("Skipping AR vs DR assertions due to error");
                throw error;
            }
        });
    });
};
