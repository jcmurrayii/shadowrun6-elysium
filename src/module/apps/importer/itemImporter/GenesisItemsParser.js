import { ItemsParser } from "./ItemsParser.js";

/**
 * Parses items from a Genesis character file.
 */
export class GenesisItemsParser extends ItemsParser {
    /**
     * Parses items from a Genesis character file.
     * @param {*} genesisCharacter The Genesis character data.
     * @param {*} importOptions Import options.
     * @returns An array of items.
     */
    parse(genesisCharacter, importOptions) {
        console.log('Parsing items from Genesis character');
        
        const items = [];
        
        // Parse weapons
        if (importOptions.weapons && genesisCharacter.weapons) {
            this.parseWeapons(items, genesisCharacter.weapons, importOptions);
        }
        
        // Parse armor
        if (importOptions.armor && genesisCharacter.armor) {
            this.parseArmor(items, genesisCharacter.armor, importOptions);
        }
        
        // Parse cyberware
        if (importOptions.cyberware && genesisCharacter.cyberware) {
            this.parseCyberware(items, genesisCharacter.cyberware, importOptions);
        }
        
        // Parse equipment
        if (importOptions.equipment && genesisCharacter.equipment) {
            this.parseEquipment(items, genesisCharacter.equipment, importOptions);
        }
        
        // Parse qualities
        if (importOptions.qualities && genesisCharacter.qualities) {
            this.parseQualities(items, genesisCharacter.qualities, importOptions);
        }
        
        // Parse powers
        if (importOptions.powers && genesisCharacter.powers) {
            this.parsePowers(items, genesisCharacter.powers, importOptions);
        }
        
        // Parse spells
        if (importOptions.spells && genesisCharacter.spells) {
            this.parseSpells(items, genesisCharacter.spells, importOptions);
        }
        
        // Parse contacts
        if (importOptions.contacts && genesisCharacter.contacts) {
            this.parseContacts(items, genesisCharacter.contacts, importOptions);
        }
        
        // Parse lifestyles
        if (importOptions.lifestyles && genesisCharacter.lifestyles) {
            this.parseLifestyles(items, genesisCharacter.lifestyles, importOptions);
        }
        
        return items;
    }
    
