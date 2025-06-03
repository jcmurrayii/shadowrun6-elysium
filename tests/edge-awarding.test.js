/**
 * Tests for edge awarding functionality
 */

export const key = "shadowrun6e.edge-awarding";
export const options = {
  displayName: "Shadowrun 6e: Edge Awarding Tests"
};

export default function() {
  const { describe, it, assert, before, after } = QuenchTesting;

  describe("Edge Awarding Tests", function() {
    let testActor;
    let analyticalMindItem;

    before(async function() {
      // Create a test actor
      testActor = await Actor.create({
        name: "Edge Test Character",
        type: "character",
        system: {
          attributes: {
            logic: { value: 4 },
            agility: { value: 3 }
          },
          skills: {
            hacking: { value: 3 },
            firearms: { value: 2 }
          },
          edge: {
            max: 7,
            uses: 0
          }
        }
      });

      // Create the Analytical Mind quality
      analyticalMindItem = await Item.create({
        name: "Analytical Mind",
        type: "quality",
        system: {
          description: {
            value: "<p>You have a natural affinity for logic and analysis. You gain Edge when making Logic-based tests.</p>"
          },
          type: "positive",
          subtype: "mental",
          karma: 8
        },
        effects: [{
          _id: "effect1a1b2c3d4e5f6a1b2c3d4",
          label: "Logic Test: Edge gain",
          icon: "icons/svg/aura.svg",
          changes: [],
          disabled: false
        }]
      });
    });

    after(async function() {
      // Clean up
      if (testActor) await testActor.delete();
      if (analyticalMindItem) await analyticalMindItem.delete();
    });

    it("should award edge for Logic-based tests with Analytical Mind", async function() {
      // Add the Analytical Mind quality to the actor
      await testActor.createEmbeddedDocuments("Item", [analyticalMindItem.toObject()]);

      // Create a test using Logic
      const logicTest = new game.shadowrun6e.tests.SuccessTest({
        actor: testActor,
        attribute: "logic",
        pool: {
          attribute: "logic",
          skill: "hacking"
        }
      });

      // Set initial edge to 0
      await testActor.update({"system.edge.uses": 0});

      // Process the test
      await logicTest.execute();

      // Check if edge was awarded
      const newEdge = testActor.system.edge.uses;
      assert.equal(newEdge, 1, "Edge should be awarded for Logic-based test with Analytical Mind");

      // Check if edgeGain data was set correctly
      assert.isTrue(logicTest.data.edgeGain.gained, "edgeGain.gained should be true");
      assert.include(logicTest.data.edgeGain.effect, "Logic Test: Edge gain", "edgeGain.effect should mention Logic Test");
    });

    it("should not award edge for non-Logic tests with Analytical Mind", async function() {
      // Create a test using Agility
      const agilityTest = new game.shadowrun6e.tests.SuccessTest({
        actor: testActor,
        attribute: "agility",
        pool: {
          attribute: "agility",
          skill: "firearms"
        }
      });

      // Set initial edge to 0
      await testActor.update({"system.edge.uses": 0});

      // Process the test
      await agilityTest.execute();

      // Check if edge was not awarded
      const newEdge = testActor.system.edge.uses;
      assert.equal(newEdge, 0, "Edge should not be awarded for non-Logic test with Analytical Mind");

      // Check if edgeGain data was not set
      assert.isUndefined(agilityTest.data.edgeGain, "edgeGain should be undefined for non-matching test");
    });

    it("should not award edge when already at maximum edge", async function() {
      // Set initial edge to maximum
      await testActor.update({"system.edge.uses": 7});

      // Create a test using Logic
      const logicTest = new game.shadowrun6e.tests.SuccessTest({
        actor: testActor,
        attribute: "logic",
        pool: {
          attribute: "logic",
          skill: "hacking"
        }
      });

      // Process the test
      await logicTest.execute();

      // Check if edge was not awarded (still at max)
      const newEdge = testActor.system.edge.uses;
      assert.equal(newEdge, 7, "Edge should not be awarded when already at maximum");

      // Check if edgeGain data was set correctly
      assert.isFalse(logicTest.data.edgeGain.gained, "edgeGain.gained should be false");
      assert.include(logicTest.data.edgeGain.reason, "maximum Edge", "edgeGain.reason should mention maximum Edge");
    });

    it("should not award edge when already gained maximum edge this round", async function() {
      // Set initial edge to 0 and edgeGainedThisRound to 2
      await testActor.update({"system.edge.uses": 0});
      await testActor.setFlag("sr6elysium", "edgeGainedThisRound", 2);

      // Create a test using Logic
      const logicTest = new game.shadowrun6e.tests.SuccessTest({
        actor: testActor,
        attribute: "logic",
        pool: {
          attribute: "logic",
          skill: "hacking"
        }
      });

      // Process the test
      await logicTest.execute();

      // Check if edge was not awarded
      const newEdge = testActor.system.edge.uses;
      assert.equal(newEdge, 0, "Edge should not be awarded when already gained maximum edge this round");

      // Check if edgeGain data was set correctly
      assert.isFalse(logicTest.data.edgeGain.gained, "edgeGain.gained should be false");
      assert.include(logicTest.data.edgeGain.reason, "maximum Edge", "edgeGain.reason should mention maximum Edge");

      // Reset the flag for other tests
      await testActor.setFlag("sr6elysium", "edgeGainedThisRound", 0);
    });

    it("should correctly identify the default attribute for skill-only tests", async function() {
      // Create a test using just the Hacking skill (which uses Logic)
      const hackingTest = new game.shadowrun6e.tests.SuccessTest({
        actor: testActor,
        pool: {
          skill: "hacking"
        }
      });

      // Set initial edge to 0
      await testActor.update({"system.edge.uses": 0});

      // Process the test
      await hackingTest.execute();

      // Check if edge was awarded
      const newEdge = testActor.system.edge.uses;
      assert.equal(newEdge, 1, "Edge should be awarded for Hacking test with Analytical Mind");

      // Check if edgeGain data was set correctly
      assert.isTrue(hackingTest.data.edgeGain.gained, "edgeGain.gained should be true");
    });
  });
}
