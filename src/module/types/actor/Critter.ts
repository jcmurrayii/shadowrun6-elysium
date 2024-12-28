/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type CritterType = keyof typeof SR6CONFIG.critterTypes;

    export interface CritterData extends
        CommonData, MagicActorData,
        TwoTrackActorData,
        ArmorActorData,
        WoundsActorData,
        MatrixActorData,
        MovementActorData,
        NPCActorData {
            values: PhysicalCombatValues
    }
}
