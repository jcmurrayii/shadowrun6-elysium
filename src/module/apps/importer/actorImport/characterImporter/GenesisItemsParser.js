import { ItemsParser } from "../itemImporter/ItemsParser.js";

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
        if (importOptions.weapons && genesisCharacter.longRangeWeapons) {
            this.parseWeapons(items, genesisCharacter.longRangeWeapons, importOptions);
        }

        // Parse close combat weapons
        if (importOptions.weapons && genesisCharacter.closeCombatWeapons) {
            this.parseCloseCombatWeapons(items, genesisCharacter.closeCombatWeapons, importOptions);
        }

        // Parse armor
        if (importOptions.armor && genesisCharacter.armors) {
            this.parseArmor(items, genesisCharacter.armors, importOptions);
        }

        // Parse cyberware
        if (importOptions.cyberware && genesisCharacter.augmentations) {
            this.parseCyberware(items, genesisCharacter.augmentations, importOptions);
        }

        // Parse equipment
        if (importOptions.equipment && genesisCharacter.items) {
            this.parseEquipment(items, genesisCharacter.items, importOptions);
        }

        // Parse matrix devices
        if (importOptions.equipment && genesisCharacter.matrixItems) {
            this.parseMatrixDevices(items, genesisCharacter.matrixItems, importOptions);
        }

        // Parse qualities
        if (importOptions.qualities && genesisCharacter.qualities) {
            this.parseQualities(items, genesisCharacter.qualities, importOptions);
        }

        // Parse powers
        if (importOptions.powers && genesisCharacter.adeptPowers) {
            this.parsePowers(items, genesisCharacter.adeptPowers, importOptions);
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

        // Parse SINs
        if (importOptions.equipment && genesisCharacter.sins) {
            this.parseSINs(items, genesisCharacter.sins, genesisCharacter.licenses, importOptions);
        }

        // Vehicles and drones are now handled as actors in GenesisImporter.js

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
            // Determine weapon type based on subtype
            let weaponType = 'ranged';
            let weaponCategory = '';

            if (weapon.subtype === 'PISTOLS_HEAVY') {
                weaponCategory = 'heavy_pistol';
            } else if (weapon.subtype === 'PISTOLS_LIGHT') {
                weaponCategory = 'light_pistol';
            } else if (weapon.subtype === 'RIFLES_ASSAULT') {
                weaponCategory = 'assault_rifle';
            } else if (weapon.subtype === 'RIFLES_SNIPER') {
                weaponCategory = 'sniper_rifle';
            } else if (weapon.subtype === 'SHOTGUNS') {
                weaponCategory = 'shotgun';
            } else if (weapon.subtype === 'SMGS') {
                weaponCategory = 'smg';
            } else if (weapon.subtype === 'MACHINE_GUNS') {
                weaponCategory = 'machine_gun';
            }

            // Parse damage value and type
            let damageValue = 0;
            let damageType = 'physical';

            if (weapon.damage) {
                const damageMatch = weapon.damage.match(/(\d+)([PS])/);
                if (damageMatch) {
                    damageValue = parseInt(damageMatch[1]) || 0;
                    damageType = damageMatch[2] === 'P' ? 'physical' : 'stun';
                }
            }

            // Parse attack rating
            let attackRating = { close: 0, near: 0, medium: 0, far: 0, extreme: 0 };

            if (weapon.attackRating) {
                const arValues = weapon.attackRating.split('/');
                if (arValues.length >= 5) {
                    attackRating.close = parseInt(arValues[0]) || 0;
                    attackRating.near = parseInt(arValues[1]) || 0;
                    attackRating.medium = parseInt(arValues[2]) || 0;
                    attackRating.far = parseInt(arValues[3]) || 0;
                    attackRating.extreme = parseInt(arValues[4]) || 0;
                }
            }

            // Parse fire modes
            let fireModes = [];

            if (weapon.mode) {
                if (weapon.mode.includes('SA')) fireModes.push('single_shot');
                if (weapon.mode.includes('BF')) fireModes.push('burst_fire');
                if (weapon.mode.includes('FA')) fireModes.push('full_auto');
            }

            const weaponItem = {
                name: weapon.name,
                type: 'weapon',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/gun.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: weapon.description || ''
                    },
                    technology: {
                        rating: 0,
                        availability: {
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    action: {
                        type: 'major',
                        attribute: 'agility',
                        skill: weapon.skill || 'firearms',
                        test: 'ranged_attack',
                        limit: {
                            value: 0,
                            attribute: ''
                        }
                    },
                    range: {
                        category: 'standard',
                        ranges: {
                            short: { value: attackRating.close },
                            medium: { value: attackRating.near },
                            long: { value: attackRating.medium },
                            extreme: { value: attackRating.far }
                        }
                    },
                    damage: {
                        type: {
                            value: damageType
                        },
                        element: {
                            value: ''
                        },
                        value: damageValue,
                        ap: {
                            value: 0
                        }
                    },
                    category: weaponCategory,
                    type: weaponType,
                    firingModes: fireModes,
                    ammo: {
                        current: weapon.ammunition ? parseInt(weapon.ammunition) || 0 : 0,
                        max: weapon.ammunition ? parseInt(weapon.ammunition) || 0 : 0
                    },
                    roll_mode: 'publicroll',
                    source: weapon.source || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            // Add weapon accessories if they exist
            if (weapon.accessories && weapon.accessories.length > 0) {
                weaponItem.system.accessories = [];

                for (const accessory of weapon.accessories) {
                    weaponItem.system.accessories.push({
                        name: accessory.name,
                        rating: accessory.rating || 0,
                        description: accessory.description || '',
                        equipped: true
                    });
                }
            }

            items.push(weaponItem);
        }
    }

    /**
     * Parses close combat weapons from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} weapons The weapons data.
     * @param {*} importOptions Import options.
     */
    parseCloseCombatWeapons(items, weapons, importOptions) {
        for (const weapon of weapons) {
            // Determine weapon type and category
            let weaponType = 'melee';
            let weaponCategory = '';

            if (weapon.subtype === 'UNARMED') {
                weaponCategory = 'unarmed';
            } else if (weapon.subtype === 'BLADES') {
                weaponCategory = 'blade';
            } else if (weapon.subtype === 'CLUBS') {
                weaponCategory = 'club';
            } else {
                weaponCategory = 'other';
            }

            // Parse damage value and type
            let damageValue = 0;
            let damageType = 'physical';

            if (weapon.damage) {
                const damageMatch = weapon.damage.match(/(\d+)([PS])/);
                if (damageMatch) {
                    damageValue = parseInt(damageMatch[1]) || 0;
                    damageType = damageMatch[2] === 'P' ? 'physical' : 'stun';
                }
            }

            // Parse attack rating
            let attackRating = { close: 0, near: 0, medium: 0, far: 0, extreme: 0 };

            if (weapon.attackRating) {
                const arValues = weapon.attackRating.split('/');
                if (arValues.length >= 1) {
                    attackRating.close = parseInt(arValues[0]) || 0;
                }
            }

            const weaponItem = {
                name: weapon.name,
                type: 'weapon',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/melee.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: weapon.description || ''
                    },
                    technology: {
                        rating: 0,
                        availability: {
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    action: {
                        type: 'major',
                        attribute: 'agility',
                        skill: weapon.skill || 'close_combat',
                        test: 'melee_attack',
                        limit: {
                            value: 0,
                            attribute: ''
                        }
                    },
                    range: {
                        category: 'melee',
                        ranges: {
                            short: { value: attackRating.close },
                            medium: { value: 0 },
                            long: { value: 0 },
                            extreme: { value: 0 }
                        }
                    },
                    damage: {
                        type: {
                            value: damageType
                        },
                        element: {
                            value: ''
                        },
                        value: damageValue,
                        ap: {
                            value: 0
                        }
                    },
                    category: weaponCategory,
                    type: weaponType,
                    roll_mode: 'publicroll',
                    source: weapon.source || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            // Add weapon accessories if they exist
            if (weapon.accessories && weapon.accessories.length > 0) {
                weaponItem.system.accessories = [];

                for (const accessory of weapon.accessories) {
                    weaponItem.system.accessories.push({
                        name: accessory.name,
                        rating: accessory.rating || 0,
                        description: accessory.description || '',
                        equipped: true
                    });
                }
            }

            items.push(weaponItem);
        }
    }

    /**
     * Parses armor from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} armors The armor data.
     * @param {*} importOptions Import options.
     */
    parseArmor(items, armors, importOptions) {
        for (const armor of armors) {
            if (armor.isIgnored) continue;

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
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    armor: {
                        value: armor.rating || 0,
                        base: armor.rating || 0,
                        mod: 0
                    },
                    source: armor.source || '',
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
                        rating: ware.level ? parseInt(ware.level) || 0 : 0,
                        availability: {
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    essence: ware.essence || 0,
                    grade: ware.quality ? ware.quality.toLowerCase() : 'standard',
                    source: ware.source || '',
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
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    quantity: gear.count || 1,
                    source: gear.source || '',
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
                img: importOptions.assignIcons ?
                    (quality.positive ? 'systems/shadowrun6-elysium/dist/icons/redist/quality-positive.svg' : 'systems/shadowrun6-elysium/dist/icons/redist/quality-negative.svg') :
                    'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: quality.description || ''
                    },
                    type: quality.positive ? 'positive' : 'negative',
                    rating: quality.rating || 1,
                    source: quality.source || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            items.push(qualityItem);
        }
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
                        type: 'major',
                        skill: '',
                        attribute: ''
                    },
                    pp: power.pp || 0,
                    rating: power.rating || 1,
                    source: power.source || '',
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
                    source: spell.source || '',
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
                    connection: contact.influence || 1,
                    loyalty: contact.loyalty || 1,
                    type: contact.type || '',
                    source: contact.source || '',
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
            // Map lifestyle type
            let lifestyleType = 'medium';
            if (lifestyle.type === 'STREET') {
                lifestyleType = 'street';
            } else if (lifestyle.type === 'SQUATTER') {
                lifestyleType = 'squatter';
            } else if (lifestyle.type === 'LOW') {
                lifestyleType = 'low';
            } else if (lifestyle.type === 'MEDIUM') {
                lifestyleType = 'medium';
            } else if (lifestyle.type === 'HIGH') {
                lifestyleType = 'high';
            } else if (lifestyle.type === 'LUXURY') {
                lifestyleType = 'luxury';
            }

            const lifestyleItem = {
                name: lifestyle.customName || lifestyle.name,
                type: 'lifestyle',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/lifestyle.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: lifestyle.description || ''
                    },
                    nuyen: lifestyle.cost || 0,
                    type: lifestyleType,
                    months: lifestyle.paidMonths || 1,
                    source: lifestyle.source || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            items.push(lifestyleItem);
        }
    }

    /**
     * Parses matrix devices from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} matrixItems The matrix items data.
     * @param {*} importOptions Import options.
     */
    parseMatrixDevices(items, matrixItems, importOptions) {
        for (const device of matrixItems) {
            // Determine device type based on subType
            let deviceType = 'device';
            let deviceCategory = '';
            let deviceIcon = 'systems/shadowrun6-elysium/dist/icons/redist/commlink.svg';

            if (device.subType === 'RIGGER_CONSOLE') {
                deviceCategory = 'rigger_console';
                deviceIcon = 'systems/shadowrun6-elysium/dist/icons/redist/rigger-console.svg';
            } else if (device.subType === 'CYBERDECK') {
                deviceCategory = 'cyberdeck';
                deviceIcon = 'systems/shadowrun6-elysium/dist/icons/redist/cyberdeck.svg';
            } else if (device.subType === 'COMMLINK') {
                deviceCategory = 'commlink';
                deviceIcon = 'systems/shadowrun6-elysium/dist/icons/redist/commlink.svg';
            }

            const deviceItem = {
                name: device.name,
                type: 'device',
                img: importOptions.assignIcons ? deviceIcon : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: device.description || ''
                    },
                    technology: {
                        rating: device.deviceRating || 0,
                        availability: {
                            value: 0,
                            mod: ''
                        },
                        cost: 0
                    },
                    category: deviceCategory,
                    type: deviceType,
                    matrix: {
                        attack: device.attack || 0,
                        sleaze: device.sleaze || 0,
                        data_processing: device.dataProcessing || 0,
                        firewall: device.firewall || 0
                    },
                    programs: {
                        max: device.concurrentPrograms || 0,
                        value: []
                    },
                    roll_mode: 'publicroll',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            // Add programs if they exist
            if (device.accessories && device.accessories.length > 0) {
                for (const accessory of device.accessories) {
                    if (accessory.subType === 'RIGGER_PROGRAM' ||
                        accessory.subType === 'HACKING_PROGRAM' ||
                        accessory.subType === 'COMMON_PROGRAM' ||
                        accessory.subType === 'OTHER_PROGRAMS') {
                        deviceItem.system.programs.value.push({
                            name: accessory.name,
                            rating: accessory.rating || 0,
                            equipped: true
                        });
                    }
                }
            }

            items.push(deviceItem);
        }
    }

    /**
     * Parses SINs and licenses from a Genesis character file.
     * @param {*} items The array to add items to.
     * @param {*} sins The SINs data.
     * @param {*} licenses The licenses data.
     * @param {*} importOptions Import options.
     */
    parseSINs(items, sins, licenses, importOptions) {
        for (const sin of sins) {
            // Map SIN quality to rating
            let sinRating = 0;
            if (sin.quality === 'STANDARD') {
                sinRating = 2;
            } else if (sin.quality === 'NATIONAL') {
                sinRating = 3;
            } else if (sin.quality === 'CRIMINAL') {
                sinRating = 4;
            } else if (sin.quality === 'CORPORATE_LIMITED') {
                sinRating = 5;
            } else if (sin.quality === 'CORPORATE') {
                sinRating = 6;
            }

            const sinItem = {
                name: sin.name,
                type: 'sin',
                img: importOptions.assignIcons ? 'systems/shadowrun6-elysium/dist/icons/redist/sin.svg' : 'icons/svg/item-bag.svg',
                system: {
                    description: {
                        value: sin.description || ''
                    },
                    rating: sinRating,
                    licenses: [],
                    source: sin.source || '',
                    importFlags: {
                        isImported: true
                    }
                }
            };

            // Add licenses associated with this SIN
            if (licenses) {
                const sinLicenses = licenses.filter(license => license.sin === sin.name);
                for (const license of sinLicenses) {
                    // Map license rating
                    let licenseRating = 0;
                    if (license.rating === 'STANDARD') {
                        licenseRating = 2;
                    } else if (license.rating === 'SUPERFICIALLY_PLAUSIBLE') {
                        licenseRating = 4;
                    } else if (license.rating === 'COMPLETELY_LEGITIMATE') {
                        licenseRating = 6;
                    }

                    sinItem.system.licenses.push({
                        name: license.name,
                        rating: licenseRating,
                        type: license.type || ''
                    });
                }
            }

            items.push(sinItem);
        }
    }

    // Vehicle and drone parsing methods have been moved to GenesisImporter.js

}
