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

        // Initialize defense rating
        armor.defense_rating.base = 0;
        armor.defense_rating.value = 0;

        const parts = new PartsList(armor.mod);
        const defenseRatingParts = new PartsList(armor.defense_rating.mod);
        const equippedArmor = items.filter((item) => item.couldHaveArmor() && item.isEquipped());

        console.log('Shadowrun 6e | Armor Preparation:', {
            equippedArmorItems: equippedArmor.map(item => ({
                name: item.getName(),
                baseDR: item.getBaseDefenseRating(),
                totalDR: item.getDefenseRating()
            })),
            initialArmor: foundry.utils.duplicate(armor)
        });

        // Calculate base DR from equipped armor
        equippedArmor?.forEach((item) => {
            // Set the base DR from the highest armor value
            const itemBaseDefenseRating = item.getBaseDefenseRating();
            if (itemBaseDefenseRating > armor.defense_rating.base) {
                armor.defense_rating.base = itemBaseDefenseRating;
            }

            // Add any DR modifiers from the item
            defenseRatingParts.addPart(item.getName(), item.getDefenseRating() - itemBaseDefenseRating);

            // Apply elemental modifiers
            for (const element of Object.keys(SR6.elementTypes)) {
                armor[element] += item.getArmorElements()[element];
            }
        });

        // Calculate total DR including modifiers
        armor.defense_rating.value = Helpers.calcTotal(armor.defense_rating);

        console.log('Shadowrun 6e | After Armor Preparation:', {
            finalArmor: foundry.utils.duplicate(armor),
            defenseRatingParts: defenseRatingParts
        });
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
