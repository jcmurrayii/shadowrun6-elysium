import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;

export class MeleeParser extends WeaponParserBase {
    override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        item.system.melee.reach = ImportHelper.IntValue(jsonData, 'reach');

        // Check if the weapon has a specific attribute set
        const attribute = ImportHelper.StringValue(jsonData, 'attribute');
        if (attribute === 'agility') {
            item.system.melee.attribute = 'agility';
        }

        return item;
    }
}
