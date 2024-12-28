declare namespace Shadowrun {
    export interface CritterPowerData extends
        CritterPowerPartData,
        ActionPartData,
        DescriptionPartData,
        ImportFlags,
        ArmorPartData {

    }

    export interface CritterPowerPartData {
        category: keyof typeof SR6CONFIG.critterPower.categories;
        powerType: string & keyof typeof SR6CONFIG.critterPower.types;
        range: CritterPowerRange;
        duration: keyof typeof SR6CONFIG.critterPower.durations;
        karma: number;
        rating: number;
    }

    export type CritterPowerCategory = 'mundane' | 'paranormal' | 'weakness' | 'emergent' | 'drake' | 'shapeshifter' | 'free_spirit' | 'paranormal_infected' | 'echoes' | '';
    export type CritterPowerRange = keyof typeof SR6CONFIG.critterPower.ranges;
}
