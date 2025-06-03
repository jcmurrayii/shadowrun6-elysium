import { SR6Item } from '../module/item/SR6Item';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5ICDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR6TestingDocuments(SR6Actor);
        testItem = new SR6TestingDocuments(SR6Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })

    describe('ICDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const actor = await testActor.create({ type: 'ic' }) as SR6Actor;

            let ic = actor.asIC() as Shadowrun.ICActorData;
            assert.equal(ic.system.matrix.condition_monitor.max, 8, "Default Matrix condition monitor should be 8");

            await actor.update({ 'system.modifiers.matrix_track': 1 });
            ic = actor.asIC() as Shadowrun.ICActorData;
            assert.equal(ic.system.matrix.condition_monitor.max, 9, "Adjusted matrix condition monitor should be 9");
        });


        it('visibility checks', async () => {
            const actor = await testActor.create({ type: 'ic' }) as SR6Actor;
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('has meat attributes based on the host rating', async () => {
            const ic = await testActor.create({ type: 'ic', 'system.host.rating': 5}) as SR6Actor;

            assert.strictEqual(ic.system.attributes.agility.value, 5);
            assert.strictEqual(ic.system.attributes.reaction.value, 5);
            assert.strictEqual(ic.system.attributes.body.value, 5);
            assert.strictEqual(ic.system.attributes.strength.value, 5);
            assert.strictEqual(ic.system.attributes.logic.value, 5);
            assert.strictEqual(ic.system.attributes.willpower.value, 5);
            assert.strictEqual(ic.system.attributes.charisma.value, 5);
            assert.strictEqual(ic.system.attributes.intuition.value, 5);
        });

        it('has rating attribute based on the host rating', async () => {
            const ic = await testActor.create({ type: 'ic', 'system.host.rating': 5}) as SR6Actor;

            assert.strictEqual(ic.system.attributes.rating.value, 5);
        });
    });
};
