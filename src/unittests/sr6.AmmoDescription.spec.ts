import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR6TestingDocuments } from './utils';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6Item } from '../module/item/SR6Item';
import { DataDefaults } from '../module/data/DataDefaults';
import { RangedAttackTest } from '../module/tests/RangedAttackTest';

export const shadowrunAmmoDescriptionTesting = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

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

    describe('Ammo Description in Chat Cards', () => {
        it('should include ammo description in weapon attack chat message template data', async () => {
            // Create a test character
            const character = await testActor.create({
                type: 'character',
                name: 'Test Character'
            }) as SR6Actor;

            // Create a test weapon
            const weapon = await testItem.create({
                type: 'weapon',
                name: 'Test Pistol',
                system: {
                    category: 'range',
                    ammo: {
                        current: { value: 10, max: 15 },
                        spare_clips: { value: 2, max: 5 }
                    },
                    range: {
                        modes: {
                            single_shot: true,
                            semi_auto: true,
                            burst_fire: false,
                            full_auto: false
                        }
                    }
                }
            }) as SR6Item;

            // Create test ammo with description
            const ammo = await testItem.create({
                type: 'ammo',
                name: 'APDS Rounds',
                system: {
                    description: {
                        value: '<p>Armor-Piercing Discarding Sabot rounds provide enhanced penetration against armored targets.</p>'
                    },
                    technology: {
                        equipped: true
                    },
                    ap: -2,
                    damage: 0,
                    damageType: 'physical'
                }
            }) as SR6Item;

            // Add ammo to weapon
            await weapon.createEmbeddedDocuments('Item', [ammo]);
            
            // Add weapon to character
            await character.createEmbeddedDocuments('Item', [weapon]);

            // Create a ranged attack test
            const test = new RangedAttackTest({
                actor: character,
                item: weapon
            });

            // Prepare the message template data
            const templateData = await test._prepareMessageTemplateData();

            // Verify that ammo description is included
            assert.isString(templateData.ammoDescription, 'Ammo description should be a string');
            assert.isNotEmpty(templateData.ammoDescription, 'Ammo description should not be empty');
            assert.include(templateData.ammoDescription, 'Armor-Piercing', 'Ammo description should contain the expected text');
            
            // Verify that ammo name is included
            assert.strictEqual(templateData.ammoName, 'APDS Rounds', 'Ammo name should match the equipped ammo');
        });

        it('should not include ammo description when no ammo is equipped', async () => {
            // Create a test character
            const character = await testActor.create({
                type: 'character',
                name: 'Test Character'
            }) as SR6Actor;

            // Create a test weapon without ammo
            const weapon = await testItem.create({
                type: 'weapon',
                name: 'Test Pistol',
                system: {
                    category: 'range',
                    ammo: {
                        current: { value: 0, max: 15 },
                        spare_clips: { value: 0, max: 5 }
                    }
                }
            }) as SR6Item;

            // Add weapon to character
            await character.createEmbeddedDocuments('Item', [weapon]);

            // Create a ranged attack test
            const test = new RangedAttackTest({
                actor: character,
                item: weapon
            });

            // Prepare the message template data
            const templateData = await test._prepareMessageTemplateData();

            // Verify that ammo description is empty
            assert.strictEqual(templateData.ammoDescription, '', 'Ammo description should be empty when no ammo is equipped');
            assert.strictEqual(templateData.ammoName, '', 'Ammo name should be empty when no ammo is equipped');
        });

        it('should not include ammo description for non-weapon items', async () => {
            // Create a test character
            const character = await testActor.create({
                type: 'character',
                name: 'Test Character'
            }) as SR6Actor;

            // Create a test spell (non-weapon item)
            const spell = await testItem.create({
                type: 'spell',
                name: 'Test Spell',
                system: {
                    description: {
                        value: '<p>A test spell description.</p>'
                    }
                }
            }) as SR6Item;

            // Add spell to character
            await character.createEmbeddedDocuments('Item', [spell]);

            // Create a test that uses the spell
            const test = new RangedAttackTest({
                actor: character,
                item: spell
            });

            // Prepare the message template data
            const templateData = await test._prepareMessageTemplateData();

            // Verify that ammo description is empty for non-weapon items
            assert.strictEqual(templateData.ammoDescription, '', 'Ammo description should be empty for non-weapon items');
            assert.strictEqual(templateData.ammoName, '', 'Ammo name should be empty for non-weapon items');
        });
    });
};
