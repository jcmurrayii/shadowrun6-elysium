import { shadowrunRolling } from './sr5.SR5Roll.spec';
import { shadowrunSR5RangedWeaponRules } from './sr5.RangedWeapon.spec';
import { shadowrunAttackTesting } from './sr5.AttackTests.spec';
import { shadowrunRulesModifiers } from './sr5.Modifiers.spec';
import { shadowrunSR5Item } from './sr5.SR5Item.spec';
import { shadowrunMatrix } from './sr5.Matrix.spec';
import { shadowrunSR5Actor } from './sr5.SR5Actor.spec';
import { shadowrunSR5CharacterDataPrep } from './sr5.CharacterDataPrep.spec';
import { shadowrunSR5CritterDataPrep } from './sr5.CritterDataPrep.spec';
import { shadowrunSR5SpiritDataPrep } from './sr5.SpiritDataPrep.spec';
import { shadowrunSR5SpriteDataPrep } from './sr5.SpriteDataPrep.spec';
import { shadowrunSR5ICDataPrep } from './sr5.ICDataPrep.spec';
import { shadowrunSR5VehicleDataPrep } from './sr5.VehicleDataPrep.spec';
import { shadowrunSR5ActiveEffect } from './sr5.ActiveEffect.spec';
import { shadowrunNetworkDevices } from './sr5.NetworkDevices.spec';
import { shadowrunTesting } from './sr5.Testing.spec';
import { shadowrunInventoryFlow } from './sr5.Inventory.spec';
import { weaponParserBaseTesting } from './sr5.WeaponParser.spec';
import { characterImporterTesting } from './actorImport/characterImporter/sr5.CharacterImporter.spec';
import { characterInfoUpdaterTesting } from './actorImport/characterImporter/sr5.CharacterInfoUpdater.spec';
import { spiritImporterTesting } from './actorImport/spiritImporter/sr5.SpiritImporter.spec';
import { spiritInfoUpdaterTesting } from './actorImport/spiritImporter/sr5.SpiritInfoUpdater.spec';
import { weaponParserTesting } from './actorImport/itemImporter/weaponImport/sr5.WeaponImport.spec';
import { mountedWeaponParserTesting } from './actorImport/itemImporter/vehicleImport/sr5.VehicleImporterMountedWeapon.spec';
import { shadowrunSR5ItemDataPrep } from './sr5.ItemDataPrep.spec';
import { vehicleImporterTesting } from './actorImport/itemImporter/vehicleImport/sr5.VehicleImporter.spec';
import { vehicleModParserTesting } from './actorImport/itemImporter/vehicleImport/sr5.VehicleModImporter.spec';
import { shadowrunEdgeTesting} from './sr6.Edge.spec';
import { shadowrunAmmoDescriptionTesting } from './sr6.AmmoDescription.spec';

import { Quench } from '@ethaks/fvtt-quench';

/**
 * Register FoundryVTT Quench test batches...
 *
 * @params quench Quench unittest registry
 * https://github.com/Ethaks/FVTT-Quench
 */
