import { PartsList } from "../../../parts/PartsList";
import { SR6Item } from "../../SR6Item";
import { Helpers } from '../../../helpers';
/**
 * Weapon item data preparation
 */
export const RangePrep = {
    prepareData(range: Shadowrun.RangeWeaponData, equippedMods: SR6Item[]) {
        RangePrep.clearMods(range);
        RangePrep.prepareRecoilCompensation(range, equippedMods);
    },

    clearMods(range: Shadowrun.RangeWeaponData) {
        range.rc.mod = [];
    },
    /**
     * Prepare a ranged weapons recoil compensation.
     *
     * @param range The system range data for weapons to be altered.
     * @param equippedMods Those item mods that are equipped.
     */
    prepareRecoilCompensation(range: Shadowrun.RangeWeaponData, equippedMods: SR6Item[]) {
        const rangeParts = new PartsList<number>();

        // Apply ammo recoil compensation.
        equippedMods.forEach(mod => {
            if (mod.system.rc) rangeParts.addPart(mod.name as string, mod.system.rc);
        });
        range.rc.mod = rangeParts.list;
        range.rc.value = Helpers.calcTotal(range.rc);
    }
}
