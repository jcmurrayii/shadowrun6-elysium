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

    quench.registerBatch('shadowrun6-elysium.rules.matrix', shadowrunMatrix, {
        displayName: 'shadowrun6-elysium: Matrix Rules Test',
    });
    quench.registerBatch('shadowrun6-elysium.rules.modifiers', shadowrunRulesModifiers, {
        displayName: 'shadowrun6-elysium: Modifiers Rules Test',
    });
    quench.registerBatch('shadowrun6-elysium.rules.ranged_weapon', shadowrunSR5RangedWeaponRules, {
        displayName: 'shadowrun6-elysium: Ranged Weapon Rules Test',
    });

    quench.registerBatch('shadowrun6-elysium.characterImporter', characterImporterTesting, {
        displayName: 'shadowrun6-elysium: Chummer Character Importer',
    });
    quench.registerBatch('shadowrun6-elysium.characterInfoUpdater', characterInfoUpdaterTesting, {
        displayName: 'shadowrun6-elysium: Chummer Character Info Updater',
    });
    quench.registerBatch('shadowrun6-elysium.spiritImporter', spiritImporterTesting, {
        displayName: 'shadowrun6-elysium: Chummer Spirit Importer',
    });
    quench.registerBatch('shadowrun6-elysium.spiritInfoUpdater', spiritInfoUpdaterTesting, {
        displayName: 'shadowrun6-elysium: Chummer Spirit Info Updater',
    });
    quench.registerBatch('shadowrun6-elysium.importerWeapons', weaponParserTesting, {
        displayName: 'shadowrun6-elysium: Chummer Actor Weapon Importer',
    });
    quench.registerBatch('shadowrun6-elysium.importerVehicles', vehicleImporterTesting, {
        displayName: 'shadowrun6-elysium: Chummer Vehicle Importer',
    });
    quench.registerBatch('shadowrun6-elysium.importerVehicleMountedWeapons', mountedWeaponParserTesting, {
        displayName: 'shadowrun6-elysium: Chummer Vehicle Mounted Weapon Importer',
    });
    quench.registerBatch('shadowrun6-elysium.importerVehicleMods', vehicleModParserTesting, {
        displayName: 'shadowrun6-elysium: Chummer Vehicle Modification Importer',
    });

    quench.registerBatch('shadowrun6-elysium.entities.items', shadowrunSR5Item, { displayName: 'shadowrun6-elysium: SR6Item Test' });
    quench.registerBatch('shadowrun6-elysium.entities.actors', shadowrunSR5Actor, {
        displayName: 'shadowrun6-elysium: SR6Actor Test',
    });
    quench.registerBatch('shadowrun6-elysium.entities.effects', shadowrunSR5ActiveEffect, {
        displayName: 'shadowrun6-elysium: SR6ActiveEffect Test',
    });

    quench.registerBatch('shadowrun6-elysium.data_prep.character', shadowrunSR5CharacterDataPrep, {
        displayName: 'shadowrun6-elysium: SR5CharacterDataPreparation Test',
    });
    quench.registerBatch('shadowrun6-elysium.data_prep.critter', shadowrunSR5CritterDataPrep, {
        displayName: 'shadowrun6-elysium: SR5CritterDataPreparation Test',
    });
    quench.registerBatch('shadowrun6-elysium.data_prep.sprite', shadowrunSR5SpriteDataPrep, {
        displayName: 'shadowrun6-elysium: SR5CSpriteDataPreparation Test',
    });
    quench.registerBatch('shadowrun6-elysium.data_prep.spirit', shadowrunSR5SpiritDataPrep, {
        displayName: 'shadowrun6-elysium: SR5SpiritDataPreparation Test',
    });
    quench.registerBatch('shadowrun6-elysium.data_prep.ic', shadowrunSR5ICDataPrep, {
        displayName: 'shadowrun6-elysium: SR5ICDataPreparation Test',
    });
    quench.registerBatch('shadowrun6-elysium.data_prep.vehicle', shadowrunSR5VehicleDataPrep, {
        displayName: 'shadowrun6-elysium: SR5VehicleDataPreparation Test',
    });

    quench.registerBatch('shadowrun6-elysium.data_prep.item', shadowrunSR5ItemDataPrep, {
        displayName: 'shadowrun6-elysium: SR5ItemDataPreparation Test',
    });

    quench.registerBatch('shadowrun6-elysium.flow.networkDevices', shadowrunNetworkDevices, {
        displayName: 'shadowrun6-elysium: Matrix Network Devices Test',
    });
    quench.registerBatch('shadowrun6-elysium.flow.inventory', shadowrunInventoryFlow, {
        displayName: 'shadowrun6-elysium: InventoryFlow Test',
    });
    quench.registerBatch('shadowrun6-elysium.flow.tests', shadowrunTesting, { displayName: 'shadowrun6-elysium: SuccessTest Test' });
    quench.registerBatch('shadowrun6-elysium.flow.tests_attack', shadowrunAttackTesting, {
        displayName: 'shadowrun6-elysium: Attack Test',
    });
    quench.registerBatch('shadowrun6-elysium.flow.sr5roll', shadowrunRolling, { displayName: 'shadowrun6-elysium: SR6Roll' });

    quench.registerBatch('shadowrun6-elysium.parser.weapon', weaponParserBaseTesting, {
        displayName: 'shadowrun6-elysium: Data Importer Weapon Parsing',
    });
};
