import { SR6ItemDataWrapper } from '../../../data/SR6ItemDataWrapper';
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ArmorActorData = Shadowrun.ArmorActorData;
import {SR6} from "../../../config";
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class ItemPrep {
    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used (automatically takes the best one if multiple are equipped)
     * - all "accessories" will be added to the armor
     */
    static prepareArmor(system: ActorTypesData & ArmorActorData, items: SR6ItemDataWrapper[]) {
        const { armor } = system;
        armor.base = 0;
        armor.value = 0;

        for (const element of Object.keys(SR6.elementTypes)) {
            armor[element] = 0;
        }

        const armorModParts = new PartsList<number>(armor.mod);
        const equippedArmor = items.filter((item) => item.couldHaveArmor() && item.isEquipped());
        equippedArmor?.forEach((item) => {
            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (item.hasArmor()) {
                // We allow only one base armor but multiple armor accessories
                if (item.hasArmorAccessory()) {
                    armorModParts.addUniquePart(item.getName(), item.getArmorValue());
                }
                else {
                    const armorValue = item.getArmorValue();
                    if (armorValue > armor.base) {
                        armor.base = item.getArmorValue();
                        armor.label = item.getName();
                        armor.hardened = item.getHardened();
                    }
                }
            }

            // Apply elemental modifiers of all worn armor and clothing SR5#169.
            for (const element of Object.keys(SR6.elementTypes)) {
                armor[element] += item.getArmorElements()[element];
            }
        });

        if (system.modifiers['armor']) armorModParts.addUniquePart(game.i18n.localize('SR6.Bonus'), system.modifiers['armor']);
        // SET ARMOR
        armor.value = Helpers.calcTotal(armor);
    }
    /**
     * Apply all changes to an actor by their 'ware items.
     *
     * Modify essence by items essence loss
     */
    static prepareWareEssenceLoss(system: ActorTypesData, items: SR6ItemDataWrapper[]) {
        const parts = new PartsList<number>(system.attributes.essence.mod);

        items
            .filter((item) => item.isBodyware() && item.isEquipped())
            .forEach((item) => {
                if (item.getEssenceLoss()) {
                    parts.addPart(item.getName(), -item.getEssenceLoss());
                }
            });

        system.attributes.essence.mod = parts.list;
    }

    static prepareWeapons(system: Shadowrun.CharacterData, items: SR6ItemDataWrapper[]) {
        
    }
}
