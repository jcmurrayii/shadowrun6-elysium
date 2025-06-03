/**
 * Helper class to load test actors from the compendium
 */
export class TestActorLoader {
    /**
     * Load a test actor from the compendium
     * @param actorName The name of the actor to load
     * @returns The loaded actor, or undefined if not found
     */
    static async loadTestActor(actorName: string): Promise<Actor | undefined> {
        try {
            // Get the test actors compendium
            const pack = game.packs.get("sr6elysium.test-actors");
            if (!pack) {
                console.error("Shadowrun 6e | Test Actors compendium not found");
                return undefined;
            }

            // Get the index of the compendium
            await pack.getIndex();
            
            // Find the actor in the index
            const actorEntry = pack.index.find(entry => entry.name === actorName);
            if (!actorEntry) {
                console.error(`Shadowrun 6e | Test actor "${actorName}" not found in compendium`);
                return undefined;
            }

            // Load the actor from the compendium
            const actor = await pack.getDocument(actorEntry._id);
            if (!actor) {
                console.error(`Shadowrun 6e | Failed to load test actor "${actorName}" from compendium`);
                return undefined;
            }

            return actor;
        } catch (error) {
            console.error(`Shadowrun 6e | Error loading test actor "${actorName}":`, error);
            return undefined;
        }
    }

    /**
     * Import a test actor from the compendium into the current world
     * @param actorName The name of the actor to import
     * @returns The imported actor, or undefined if not found
     */
    static async importTestActor(actorName: string): Promise<Actor | undefined> {
        try {
            // Load the actor from the compendium
            const actor = await this.loadTestActor(actorName);
            if (!actor) return undefined;

            // Import the actor into the current world
            const imported = await Actor.create(actor.toObject());
            if (!imported) {
                console.error(`Shadowrun 6e | Failed to import test actor "${actorName}" into world`);
                return undefined;
            }

            return imported;
        } catch (error) {
            console.error(`Shadowrun 6e | Error importing test actor "${actorName}":`, error);
            return undefined;
        }
    }
}
