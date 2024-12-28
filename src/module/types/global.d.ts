import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;
import { SR6Item } from "../item/SR6Item";
import { SR6Actor } from "../actor/SR6Actor";
import { SR6Combat } from "../combat/SR6Combat";
import { SR6ActiveEffect } from "../effect/SR6ActiveEffect";
import { SR6Roll } from "../rolls/SR6Roll";
import { Translation } from '../utils/strings';

declare global {
    // Configuration of foundry-vtt-types
    interface LenientGlobalVariableTypes {
        game: never; // disable game ready checks
        canvas: never; // disable canvas ready checks
        socket: never; // disable socket ready checks
    }

    // Configuration of shadowrun6-elysium system
    interface SourceConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DataConfig {
        Item: ShadowrunItemData;
        Actor: ShadowrunActorData;
    }

    interface DocumentClassConfig {
        Item: typeof SR6Item;
        Actor: typeof SR6Actor;
        ActiveEffect: typeof SR6ActiveEffect;
        Combat: typeof SR6Combat;
        Roll: typeof SR6Roll;
    }

    // Declaration Merging
    interface DocumentClassConfig {
        sheet: FormApplication;
    }

    // Inject model basic structure into foundry-vtt-types
    interface Game {
        model: {
            Item: any;
            Actor: any;
            Card: any;
            Cards: any;
            JournalEntryPage: any;
        };
    }

    type RecursivePartial<T> = {
        [P in keyof T]?: RecursivePartial<T[P]>;
    };


    /**
     * Retrieve an Entity or Embedded Entity by its Universally Unique Identifier (uuid).
     * @param uuid - The uuid of the Entity or Embedded Entity to retrieve
     */
    declare function fromUuidSync(uuid: string): foundry.abstract.Document<any, any> | null;

    // Use declaration merging to add strong typing to Foundry's game.i18n localize and format functions,
    // sourcing valid translation strings from this system's english translations file
    declare class Localization {
        localize(stringId: Translation): string;

        format(stringId: Translation, data?: Record<string, unknown>): string;
    }
}
