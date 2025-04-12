import { GenesisInfoUpdater } from "./GenesisInfoUpdater.js"
import { ItemsParser } from "../itemImporter/ItemsParser.js";
import { GenesisItemsParser } from "./GenesisItemsParser.js";
import VehicleParser from "../itemImporter/vehicleImport/VehicleParser.ts";

/**
 * Imports characters from Genesis character creator into an existing foundry actor.
 */
export class GenesisImporter {

    /**
     * Imports a Genesis character into an existing actor. The actor will be updated. This might lead to duplicate items.
     * @param {*} actor The actor that will be updated with the Genesis character.
     * @param {*} genesisFile The complete Genesis file as json object.
     * @param {*} importOptions Additional import option that specify what parts of the Genesis file will be imported.
     */
    async importGenesisCharacter(actor, genesisFile, importOptions) {
        console.log('Importing the following Genesis character file content:');
        console.log(genesisFile);

        console.log('Using the following import options:')
        console.log(importOptions);

        if (!genesisFile) {
            console.log('Did not find a valid character to import - aborting import');
            return;
        }

        await this.resetCharacter(actor)

        const genesisCharacter = genesisFile;
        const infoUpdater = new GenesisInfoUpdater();
        const updatedActorData = infoUpdater.update(actor._source, genesisCharacter);
        const items = new GenesisItemsParser().parse(genesisCharacter, importOptions);

        // Create vehicles as actors if they exist in Genesis format
        if (genesisCharacter.vehicles && importOptions.vehicles) {
            await this.createVehicleActors(genesisCharacter.vehicles, actor);
        }

        // Create drones as actors if they exist in Genesis format
        if (genesisCharacter.drones && importOptions.vehicles) {
            await this.createDroneActors(genesisCharacter.drones, actor);
        }

        await actor.update(await updatedActorData);
        await actor.createEmbeddedDocuments('Item', await items);
    }

    async resetCharacter(actor) {
        let toDeleteItems = actor.items?.filter(item => item.type !== "action")
            //filter items that were not imported
            //first line is for legacy items, user need to delete these manually
            .filter(item => item.system.importFlags != undefined)
            .filter(item => item.system.importFlags.isImported)
            .filter(item => item.effects.size == 0)
            .map(item => item.id)

        let deletedItems = actor.deleteEmbeddedDocuments("Item", toDeleteItems);

        let removed = {
            'system.skills.language.-=value': null,
            'system.skills.knowledge.academic.-=value': null,
            'system.skills.knowledge.interests.-=value': null,
            'system.skills.knowledge.professional.-=value': null,
            'system.skills.knowledge.street.-=value': null
        }
        let removeSkills = actor.update(removed)

        //await as late as possible to save time
        await deletedItems
        await removeSkills
    }

