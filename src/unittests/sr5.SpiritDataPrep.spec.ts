import { SR6Item } from '../module/item/SR6Item';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpiritDataPrep = (context: QuenchBatchContext) => {
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

    describe('SpiritDataPrep', () => {
        it('Spirits are always magical', async () => {
            const character = await testActor.create({ type: 'spirit' }) as SR6Actor;

            assert.strictEqual(character.system.special, 'magic');
        });

        it('visibility checks', async () => {
            const actor = await testActor.create({ type: 'spirit' }) as SR6Actor;
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, true);
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });


        it('Spirit default/overrides by example type', async () => {
            const actor = await testActor.create({ type: 'spirit', 'system.spiritType': 'air' }) as SR6Actor;
            let spirit = actor.asSpirit() as Shadowrun.SpiritActorData;

            // Without adequate force there will be negative base values with minimum attribute values.
            assert.strictEqual(spirit.system.attributes.body.base, -2);
            assert.strictEqual(spirit.system.attributes.agility.base, 3);
            assert.strictEqual(spirit.system.attributes.reaction.base, 4);
            assert.strictEqual(spirit.system.attributes.strength.base, -3);
            assert.strictEqual(spirit.system.attributes.intuition.base, 0);

            assert.strictEqual(spirit.system.initiative.meatspace.base.base, 4); // force * 2 + override;

            assert.strictEqual(spirit.system.skills.active.astral.base, 0);

            await actor.update({
                'system.force': 6
            });

            spirit = actor.asSpirit() as Shadowrun.SpiritActorData;

            assert.strictEqual(spirit.system.attributes.body.base, 4);
            assert.strictEqual(spirit.system.attributes.agility.base, 9);
            assert.strictEqual(spirit.system.attributes.reaction.base, 10);
            assert.strictEqual(spirit.system.attributes.strength.base, 3);
            assert.strictEqual(spirit.system.attributes.intuition.base, 6); // set by force without spirit type mods.

            assert.strictEqual(spirit.system.initiative.meatspace.base.base, 16);

            assert.strictEqual(spirit.system.skills.active.astral.base, 6);
            assert.strictEqual(spirit.system.skills.active.sorcery.base, 0); // not for this spirit type.
        });

        it('Spirit recoil compensation', () => {
            let actor = new SR6Actor({ name: 'Testing', type: 'spirit', system: { attributes: { strength: { base: 5 } } } });
            let spirit = actor.asSpirit();
            if (!spirit) return assert.fail();

            assert.strictEqual(spirit.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1
        });
        it('A NPC Grunt should only have physical track', async () => {
            const actor = await testActor.create({ type: 'spirit', 'system.is_npc': true, 'system.npc.is_grunt': true }) as SR6Actor;
            const character = actor.asSpirit() as unknown as Shadowrun.CharacterActorData;

            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.disabled, true);
            assert.strictEqual(character.system.track.physical.disabled, false);
        });
    });
};
