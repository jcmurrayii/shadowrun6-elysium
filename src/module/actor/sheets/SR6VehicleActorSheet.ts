import {SR6BaseActorSheet} from "./SR6BaseActorSheet";
import SR6ActorSheetData = Shadowrun.SR6ActorSheetData;
import {SR6Actor} from "../SR6Actor";
import { SR6Item } from '../../item/SR6Item';
import { NetworkDeviceFlow } from '../../item/flows/NetworkDeviceFlow';

interface VehicleSheetDataFields {
    driver: SR6Actor|undefined
    networkController: SR6Item | undefined
}

interface VehicleActorSheetData extends SR6ActorSheetData {
    vehicle: VehicleSheetDataFields
}


export class SR6VehicleActorSheet extends SR6BaseActorSheet {
    /**
     * Vehicle actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
        ];
    }

    /**
     * Vehicle actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): string[] {
        const itemTypes = super.getInventoryItemTypes();

        return [
            ...itemTypes,
            'weapon',
            'ammo',
            'armor',
            'bioware',
            'cyberware',
            'device',
            'equipment',
            'modification'
        ];
    }

    override async getData(options) {
        const data = await super.getData(options);

        // Vehicle actor type specific fields.
        data.vehicle = await this._prepareVehicleFields();

        return data;
    }

    override activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Vehicle Sheet related handlers...
        html.find('.driver-remove').on('click', this._handleRemoveVehicleDriver.bind(this));

        // PAN/WAN
        html.find('.origin-link').on('click', this._onOpenOriginLink.bind(this));
        html.find('.controller-remove').on('click', this._onControllerRemove.bind(this));
    }

    /**
     * Vehicle specific drop events
     * @param event A DataTransferEvent containing some form of FoundryVTT Document / Data
     */
    override async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle specific system drop events.
        switch (dropData.type) {
            case "Actor":
                return await this.actor.addVehicleDriver(dropData.uuid)
        }

        // Handle none specific drop events.
        return super._onDrop(event);
    }

    async _prepareVehicleFields(): Promise<VehicleSheetDataFields> {
        const driver = this.actor.getVehicleDriver();

        const networkControllerLink = this.actor.getNetworkController();
        const networkController = networkControllerLink ? await NetworkDeviceFlow.resolveItemLink(networkControllerLink) : undefined;

        return {
            driver,
            networkController,
        };
    }

    async _handleRemoveVehicleDriver(event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
    }

    async _onOpenOriginLink(event) {
        event.preventDefault();

        console.log('Shadowrun 6e | Opening PAN/WAN network controller');

        const originLink = event.currentTarget.dataset.originLink;
        const device = await fromUuid(originLink);
        if (!device) return;

        // @ts-expect-error
        device.sheet.render(true);
    }

    async _onControllerRemove(event) {
        event.preventDefault();

        await NetworkDeviceFlow.removeDeviceFromController(this.actor);
    }
}