    /**
     * Creates vehicle actors from Genesis vehicle data.
     * @param {*} vehicles The Genesis vehicles data.
     * @param {*} ownerActor The actor that owns the vehicles.
     */
    async createVehicleActors(vehicles, ownerActor) {
        for (const vehicle of vehicles) {
            console.log('Creating vehicle from Genesis data:', vehicle);

            // Determine vehicle category based on subtype
            let vehicleCategory = 'ground';
            if (vehicle.subtype === 'WATER') {
                vehicleCategory = 'water';
            } else if (vehicle.subtype === 'AIR') {
                vehicleCategory = 'air';
            }

            // Create the vehicle actor data
            const vehicleData = {
                name: vehicle.name,
                type: 'vehicle',
                img: 'systems/shadowrun6-elysium/dist/icons/redist/vehicle.svg',
                system: {
                    description: {
                        value: vehicle.description || ''
                    },
                    handling: {
                        base: this.extractNumericValue(vehicle.handlOn),
                        off_road: this.extractNumericValue(vehicle.handlOff)
                    },
                    speed: {
                        base: this.extractNumericValue(vehicle.speed)
                    },
                    acceleration: {
                        base: this.extractNumericValue(vehicle.accelOn),
                        off_road: this.extractNumericValue(vehicle.accelOff)
                    },
                    body: this.extractNumericValue(vehicle.body),
                    armor: this.extractNumericValue(vehicle.armor),
                    pilot: this.extractNumericValue(vehicle.pilot),
                    sensor: this.extractNumericValue(vehicle.sensor),
                    seats: this.extractNumericValue(vehicle.seats),
                    mod_slots: {
                        power: this.extractNumericValue(vehicle.powerTrainSlots),
                        protection: this.extractNumericValue(vehicle.protectionSlots),
                        weapon: this.extractNumericValue(vehicle.weaponSlots),
                        body: this.extractNumericValue(vehicle.bodySlots),
                        electromagnetic: this.extractNumericValue(vehicle.electronicSlots),
                        cosmetic: this.extractNumericValue(vehicle.cosmeticSlots)
                    },
                    category: vehicleCategory,
                    isDrone: false,  // Explicitly mark as not a drone
                    owner: ownerActor.id,
                    source: vehicle.source || ''
                },
                folder: await this.getOrCreateFolder('Vehicles'),
                permission: { default: 0 }
            };

            // Set the owner's permission to owner
            vehicleData.permission[ownerActor.id] = 3;

            // Create the vehicle actor
            const createdVehicle = await Actor.create(vehicleData);

            // Add vehicle mods as items if they exist
            if (vehicle.accessories && vehicle.accessories.length > 0) {
                const modItems = [];

                for (const accessory of vehicle.accessories) {
                    modItems.push({
                        name: accessory.name,
                        type: 'modification',  // Use modification type
                        img: 'systems/shadowrun6-elysium/dist/icons/redist/vehicle-mod.svg',
                        system: {
                            description: {
                                value: accessory.description || ''
                            },
                            technology: {
                                rating: this.extractNumericValue(accessory.rating),
                                availability: {
                                    value: 0,
                                    mod: ''
                                },
                                cost: 0
                            },
                            category: 'vehicle_mod',  // Set category to vehicle_mod
                            equipped: true,
                            source: accessory.source || '',
                            importFlags: {
                                isImported: true
                            }
                        }
                    });
                }

                await createdVehicle.createEmbeddedDocuments('Item', modItems);
            }

            // Add vehicle weapons if they exist
            // In Genesis format, weapons might be stored in the accessories array with a specific subType
            const weaponAccessories = vehicle.accessories ? vehicle.accessories.filter(acc => acc.subType === 'WEAPON' || acc.subType === 'MOD_WEAPON') : [];

            if ((vehicle.weapons && vehicle.weapons.length > 0) || weaponAccessories.length > 0) {
                const weaponItems = [];

                // Process regular weapons if they exist
                if (vehicle.weapons && vehicle.weapons.length > 0) {
                    for (const weapon of vehicle.weapons) {
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

                        weaponItems.push({
                            name: weapon.name,
                            type: 'weapon',
                            img: 'systems/shadowrun6-elysium/dist/icons/redist/vehicle-weapon.svg',
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
                                    skill: 'gunnery',
                                    test: 'vehicle_weapon',
                                    limit: {
                                        value: 0,
                                        attribute: ''
                                    }
                                },
                                range: {
                                    category: 'standard',
                                    ranges: {
                                        short: { value: 0 },
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
                                        value: this.extractNumericValue(weapon.ap)
                                    }
                                },
                                category: 'vehicle_weapon',
                                type: 'vehicle',
                                roll_mode: 'publicroll',
                                source: weapon.source || '',
                                importFlags: {
                                    isImported: true
                                }
                            }
                        });
                    }
                }

                // Process weapon accessories
                for (const weaponAcc of weaponAccessories) {
                    weaponItems.push({
                        name: weaponAcc.name,
                        type: 'weapon',
                        img: 'systems/shadowrun6-elysium/dist/icons/redist/vehicle-weapon.svg',
                        system: {
                            description: {
                                value: weaponAcc.description || ''
                            },
                            technology: {
                                rating: this.extractNumericValue(weaponAcc.rating),
                                availability: {
                                    value: 0,
                                    mod: ''
                                },
                                cost: 0
                            },
                            action: {
                                type: 'major',
                                attribute: 'agility',
                                skill: 'gunnery',
                                test: 'vehicle_weapon',
                                limit: {
                                    value: 0,
                                    attribute: ''
                                }
                            },
                            range: {
                                category: 'standard',
                                ranges: {
                                    short: { value: 0 },
                                    medium: { value: 0 },
                                    long: { value: 0 },
                                    extreme: { value: 0 }
                                }
                            },
                            damage: {
                                type: {
                                    value: 'physical'
                                },
                                element: {
                                    value: ''
                                },
                                value: 0,
                                ap: {
                                    value: 0
                                }
                            },
                            category: 'vehicle_weapon',
                            type: 'vehicle',
                            roll_mode: 'publicroll',
                            source: weaponAcc.source || '',
                            importFlags: {
                                isImported: true
                            }
                        }
                    });
                }

                await createdVehicle.createEmbeddedDocuments('Item', weaponItems);
            }
        }
    }

    /**
     * Creates drone actors from Genesis drone data.
     * @param {*} drones The Genesis drones data.
     * @param {*} ownerActor The actor that owns the drones.
     */
    async createDroneActors(drones, ownerActor) {
        for (const drone of drones) {
            console.log('Creating drone from Genesis data:', drone);

            // Get drone category
            const droneCategory = this.getDroneCategory(drone);

            // Create the drone actor data (as vehicle type)
            const droneData = {
                name: drone.name,
                type: 'vehicle',  // Use vehicle type for drones
                img: 'systems/shadowrun6-elysium/dist/icons/redist/drone.svg',
                system: {
                    description: {
                        value: drone.description || ''
                    },
                    handling: {
                        base: this.extractNumericValue(drone.handlOn),
                        off_road: this.extractNumericValue(drone.handlOff)
                    },
                    speed: {
                        base: this.extractNumericValue(drone.speed)
                    },
                    acceleration: {
                        base: this.extractNumericValue(drone.accelOn),
                        off_road: this.extractNumericValue(drone.accelOff)
                    },
                    body: this.extractNumericValue(drone.body),
                    armor: this.extractNumericValue(drone.armor),
                    pilot: this.extractNumericValue(drone.pilot),
                    sensor: this.extractNumericValue(drone.sensor),
                    mod_slots: {
                        power: this.extractNumericValue(drone.powerTrainSlots),
                        protection: this.extractNumericValue(drone.protectionSlots),
                        weapon: this.extractNumericValue(drone.weaponSlots),
                        body: this.extractNumericValue(drone.bodySlots),
                        electromagnetic: this.extractNumericValue(drone.electronicSlots),
                        cosmetic: this.extractNumericValue(drone.cosmeticSlots)
                    },
                    category: droneCategory,  // Use the drone category as the vehicle category
                    isDrone: true,  // Explicitly mark as a drone
                    owner: ownerActor.id,
                    source: drone.source || ''
                },
                folder: await this.getOrCreateFolder('Drones'),
                permission: { default: 0 }
            };

            // Set the owner's permission to owner
            droneData.permission[ownerActor.id] = 3;

            // Create the drone actor
            const createdDrone = await Actor.create(droneData);

            // Add drone mods as items if they exist
            if (drone.accessories && drone.accessories.length > 0) {
                const modItems = [];

                for (const accessory of drone.accessories) {
                    modItems.push({
                        name: accessory.name,
                        type: 'modification',  // Use modification type
                        img: 'systems/shadowrun6-elysium/dist/icons/redist/drone-mod.svg',
                        system: {
                            description: {
                                value: accessory.description || ''
                            },
                            technology: {
                                rating: this.extractNumericValue(accessory.rating),
                                availability: {
                                    value: 0,
                                    mod: ''
                                },
                                cost: 0
                            },
                            category: 'drone_mod',  // Set category to drone_mod
                            equipped: true,
                            source: accessory.source || '',
                            importFlags: {
                                isImported: true
                            }
                        }
                    });
                }

                await createdDrone.createEmbeddedDocuments('Item', modItems);
            }

            // Add drone weapons if they exist
            // In Genesis format, weapons might be stored in the accessories array with a specific subType
            const weaponAccessories = drone.accessories ? drone.accessories.filter(acc => acc.subType === 'WEAPON' || acc.subType === 'MOD_WEAPON') : [];

            if ((drone.weapons && drone.weapons.length > 0) || weaponAccessories.length > 0) {
                const weaponItems = [];

                // Process regular weapons if they exist
                if (drone.weapons && drone.weapons.length > 0) {
                    for (const weapon of drone.weapons) {
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

                        weaponItems.push({
                            name: weapon.name,
                            type: 'weapon',
                            img: 'systems/shadowrun6-elysium/dist/icons/redist/drone-weapon.svg',
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
                                    skill: 'gunnery',
                                    test: 'vehicle_weapon',
                                    limit: {
                                        value: 0,
                                        attribute: ''
                                    }
                                },
                                range: {
                                    category: 'standard',
                                    ranges: {
                                        short: { value: 0 },
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
                                        value: this.extractNumericValue(weapon.ap)
                                    }
                                },
                                category: 'drone_weapon',
                                type: 'vehicle',
                                roll_mode: 'publicroll',
                                source: weapon.source || '',
                                importFlags: {
                                    isImported: true
                                }
                            }
                        });
                    }
                }

                // Process weapon accessories
                for (const weaponAcc of weaponAccessories) {
                    weaponItems.push({
                        name: weaponAcc.name,
                        type: 'weapon',
                        img: 'systems/shadowrun6-elysium/dist/icons/redist/drone-weapon.svg',
                        system: {
                            description: {
                                value: weaponAcc.description || ''
                            },
                            technology: {
                                rating: this.extractNumericValue(weaponAcc.rating),
                                availability: {
                                    value: 0,
                                    mod: ''
                                },
                                cost: 0
                            },
                            action: {
                                type: 'major',
                                attribute: 'agility',
                                skill: 'gunnery',
                                test: 'vehicle_weapon',
                                limit: {
                                    value: 0,
                                    attribute: ''
                                }
                            },
                            range: {
                                category: 'standard',
                                ranges: {
                                    short: { value: 0 },
                                    medium: { value: 0 },
                                    long: { value: 0 },
                                    extreme: { value: 0 }
                                }
                            },
                            damage: {
                                type: {
                                    value: 'physical'
                                },
                                element: {
                                    value: ''
                                },
                                value: 0,
                                ap: {
                                    value: 0
                                }
                            },
                            category: 'drone_weapon',
                            type: 'vehicle',
                            roll_mode: 'publicroll',
                            source: weaponAcc.source || '',
                            importFlags: {
                                isImported: true
                            }
                        }
                    });
                }

                await createdDrone.createEmbeddedDocuments('Item', weaponItems);
            }
        }
    }

    /**
     * Gets the drone category based on the drone type.
     * @param {*} drone The drone data.
     * @returns The drone category.
     */
    getDroneCategory(drone) {
        console.log('Getting drone category for:', drone);

        // Check for subtype property
        if (drone.subtype) {
            if (drone.subtype === 'AIR') {
                return 'air';
            } else if (drone.subtype === 'GROUND') {
                return 'ground';
            } else if (drone.subtype === 'WATER') {
                return 'water';
            } else if (drone.subtype === 'ANTHROFORM') {
                return 'anthroform';
            }
        }

        // If no subtype or unrecognized, try to determine from name or description
        const name = (drone.name || '').toLowerCase();
        const description = (drone.description || '').toLowerCase();

        if (name.includes('air') || name.includes('fly') || name.includes('copter') ||
            description.includes('air') || description.includes('fly') || description.includes('copter')) {
            return 'air';
        } else if (name.includes('water') || name.includes('boat') || name.includes('submarine') ||
                  description.includes('water') || description.includes('boat') || description.includes('submarine')) {
            return 'water';
        } else if (name.includes('anthro') || name.includes('humanoid') ||
                  description.includes('anthro') || description.includes('humanoid')) {
            return 'anthroform';
        } else {
            return 'ground'; // Default to ground
        }
    }

    /**
     * Gets or creates a folder for the given name.
     * @param {*} folderName The name of the folder.
     * @returns The folder ID.
     */
    async getOrCreateFolder(folderName) {
        // Check if the folder already exists
        const folder = game.folders.find(f => f.name === folderName && f.type === 'Actor');

        if (folder) {
            return folder.id;
        }

        // Create the folder if it doesn't exist
        const createdFolder = await Folder.create({
            name: folderName,
            type: 'Actor',
            parent: null
        });

        return createdFolder.id;
    }

    /**
     * Extracts a numeric value from a string or returns a default value.
     * @param {*} value The value to extract a number from.
     * @param {number} defaultValue The default value to return if extraction fails.
     * @returns The extracted number or the default value.
     */
    extractNumericValue(value, defaultValue = 0) {
        if (value === undefined || value === null) {
            return defaultValue;
        }

        // If it's already a number, return it
        if (typeof value === 'number') {
            return value;
        }

        // If it's a string, try to extract a number
        if (typeof value === 'string') {
            // Try to extract a number from the string
            const match = value.match(/-?\d+/);
            if (match) {
                return parseInt(match[0]);
            }
        }

        return defaultValue;
    }
}
