import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR6Item } from '../module/item/SR6Item';

/**
 * Unit tests around rules for ranged weapons.
 *
 * Recoil, firemode and so forth.
 * @param context
 */
export const shadowrunSR5RangedWeaponRules = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

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

    const getWeaponWithEquippedAmmo = async (weaponAmmo: number, weaponAmmoMax: number, ammoQuantity: number) => {
        const item = await testItem.create({type: 'weapon', system: {category: 'ranged', ammo: {current: {value: weaponAmmo, max: weaponAmmoMax}, clip_type: 'internal_magazin'}}}) as SR6Item;
        //@ts-expect-error
        const ammoItem = new SR6Item({type: 'ammo', name: 'ammo', system: {technology: {quantity: ammoQuantity, equipped: true}}}, {parent: item});
        await item.createNestedItem(ammoItem.toObject());

        // NOTE: I don't know why ammo is not equipped when created as such... this can be removed, if that is fixed.
        await item.equipAmmo(item.items[0].id);


        return item;
    };

    describe('Handle recoil, recoil compensation and recoil modifier', () => {
        // it('Combine actor and item recoil compensation', async () => {
        //     const actor = await testActor.create({type: 'character'});
        //     const item = await testItem.create({type: 'weapon', system: {category: 'ranged'}});
        //     const modification = new SR6Item({name: 'Mod', type: 'modification', system: {type: 'weapon', rc: 2}}, {parent: item});
        //     //@ts-expect-error TODO: foundry-vtt-types v10
        //     await item.createNestedItem(modification._source);
        //
        //     const character = actor.asCharacter() as Shadowrun.CharacterActorData;
        //     const actorRc = character.system.values.recoil_compensation.value;
        //     const itemRc = item.system.range?.rc.value;
        //
        //     assert.strictEqual(actorRc, 2);
        //     assert.strictEqual(itemRc, 2);
        // });

        it('Reload weapon causes reduction in available clips', async () => {
            const compItem = await testItem.create({type: 'weapon', system: {category: 'ranged', ammo: {current: {value: 0, max: 30}, spare_clips: {value: 1, max: 1}}}}) as SR6Item;
            const actor = await testActor.create({type: 'character'});
            await actor.createEmbeddedDocuments('Item', [compItem]);
            const item = actor.items.getName(compItem.name) as SR6Item;
            assert.strictEqual(item.system.ammo?.spare_clips.value, 1);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo?.spare_clips.value, 0);
        });

        it('Reloads weapon fully when no ammo is used', async () => {
            const compItem = await testItem.create({type: 'weapon', system: {category: 'ranged', ammo: {current: {value: 0, max: 30}, clip_type: 'internal_magazin'}}}) as SR6Item;
            const actor = await testActor.create({type: 'character'});
            await actor.createEmbeddedDocuments('Item', [compItem]);
            const item = actor.items.getName(compItem.name) as SR6Item;
            actor.system.attributes.agility.value = 30;
            console.log(item);
            assert.strictEqual(item.system.ammo?.current.value, 0);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo?.current.value, item.system.ammo?.current.max);
        });

        it('Reloads weapon fully when ammo is equipped and reduced ammo', async () => {
            // Set current bullets to partial value.
            const compItem = await getWeaponWithEquippedAmmo(15, 30, 30);
            const actor = await testActor.create({type: 'character'});
            await actor.createEmbeddedDocuments('Item', [compItem]);
            const item = actor.items.getName(compItem.name) as SR6Item;
            item.actor.system.attributes.agility.value = 20;

            const ammo = item.getEquippedAmmo();
            assert.strictEqual(item.system.ammo?.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 30);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo?.current.value, item.system.ammo?.current.max);
            assert.strictEqual(ammo.system.technology?.quantity, 15);
        });

        it('Does not reload when equipped ammo has no bullets left', async () => {
            // Set current bullets to partial value.
            const compItem = await getWeaponWithEquippedAmmo(15, 30, 0);
            const actor = await testActor.create({type: 'character'});
            await actor.createEmbeddedDocuments('Item', [compItem]);
            const item = actor.items.getName(compItem.name) as SR6Item;

            const ammo = item.getEquippedAmmo();
            assert.strictEqual(item.system.ammo?.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 0);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo?.current.value, 15);
            assert.strictEqual(ammo.system.technology?.quantity, 0);
        });

        it('Does partially reload when equipped ammo has some bullets left', async () => {
            // Set current bullets to partial value.
            const compItem = await getWeaponWithEquippedAmmo(15,30,10)
            const actor = await testActor.create({type: 'character'});
            await actor.createEmbeddedDocuments('Item', [compItem]);
            const item = actor.items.getName(compItem.name) as SR6Item;
            item.actor.system.attributes.agility.value = 10;


            assert.strictEqual(item.system.ammo?.current.value, 15);
            //assert.strictEqual(ammo.system.technology?.quantity, 10);
            await item.reloadAmmo(true);
            assert.strictEqual(item.system.ammo?.current.value, 25);
            //assert.strictEqual(ammo.system.technology?.quantity, 0);
        });
    });
}