export const quenchRegister = (quench: Quench) => {
    if (!quench) return;

    console.info('Shadowrun 5e | Registering quench unittests');
    console.warn(
        'Shadowrun 5e | Be aware that FoundryVTT will tank in update performance when a lot of documents are in collections. This is the case if you have all Chummer items imported and might cause tests to cross the 2000ms quench timeout threshold. Clear those collections in a test world. :)',
    );

    quench.registerBatch('sr6elysium.rules.matrix', shadowrunMatrix, {
        displayName: 'sr6elysium: Matrix Rules Test',
    });
    quench.registerBatch('sr6elysium.rules.modifiers', shadowrunRulesModifiers, {
        displayName: 'sr6elysium: Modifiers Rules Test',
    });
    quench.registerBatch('sr6elysium.rules.ranged_weapon', shadowrunSR5RangedWeaponRules, {
        displayName: 'sr6elysium: Ranged Weapon Rules Test',
    });

    quench.registerBatch('sr6elysium.characterImporter', characterImporterTesting, {
        displayName: 'sr6elysium: Chummer Character Importer',
    });
    quench.registerBatch('sr6elysium.characterInfoUpdater', characterInfoUpdaterTesting, {
        displayName: 'sr6elysium: Chummer Character Info Updater',
    });
    quench.registerBatch('sr6elysium.spiritImporter', spiritImporterTesting, {
        displayName: 'sr6elysium: Chummer Spirit Importer',
    });
    quench.registerBatch('sr6elysium.spiritInfoUpdater', spiritInfoUpdaterTesting, {
        displayName: 'sr6elysium: Chummer Spirit Info Updater',
    });
    quench.registerBatch('sr6elysium.importerWeapons', weaponParserTesting, {
        displayName: 'sr6elysium: Chummer Actor Weapon Importer',
    });
    quench.registerBatch('sr6elysium.importerVehicles', vehicleImporterTesting, {
        displayName: 'sr6elysium: Chummer Vehicle Importer',
    });
    quench.registerBatch('sr6elysium.importerVehicleMountedWeapons', mountedWeaponParserTesting, {
        displayName: 'sr6elysium: Chummer Vehicle Mounted Weapon Importer',
    });
    quench.registerBatch('sr6elysium.importerVehicleMods', vehicleModParserTesting, {
        displayName: 'sr6elysium: Chummer Vehicle Modification Importer',
    });

    quench.registerBatch('sr6elysium.entities.items', shadowrunSR5Item, { displayName: 'sr6elysium: SR6Item Test' });
    quench.registerBatch('sr6elysium.entities.actors', shadowrunSR5Actor, {
        displayName: 'sr6elysium: SR6Actor Test',
    });
    quench.registerBatch('sr6elysium.entities.effects', shadowrunSR5ActiveEffect, {
        displayName: 'sr6elysium: SR6ActiveEffect Test',
    });

    quench.registerBatch('sr6elysium.data_prep.character', shadowrunSR5CharacterDataPrep, {
        displayName: 'sr6elysium: SR5CharacterDataPreparation Test',
    });
    quench.registerBatch('sr6elysium.data_prep.critter', shadowrunSR5CritterDataPrep, {
        displayName: 'sr6elysium: SR5CritterDataPreparation Test',
    });
    quench.registerBatch('sr6elysium.data_prep.sprite', shadowrunSR5SpriteDataPrep, {
        displayName: 'sr6elysium: SR5CSpriteDataPreparation Test',
    });
    quench.registerBatch('sr6elysium.data_prep.spirit', shadowrunSR5SpiritDataPrep, {
        displayName: 'sr6elysium: SR5SpiritDataPreparation Test',
    });
    quench.registerBatch('sr6elysium.data_prep.ic', shadowrunSR5ICDataPrep, {
        displayName: 'sr6elysium: SR5ICDataPreparation Test',
    });
    quench.registerBatch('sr6elysium.data_prep.vehicle', shadowrunSR5VehicleDataPrep, {
        displayName: 'sr6elysium: SR5VehicleDataPreparation Test',
    });

    quench.registerBatch('sr6elysium.data_prep.item', shadowrunSR5ItemDataPrep, {
        displayName: 'sr6elysium: SR5ItemDataPreparation Test',
    });

    quench.registerBatch('sr6elysium.flow.networkDevices', shadowrunNetworkDevices, {
        displayName: 'sr6elysium: Matrix Network Devices Test',
    });
    quench.registerBatch('sr6elysium.flow.inventory', shadowrunInventoryFlow, {
        displayName: 'sr6elysium: InventoryFlow Test',
    });
    quench.registerBatch('sr6elysium.flow.tests', shadowrunTesting, { displayName: 'sr6elysium: SuccessTest Test' });
    quench.registerBatch('sr6elysium.flow.tests_attack', shadowrunAttackTesting, {
        displayName: 'sr6elysium: Attack Test',
    });
    quench.registerBatch('sr6elysium.flow.sr5roll', shadowrunRolling, { displayName: 'sr6elysium: SR6Roll' });

    quench.registerBatch('sr6elysium.parser.weapon', weaponParserBaseTesting, {
        displayName: 'sr6elysium: Data Importer Weapon Parsing',
    });

    quench.registerBatch('sr6.Edge.spec.ts', shadowrunEdgeTesting, {
        displayName: 'sr6elysium: Edge Rules',
    });

    quench.registerBatch('sr6.AmmoDescription.spec.ts', shadowrunAmmoDescriptionTesting, {
        displayName: 'sr6elysium: Ammo Description in Chat Cards',
    });
};
