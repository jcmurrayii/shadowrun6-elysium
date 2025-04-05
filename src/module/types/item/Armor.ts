/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export interface ArmorData extends
        ArmorPartData,
        DescriptionPartData,
        ImportFlags,
        TechnologyPartData {

    }

    export interface ArmorPartData {
        armor: {
            defense_rating: ModifiableValue;
            mod: boolean;
            value: number;
            acid: number;
            cold: number;
            fire: number;
            electricity: number;
            radiation: number;
            hardened: boolean;
        };
    }
}
