import { FireModeRules } from '../module/rules/FireModeRules';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR6 } from '../module/config';
import { SR6TestingDocuments } from './utils';
import { SR6Actor } from '../module/actor/SR6Actor';
import { SR6Item } from '../module/item/SR6Item';
import { DataDefaults } from '../module/data/DataDefaults';
import { CombatRules } from '../module/rules/CombatRules';
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import DamageData = Shadowrun.DamageData;

export const shadowrunAttackTesting = (context: QuenchBatchContext) => {
    const {describe, it,assert, before, after} = context;

    before(async () => {})
    after(async () => {})

    describe('Fire Mode Rules', () => {
        it('apply defense modifier per fire mode', () => {
            // Check no modifier
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR6.Weapon.Mode.SingleShot",
                value: 1,
                recoil: false,
                defense: 0,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 0);
            // Check positive modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR6.Weapon.Mode.SingleShot",
                value: 1,
                recoil: false,
                defense: 3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), 3);
            // Check correct negative modifiers
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR6.Weapon.Mode.SingleShot",
                value: 1,
                recoil: false,
                defense: -3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }), -3);
        })

        it('reduce defense modifier per firemode by ammo available', () => {
            // Check with enough ammo
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR6.Weapon.Mode.SingleShot",
                value: 3,
                recoil: false,
                defense: -3,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }, 3), -3);

            // Check with to little ammo
            assert.strictEqual(FireModeRules.fireModeDefenseModifier({
                label: "SR6.Weapon.Mode.SingleShot",
                value: 6,
                recoil: false,
                defense: -6,
                suppression: false,
                action: 'simple',
                mode: 'single_shot'
            }, 3), -3);
        })

        it('apply attack modifier per fire mode', () => {
            // A mode without recoil, shouldn't cause recoil modifiers.
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR6.Weapon.Mode.BurstFireLong",
                value: 6,
                recoil: false,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), 0);

            // No compensation should cause full recoil modifier
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR6.Weapon.Mode.BurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 0), -6);

            // recoil modifier should be reduced by compensation,
            // compensation shouldbe reduced
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR6.Weapon.Mode.BurstFireLong",
                value: 6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), -3);

            // handle faulty value input gracefully, don't fire. Keep compensation.
            assert.strictEqual(FireModeRules.recoilModifierAfterAttack({
                label: "SR6.Weapon.Mode.BurstFireLong",
                value: -6,
                recoil: true,
                defense: -5,
                suppression: false,
                action: 'complex',
                mode: 'burst_fire',
            }, 3), 0);
        })

        it('reduce the available fire modes', () => {
            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: true,
                semi_auto: true,
                burst_fire: true,
                full_auto: true
            }), SR6.fireModes.length);

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: true,
                semi_auto: false,
                burst_fire: false,
                full_auto: false
            }), 1); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: true,
                burst_fire: false,
                full_auto: false
            }), 2); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: false,
                burst_fire: true,
                full_auto: false
            }), 2); // per default rules only one single shot mode

            assert.lengthOf(FireModeRules.availableFireModes({
                single_shot: false,
                semi_auto: false,
                burst_fire: false,
                full_auto: true
            }), 3); // per default rules only one single shot mode
        })
    })

    describe('CombatRules', () => {
        let testActor;
        let testItem;
        let testScene;

        before(async () => {
            testActor = new SR6TestingDocuments(SR6Actor);
            testItem = new SR6TestingDocuments(SR6Item);
            testScene = new SR6TestingDocuments(Scene);
        });

        after(async () => {
            await testActor.teardown();
            await testItem.teardown();
            await testScene.teardown();
        })

        const getCharacterWithArmor = async (armorValue: number, {
            hardened = false
        }: {
            hardened?: boolean
        } = {}): Promise<SR6Actor> => {
            const characterActor = await testActor.create({
                type: 'character',
            }) as SR6Actor;
            const armor = await testItem.create({
                type: 'armor',
                name: 'Test Armor',
                system: {
                    armor: {
                        base: armorValue,
                        value: armorValue,
                        hardened,
                        mod: null, // Without this, the system defaults to an empty array for mod and thinks this is an armor accessory, therefore not applying hardened armor rules
                    },
                    technology: DataDefaults.technologyData({
                        equipped: true,
                    })
                }
            });
            await characterActor.createEmbeddedDocuments('Item',  [armor]);
            return characterActor;
        }

        const getVehicleWithArmor = async (armorValue: number): Promise<SR6Actor> => {
            const armor = DataDefaults.actorArmor({
                value: armorValue,
                base: armorValue,
            });
            return await testActor.create({
                type: 'vehicle', system: {
                    armor,
                },
            }) as SR6Actor;
        }

        const getDamage = (damageValue: number, {
            type = "physical",
            ap = 0,
            element,
        }: {
            type?: DamageType,
            ap?: number,
            element?: DamageElement
        } = {}): DamageData => {
            return DataDefaults.damageData({
                type: {
                    value: type,
                    base: type,
                },
                value: damageValue,
                base: damageValue,
                ...(ap && {
                    ap: {
                        base: ap,
                        value: ap,
                    }
                }),
                ...(element && {
                    element: {
                        base: element,
                        value: element,
                    }
                }),
            });
        }

        describe("isBlockedByVehicleArmor", () => {
            it('blocks damage due to vehicle armor', async () => {
                const vehicle = await getVehicleWithArmor(50);
                const damage = getDamage(4);

                const result:boolean = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicle);

                assert.strictEqual(result, true);
            });

            it("doesn't block damage for non-vehicle actors", async () => {
                const vehicleActor = await getVehicleWithArmor(50);
                const characterActor = await getCharacterWithArmor(50);
                const damage = getDamage(4);

                const characterResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, characterActor);
                const vehicleResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 2, vehicleActor);

                // @ts-ignore
                assert.isFalse(characterResult);
                // @ts-ignore
                assert.isTrue(vehicleResult);
            });

            it("takes net hits into account", async () => {
                const vehicle = await getVehicleWithArmor(6);
                const damage = getDamage(4);

                const blockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 4, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(damage, 5, 3, vehicle);

                // @ts-ignore
                assert.isTrue(blockedResult);
                // @ts-ignore
                assert.isFalse(notBlockedResult);
            });

            it("takes AP into account", async () => {
                const vehicle = await getVehicleWithArmor(6);
                // This is "high" AP but a negative number, just go with it
                const highApDamage = getDamage(4, { ap: -5 });
                const lowApDamage = getDamage(4, { ap: 5 });

                const blockedResult = CombatRules.isBlockedByVehicleArmor(lowApDamage, 5, 3, vehicle);
                const notBlockedResult = CombatRules.isBlockedByVehicleArmor(highApDamage, 5, 3, vehicle);

                // @ts-ignore
                assert.isTrue(blockedResult);
                // @ts-ignore
                assert.isFalse(notBlockedResult);
            });
        });

        describe("isBlockedByHardenedArmor", () => {
            it('blocks damage due to hardened armor', async () => {
                const vehicle = await getCharacterWithArmor(50, { hardened: true });
                const damage = getDamage(4);

                const result = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, vehicle);

                assert.strictEqual(result, true);
            });

            it("doesn't block damage for non-vehicle actors", async () => {
                const hardenedArmorActor = await getCharacterWithArmor(50, { hardened: true });
                const normalArmorActor = await getCharacterWithArmor(50);
                const damage = getDamage(4);

                const characterResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, normalArmorActor);
                const vehicleResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 2, hardenedArmorActor);

                assert.strictEqual(characterResult, false);
                assert.strictEqual(vehicleResult, true);
            });

            it("takes net hits into account", async () => {
                const actor = await getCharacterWithArmor(6, { hardened: true });
                const damage = getDamage(4);

                const blockedResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 4, actor);
                const notBlockedResult = CombatRules.isBlockedByHardenedArmor(damage, 5, 3, actor);

                assert.strictEqual(blockedResult, true);

                assert.strictEqual(notBlockedResult, false);
            });

            it("takes AP into account", async () => {
                const actor = await getCharacterWithArmor(6, { hardened: true });
                // This is "high" AP but a negative number, just go with it
                const highApDamage = getDamage(4, { ap: -5 });
                const lowApDamage = getDamage(4, { ap: 5 });

                const blockedResult = CombatRules.isBlockedByHardenedArmor(lowApDamage, 5, 3, actor);
                const notBlockedResult = CombatRules.isBlockedByHardenedArmor(highApDamage, 5, 3, actor);

                assert.isTrue(blockedResult);
                assert.isFalse(notBlockedResult);
            });
        });

        describe("doesNoPhysicalDamageToVehicle", () => {
            it("blocks non-physical damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR6Actor;
                const damage = getDamage(4, { type: 'stun' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isTrue(result);
            });

            it("does not block physical damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR6Actor;
                const damage = getDamage(4, { type: 'physical' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });

            it("does not block electric stun damage to vehicle", async () => {
                const vehicle = await testActor.create({ type: 'vehicle' }) as SR6Actor;
                const damage = getDamage(4, { type: 'stun', element: 'electricity' });

                const result = CombatRules.doesNoPhysicalDamageToVehicle(damage, vehicle);

                assert.isFalse(result);
            });
        });
    });
};
