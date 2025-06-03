import { SR6Item } from '../module/item/SR6Item';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpriteDataPrep = (context: QuenchBatchContext) => {
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

    describe('SpriteDataPrep', () => {
        it('Sprites are always resonat', async () => {
            const sprite = await testActor.create({ type: 'sprite' });
            assert.strictEqual(sprite.system.special, 'resonance');
        });

        it('visibility checks', async () => {
            const actor = await testActor.create({ type: 'sprite' });
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('Sprites default/override values by example type', async () => {
            const actor = await testActor.create({ type: 'sprite', 'system.spriteType': 'courier' }) as SR6Actor;
            let sprite = actor.asSprite() as Shadowrun.SpriteActorData;

            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 1);
            assert.strictEqual(sprite.system.matrix.firewall.base, 2);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 3);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 1);

            assert.strictEqual(sprite.system.skills.active.cracking.base, 0, "Cracking should be set by sprite type.");

            await actor.update({
                'system.level': 6
            });

            sprite = actor.asSprite() as Shadowrun.SpriteActorData;

            assert.strictEqual(sprite.system.level, 6);

            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);
            assert.strictEqual(sprite.system.matrix.data_processing.base, 7);
            assert.strictEqual(sprite.system.matrix.firewall.base, 8);
            assert.strictEqual(sprite.system.matrix.sleaze.base, 9);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 13);
            assert.strictEqual(sprite.system.initiative.matrix.dice.base, 4);

            assert.strictEqual(sprite.system.skills.active.cracking.base, 6);
            assert.strictEqual(sprite.system.skills.active.electronics.base, 6); // all sprites
        })

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const actor = await testActor.create({ type: 'sprite' }) as SR6Actor;

            let sprite = actor.asSprite() as Shadowrun.SpriteActorData;
            assert.equal(sprite.system.matrix.condition_monitor.max, 8);

            await actor.update({ 'system.modifiers.matrix_track': 1 });
            sprite = actor.asSprite() as Shadowrun.SpriteActorData;
            assert.equal(sprite.system.matrix.condition_monitor.max, 9);
        });
    });
};
