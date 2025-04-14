import { PartsList } from '../parts/PartsList';
import ModList = Shadowrun.ModList;
import {Helpers} from "../helpers";
import {SafeString} from "handlebars";
import DamageData = Shadowrun.DamageData;
import ModListEntry = Shadowrun.ModListEntry;
import {SR6Actor} from "../actor/SR6Actor";
import {FLAGS, SYSTEM_NAME} from "../constants";

export const registerRollAndLabelHelpers = () => {
    Handlebars.registerHelper('damageAbbreviation', function (damage) {
        if (damage === 'physical') return 'P';
        if (damage === 'stun') return 'S';
        if (damage === 'matrix') return 'M';
        return '';
    });

    Handlebars.registerHelper('damageCode', function(damage: DamageData): SafeString {
        // Add null checks to prevent errors when damage or damage.type is undefined
        if (!damage) {
            console.log('Shadowrun 6e | Damage object is undefined in damageCode helper');
            return new Handlebars.SafeString('0S');
        }

        // Add debugging to see what's in the damage object
        console.log('Shadowrun 6e | Damage object in damageCode helper:', damage);

        // Make sure damage.value is defined
        let damageValue = 0;
        if (damage.value !== undefined) {
            damageValue = damage.value;
        } else if (damage.base !== undefined) {
            damageValue = damage.base;
        }

        // Handle empty or missing type
        let damageType = 'stun';
        if (damage.type) {
            if (damage.type.value && damage.type.value !== '') {
                damageType = damage.type.value;
            } else if (damage.type.base && damage.type.base !== '') {
                damageType = damage.type.base;
            }
        } else {
            // Create type object if it doesn't exist
            damage.type = { base: 'stun', value: 'stun' };
        }

        const typeCode = Handlebars.helpers.damageAbbreviation(damageType);
        let code = `${damageValue}${typeCode}`;
        console.log('Shadowrun 6e | Damage code generated:', code);
        return new Handlebars.SafeString(code);
    });

    Handlebars.registerHelper('diceIcon', function (side) {
        if (side) {
            switch (side) {
                case 1:
                    return 'red';
                case 2:
                    return 'grey';
                case 3:
                    return 'grey';
                case 4:
                    return 'grey';
                case 5:
                    return 'green';
                case 6:
                    return 'green';
            }
        }
    });

    Handlebars.registerHelper('elementIcon', function (element) {
        let icon = '';
        if (element === 'electricity') {
            icon = 'fas fa-bolt';
        } else if (element === 'radiation') {
            icon = 'fas fa-radiation-alt';
        } else if (element === 'fire') {
            icon = 'fas fa-fire';
        } else if (element === 'acid') {
            icon = 'fas fa-vials';
        } else if (element === 'cold') {
            icon = 'fas fa-snowflake';
        }
        return icon;
    });

    Handlebars.registerHelper('partsTotal', function (partsList: ModList<number>) {
        const parts = new PartsList(partsList);
        return parts.total;
    });

    Handlebars.registerHelper('signedValue', function (value: number) {
        return value > 0 ?  `+${value}`: `${value}`;
    });

    Handlebars.registerHelper('speakerName', Helpers.getChatSpeakerName);
    Handlebars.registerHelper('speakerImg', Helpers.getChatSpeakerImg);
    Handlebars.registerHelper("defenseRating", Helpers.getDefenseRating);
    Handlebars.registerHelper("attackRating", Helpers.getAttackRating)
};
