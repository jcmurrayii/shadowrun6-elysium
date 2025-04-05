import { SR6 } from '../../../config';

export class Constants {
    public static readonly MAP_CATEGORY_TO_SKILL = {
        'Assault Cannons': 'firearms',
        'Assault Rifles': 'firearms',
        'Blades': 'close_combat',
        'Bows': 'exotic_ranged',
        'Carbines': 'firearms',
        'Clubs': 'close_combat',
        'Crossbows': 'exotic_ranged',
        'Exotic Melee Weapons': 'exotic_melee',
        'Exotic Ranged Weapons': 'exotic_ranged',
        'Flamethrowers': 'exotic_ranged',
        'Grenade Launchers': 'exotic_ranged',
        'Heavy Machine Guns': 'exotic_ranged',
        'Heavy Pistols': 'firearms',
        'Holdouts': 'firearms',
        'Laser Weapons': 'exotic_ranged',
        'Light Machine Guns': 'firearms',
        'Light Pistols': 'firearms',
        'Machine Pistols': 'firearms',
        'Medium Machine Guns': 'firearms',
        'Missile Launchers': 'exotic_ranged',
        'Shotguns': 'firearms',
        'Sniper Rifles': 'firearms',
        'Sporting Rifles': 'firearms',
        'Submachine Guns': 'firearms',
        'Tasers': 'firearms',
        'Unarmed': 'unarmed_combat',
    };
    public static readonly MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY: {
        [key: string]: Exclude<keyof typeof SR6.weaponRangeCategories, "manual">;
    } = {
        'Tasers': 'taser',
        'Holdouts': 'holdOutPistol',
        'Light Pistols': 'lightPistol',
        'Heavy Pistols': 'heavyPistol',
        'Machine Pistols': 'machinePistol',
        'Submachine Guns': 'smg',
        'Assault Rifles': 'assaultRifle',
        'Shotguns': 'shotgunSlug',
        'Shotguns (slug)': 'shotgunSlug',
        'Shotguns (flechette)': 'shotgunFlechette',
        'Sniper Rifles': 'sniperRifle',
        'Sporting Rifles': 'sportingRifle',
        'Light Machine Guns': 'lightMachinegun',
        'Medium/Heavy Machinegun': 'mediumHeavyMachinegun',
        'Assault Cannons': 'assaultCannon',
        'Grenade Launchers': 'grenadeLauncher',
        'Missile Launchers': 'missileLauncher',
        'Bows': 'bow',
        'Light Crossbows': 'lightCrossbow',
        'Medium Crossbows': 'mediumCrossbow',
        'Heavy Crossbows': 'heavyCrossbow',
        'Thrown Knife': 'thrownKnife',
        'Net': 'net',
        'Shuriken': 'shuriken',
        'Standard Grenade': 'standardThrownGrenade',
        'Aerodynamic Grenade': 'aerodynamicThrownGrenade',
        'Harpoon Gun': 'harpoonGun',
        'Harpoon Gun (Underwater)': 'harpoonGunUnderwater',
        'Flamethrowers': 'flamethrower',
    } as const;

    public static readonly ROOT_IMPORT_FOLDER_NAME = 'SR5e';

    public static readonly MAP_CHUMMER_PROGRAMM_CATEGORY = {
        'Hacking Programs': 'hacking_program',
        'Common Programs': 'common_program'
    }
}