    /**
     * Parses weapons from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} weapons The weapons data.
     * @param {*} importOptions Import options.
     */
    parseWeapons(items, weapons, importOptions) {
        for (const weapon of weapons) {
            const weaponItem = {
                name: weapon.name,
                type: 'weapon',
                img: this.getWeaponIcon(weapon, importOptions),
                system: {
                    description: {
                        value: weapon.description || ''
                    },
                    technology: {
                        rating: weapon.rating || 0,
                        availability: {
                            value: weapon.availability || 0,
                            mod: weapon.availability_mod || ''
                        },
                        cost: weapon.cost || 0
                    },
                    action: {
                        type: 'major',
                        attribute: 'agility',
                        skill: this.getWeaponSkill(weapon),
                        limit: {
                            value: 0,
                            attribute: ''
                        }
                    },
                    range: this.getWeaponRange(weapon),
                    damage: {
                        type: {
                            value: weapon.damage_type || 'physical'
                        },
                        element: {
                            value: ''
                        },
                        value: weapon.damage || 0,
                        ap: {
                            value: weapon.ap || 0
                        }
                    },
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(weaponItem);
        }
    }
    
    /**
     * Gets the weapon skill based on the weapon type.
     * @param {*} weapon The weapon data.
     * @returns The weapon skill.
     */
    getWeaponSkill(weapon) {
        // Map weapon types to skills
        const skillMap = {
            'Melee': 'close_combat',
            'Ranged': 'firearms',
            'Throwing': 'athletics',
            'Unarmed': 'unarmed_combat'
        };
        
        return skillMap[weapon.type] || 'firearms';
    }
    
    /**
     * Gets the weapon range based on the weapon type.
     * @param {*} weapon The weapon data.
     * @returns The weapon range.
     */
    getWeaponRange(weapon) {
        if (weapon.type === 'Melee' || weapon.type === 'Unarmed') {
            return {
                category: 'melee',
                ranges: {
                    short: { value: 0 },
                    medium: { value: 0 },
                    long: { value: 0 },
                    extreme: { value: 0 }
                }
            };
        } else {
            return {
                category: 'standard',
                ranges: {
                    short: { value: weapon.range_short || 0 },
                    medium: { value: weapon.range_medium || 0 },
                    long: { value: weapon.range_long || 0 },
                    extreme: { value: weapon.range_extreme || 0 }
                }
            };
        }
    }
    
    /**
     * Gets an icon for a weapon.
     * @param {*} weapon The weapon data.
     * @param {*} importOptions Import options.
     * @returns The icon path.
     */
    getWeaponIcon(weapon, importOptions) {
        if (!importOptions.assignIcons) {
            return 'icons/svg/item-bag.svg';
        }
        
        // Map weapon types to icons
        const iconMap = {
            'Melee': 'systems/shadowrun6-elysium/dist/icons/redist/melee.svg',
            'Ranged': 'systems/shadowrun6-elysium/dist/icons/redist/gun.svg',
            'Throwing': 'systems/shadowrun6-elysium/dist/icons/redist/thrown.svg',
            'Unarmed': 'systems/shadowrun6-elysium/dist/icons/redist/unarmed.svg'
        };
        
        return iconMap[weapon.type] || 'icons/svg/item-bag.svg';
    }
    
    /**
     * Parses armor from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} armors The armor data.
     * @param {*} importOptions Import options.
     */
    parseArmor(items, armors, importOptions) {
        for (const armor of armors) {
            const armorItem = {
                name: armor.name,
                type: 'armor',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/armor.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: armor.description || ''
                    },
                    technology: {
                        rating: armor.rating || 0,
                        availability: {
                            value: armor.availability || 0,
                            mod: armor.availability_mod || ''
                        },
                        cost: armor.cost || 0
                    },
                    armor: {
                        value: armor.armor || 0,
                        base: armor.armor || 0,
                        mod: 0
                    },
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(armorItem);
        }
    }
    
    /**
     * Parses cyberware from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} cyberware The cyberware data.
     * @param {*} importOptions Import options.
     */
    parseCyberware(items, cyberware, importOptions) {
        for (const ware of cyberware) {
            const cyberwareItem = {
                name: ware.name,
                type: 'cyberware',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/cyberware.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: ware.description || ''
                    },
                    technology: {
                        rating: ware.rating || 0,
                        availability: {
                            value: ware.availability || 0,
                            mod: ware.availability_mod || ''
                        },
                        cost: ware.cost || 0
                    },
                    essence: ware.essence || 0,
                    grade: ware.grade || 'standard',
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(cyberwareItem);
        }
    }
    
    /**
     * Parses equipment from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} equipment The equipment data.
     * @param {*} importOptions Import options.
     */
    parseEquipment(items, equipment, importOptions) {
        for (const gear of equipment) {
            const gearItem = {
                name: gear.name,
                type: 'equipment',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/gear.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: gear.description || ''
                    },
                    technology: {
                        rating: gear.rating || 0,
                        availability: {
                            value: gear.availability || 0,
                            mod: gear.availability_mod || ''
                        },
                        cost: gear.cost || 0
                    },
                    quantity: gear.quantity || 1,
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(gearItem);
        }
    }
    
    /**
     * Parses qualities from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} qualities The qualities data.
     * @param {*} importOptions Import options.
     */
    parseQualities(items, qualities, importOptions) {
        for (const quality of qualities) {
            const qualityItem = {
                name: quality.name,
                type: 'quality',
                img: this.getQualityIcon(quality, importOptions),
                system: {
                    description: {
                        value: quality.description || ''
                    },
                    type: quality.type || 'positive',
                    rating: quality.rating || 1,
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(qualityItem);
        }
    }
    
    /**
     * Gets an icon for a quality.
     * @param {*} quality The quality data.
     * @param {*} importOptions Import options.
     * @returns The icon path.
     */
    getQualityIcon(quality, importOptions) {
        if (!importOptions.assignIcons) {
            return 'icons/svg/item-bag.svg';
        }
        
        // Map quality types to icons
        const iconMap = {
            'positive': 'systems/shadowrun6-elysium/dist/icons/redist/quality-positive.svg',
            'negative': 'systems/shadowrun6-elysium/dist/icons/redist/quality-negative.svg'
        };
        
        return iconMap[quality.type] || 'icons/svg/item-bag.svg';
    }
    
    /**
     * Parses powers from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} powers The powers data.
     * @param {*} importOptions Import options.
     */
    parsePowers(items, powers, importOptions) {
        for (const power of powers) {
            const powerItem = {
                name: power.name,
                type: 'adept_power',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/adept.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: power.description || ''
                    },
                    action: {
                        type: power.action_type || 'major',
                        skill: power.skill || '',
                        attribute: power.attribute || ''
                    },
                    pp: power.pp || 0,
                    rating: power.rating || 1,
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(powerItem);
        }
    }
    
    /**
     * Parses spells from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} spells The spells data.
     * @param {*} importOptions Import options.
     */
    parseSpells(items, spells, importOptions) {
        for (const spell of spells) {
            const spellItem = {
                name: spell.name,
                type: 'spell',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/spell.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: spell.description || ''
                    },
                    action: {
                        type: 'major',
                        skill: 'spellcasting',
                        attribute: 'magic'
                    },
                    drain: spell.drain || 0,
                    category: spell.category || 'combat',
                    type: spell.type || 'physical',
                    range: spell.range || 'los',
                    duration: spell.duration || 'instant',
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(spellItem);
        }
    }
    
    /**
     * Parses contacts from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} contacts The contacts data.
     * @param {*} importOptions Import options.
     */
    parseContacts(items, contacts, importOptions) {
        for (const contact of contacts) {
            const contactItem = {
                name: contact.name,
                type: 'contact',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/contact.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: contact.description || ''
                    },
                    connection: contact.connection || 1,
                    loyalty: contact.loyalty || 1,
                    type: contact.type || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(contactItem);
        }
    }
    
    /**
     * Parses lifestyles from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} lifestyles The lifestyles data.
     * @param {*} importOptions Import options.
     */
    parseLifestyles(items, lifestyles, importOptions) {
        for (const lifestyle of lifestyles) {
            const lifestyleItem = {
                name: lifestyle.name,
                type: 'lifestyle',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/lifestyle.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: lifestyle.description || ''
                    },
                    nuyen: lifestyle.cost || 0,
                    type: lifestyle.type || 'medium',
                    months: lifestyle.months || 1,
                    importFlags: {
                        isImported: true
                    }
                }
            };
            
            items.push(lifestyleItem);
        }
    }
}
