import { SR6Actor } from "../../actor/SR6Actor";
import { parseDropData } from "../../utils/sheets";
import { SR6BaseItemSheetData, SR6ItemSheet } from "../SR6ItemSheet";


interface SR6CallInActionSheetData extends SR6BaseItemSheetData {
    spirit: SR6Actor | null
    sprite: SR6Actor | null

    isForSpirit: boolean
    isForSprite: boolean
}

/**
 * Item Sheet implementation for the call in action item type.
 *
 * This shows creation / call in of different type of actor types by an actor
 * 'creator' or 'caller'. Summoner/Conjurer, Technomancer, etc.
 */
export class SR6CallInActionSheet extends SR6ItemSheet {
    override async getData(options: any): Promise<SR6CallInActionSheetData> {
        const data = await super.getData(options) as unknown as SR6BaseItemSheetData;

        const system = data.system as Shadowrun.CallInActionData;

        // Allow for prepared actors to be shown on sheet.
        const spirit = await this.prepareSpirit(system);
        const sprite = await this.prepareSprite(system)

        // Allow sheet to determine it's current creation mode.
        const isForSpirit = system.actor_type === 'spirit';
        const isForSprite = system.actor_type === 'sprite';

        return {
            ...data,
            spirit,
            sprite,
            isForSpirit,
            isForSprite
        }
    }

    /**
     * Summoning Sheets allow dropping of spirits onto them.
     * These spirits will be used as pre-configured actors to summon.
     */
    override async _onDrop(event: any) {
        event.preventDefault();
        event.stopPropagation();

        const data = parseDropData(event);
        if (!data) return;

        if (data.type !== 'Actor') return;
        const actor = await fromUuid(data.uuid) as SR6Actor;

        if (actor.isSpirit()) await this.updatePreparedSpirit(actor);
        if (actor.isSprite()) await this.updatePreparedSprite(actor);
    }

    override activateListeners(html: any): void {
        super.activateListeners(html);

        html.find('.spirit-remove').click(this.handleSpiritRemove.bind(this));
        html.find('.sprite-remove').click(this.handleSpriteRemove.bind(this));
    }

    /**
     * Summoning sheets can be connected to a pre-prepared spirit.
     * Supply that actor if it's available.
     *
     * @returns null should the configured spirit not exist anymore.
     */
    async prepareSpirit(system: Shadowrun.CallInActionData): Promise<SR6Actor|null> {
        if (!system.spirit.uuid) {
            return null;
        }
        return await fromUuid(system.spirit.uuid) as SR6Actor;
    }

    /**
     * Conjuring can be connected to a pre-prepared sprite.
     * Supply that actor if it's available.
     *
     * @returns null should the configured sprite not exist anymore.
     */
    async prepareSprite(system: Shadowrun.CallInActionData): Promise<SR6Actor|null> {
        if (!system.sprite.uuid) {
            return null;
        }
        return await fromUuid(system.sprite.uuid) as SR6Actor;
    }

    /**
     * Handling the removal of a spirit by any sheet action.
     */
    async handleSpiritRemove(event: any) {
        await this.item.update({'system.spirit.uuid': ''});
    }

    /**
     * User requested removal of the prepared sprite.
     */
    async handleSpriteRemove(event: any) {
        await this.item.update({'system.sprite.uuid': ''});
    }

    /**
     * Updating the summoning items prepared spirit.
     *
     * @param actor The prepared actor
     */
    async updatePreparedSpirit(actor: SR6Actor) {
        const spirit = actor.asSpirit();
        if (!spirit) return;

        await this.item.update({
            'system.spirit.uuid': actor.uuid,
            'system.spirit.type': spirit.system.spiritType,
            'system.spirit.force': spirit.system.force,
        });
    }

    /**
     * Update the compilation items prepared sprite.
     *
     * @param actor The prepared actor
     */
    async updatePreparedSprite(actor: SR6Actor) {
        const sprite = actor.asSprite();
        if (!sprite) return;

        await this.item.update({
            'system.sprite.uuid': actor.uuid,
            'system.sprite.type': sprite.system.spriteType,
            'system.sprite.level': sprite.system.level,
        });
    }
}
