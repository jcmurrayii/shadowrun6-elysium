/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpriteType = keyof typeof SR6CONFIG.spriteTypes;

    export interface SpriteData extends
        CommonData,
        MatrixActorData {
            level: number;
            services: number;
            registered: boolean;
            spriteType: SpriteType;
            modifiers: Modifiers & CommonModifiers;

            // FoundryVTT uuid of the compiling technomancer of this sprite.
            technomancerUuid: string;
    }
}
