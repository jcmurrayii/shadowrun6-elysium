import { CharacterInfoUpdater } from "./CharacterInfoUpdater.js";

/**
 * Updates actor data with Genesis character information.
 */
export class GenesisInfoUpdater extends CharacterInfoUpdater {
    /**
     * Updates the actor data with Genesis character information.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     * @returns The updated actor data.
     */
    update(actorData, genesisCharacter) {
        console.log('Updating actor data with Genesis character information');

        // Create a copy of the actor data to avoid modifying the original
        const updatedData = duplicate(actorData);

        // Update basic character information
        this.updateBasicInfo(updatedData, genesisCharacter);

        // Update attributes
        this.updateAttributes(updatedData, genesisCharacter);

        // Update skills
        this.updateSkills(updatedData, genesisCharacter);

        // Update derived stats
        this.updateDerivedStats(updatedData, genesisCharacter);

        // Update matrix stats if available
        if (genesisCharacter.matrix) {
            this.updateMatrixStats(updatedData, genesisCharacter);
        }

        // Update magic stats if available
        if (genesisCharacter.magic) {
            this.updateMagicStats(updatedData, genesisCharacter);
        }

        return updatedData;
    }

    /**
     * Updates basic character information.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateBasicInfo(actorData, genesisCharacter) {
        // Update character name
        actorData.name = genesisCharacter.name || actorData.name;

        // Update character description
        if (genesisCharacter.description) {
            actorData.system.description.value = genesisCharacter.description;
        }

        // Update character alias/street name
        if (genesisCharacter.streetName) {
            actorData.system.alias = genesisCharacter.streetName;
        }

        // Update character metatype
        if (genesisCharacter.metaType) {
            // Convert first letter to uppercase, rest to lowercase
            const formattedMetatype = genesisCharacter.metaType.charAt(0).toUpperCase() +
                                     genesisCharacter.metaType.slice(1).toLowerCase();
            actorData.system.metatype = formattedMetatype;
        }

        // Update character gender
        if (genesisCharacter.gender) {
            actorData.system.gender = genesisCharacter.gender;
        }

        // Update character age
        if (genesisCharacter.age) {
            actorData.system.age = genesisCharacter.age;
        }

        // Update character height (size in cm)
        if (genesisCharacter.size) {
            actorData.system.height = genesisCharacter.size + ' cm';
        }

        // Update character weight (in kg)
        if (genesisCharacter.weight) {
            actorData.system.weight = genesisCharacter.weight + ' kg';
        }

        // Update character nuyen
        if (genesisCharacter.nuyen) {
            actorData.system.nuyen = genesisCharacter.nuyen;
        }

        // Update character karma
        if (genesisCharacter.karma) {
            actorData.system.karma.value = genesisCharacter.karma;
        }

        // Update character street cred, notoriety, and public awareness
        if (genesisCharacter.reputation !== undefined) {
            actorData.system.street_cred = genesisCharacter.reputation;
        }

        if (genesisCharacter.heat !== undefined) {
            actorData.system.notoriety = genesisCharacter.heat;
        }
    }

    /**
     * Updates character attributes.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateAttributes(actorData, genesisCharacter) {
        if (!genesisCharacter.attributes) return;

        // Map Genesis attribute IDs to Foundry attribute names
        const attributeMap = {
            'BODY': 'body',
            'AGILITY': 'agility',
            'REACTION': 'reaction',
            'STRENGTH': 'strength',
            'WILLPOWER': 'willpower',
            'LOGIC': 'logic',
            'INTUITION': 'intuition',
            'CHARISMA': 'charisma',
            'EDGE': 'edge',
            'MAGIC': 'magic',
            'RESONANCE': 'resonance'
        };

        // Update each attribute
        for (const attribute of genesisCharacter.attributes) {
            const foundryAttr = attributeMap[attribute.id];
            if (foundryAttr && actorData.system.attributes[foundryAttr]) {
                actorData.system.attributes[foundryAttr].base = attribute.points || 0;
            }
        }

        // Set essence (not directly in attributes array)
        actorData.system.attributes.essence.base = 6; // Default value

        // Calculate essence loss from augmentations if present
        if (genesisCharacter.augmentations && genesisCharacter.augmentations.length > 0) {
            let essenceLoss = 0;
            for (const aug of genesisCharacter.augmentations) {
                essenceLoss += parseFloat(aug.essence) || 0;
            }
            actorData.system.attributes.essence.base = Math.max(0, 6 - essenceLoss);
        }
    }

    /**
     * Updates character skills.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateSkills(actorData, genesisCharacter) {
        if (!genesisCharacter.skills) return;

        // Map Genesis skill IDs to Foundry skill names
        const skillMap = {
            'biotech': 'biotech',
            'electronics': 'electronics',
            'engineering': 'engineering',
            'firearms': 'firearms',
            'stealth': 'stealth',
            'piloting': 'pilot_ground_craft',
            'perception': 'perception',
            'close_combat': 'close_combat',
            'athletics': 'athletics',
            'influence': 'influence',
            'conjuring': 'conjuring',
            'sorcery': 'sorcery',
            'enchanting': 'enchanting',
            'tasking': 'tasking',
            'astral': 'astral',
            'cracking': 'cracking',
            'exotic_weapons': 'exotic_weapons'
        };

        // Update active skills
        for (const skill of genesisCharacter.skills) {
            // Skip knowledge and language skills for now
            if (skill.id === 'knowledge' || skill.id === 'language') {
                continue;
            }

            const foundrySkill = skillMap[skill.id] || skill.id;

            if (actorData.system.skills.active[foundrySkill]) {
                actorData.system.skills.active[foundrySkill].base = skill.rating || 0;

                // Update specializations if available
                if (skill.specializations && skill.specializations.length > 0) {
                    actorData.system.skills.active[foundrySkill].specs = skill.specializations.map(spec => spec.name);
                }
            }
            // Special case for piloting with aircraft specialization
            else if (skill.id === 'piloting' && skill.specializations) {
                const hasAircraft = skill.specializations.some(spec => spec.id === 'aircraft');
                if (hasAircraft && actorData.system.skills.active['pilot_aircraft']) {
                    actorData.system.skills.active['pilot_aircraft'].base = skill.rating || 0;
                }
            }
        }

        // Update knowledge skills
        this.updateKnowledgeSkills(actorData, genesisCharacter);

        // Update language skills
        this.updateLanguageSkills(actorData, genesisCharacter);
    }

    /**
     * Updates character knowledge skills.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateKnowledgeSkills(actorData, genesisCharacter) {
        // Initialize knowledge skill categories
        actorData.system.skills.knowledge.academic.value = {};
        actorData.system.skills.knowledge.street.value = {};
        actorData.system.skills.knowledge.professional.value = {};
        actorData.system.skills.knowledge.interests.value = {};

        // Find knowledge skills in the skills array
        const knowledgeSkills = genesisCharacter.skills.filter(skill => skill.id === 'knowledge');

        for (const skill of knowledgeSkills) {
            const id = randomID(16);
            const skillName = skill.name;

            // Default to professional category
            let category = actorData.system.skills.knowledge.professional.value;

            // Try to determine the category based on the skill name or description
            if (skillName.includes('Academic') || skillName.includes('Science')) {
                category = actorData.system.skills.knowledge.academic.value;
            } else if (skillName.includes('Street') || skillName.includes('Gang')) {
                category = actorData.system.skills.knowledge.street.value;
            } else if (skillName.includes('Interest') || skillName.includes('Hobby')) {
                category = actorData.system.skills.knowledge.interests.value;
            }

            // Add the skill to the appropriate category
            category[id] = {
                name: skillName,
                base: skill.rating || 0,
                specs: (skill.specializations || []).map(spec => spec.name)
            };
        }
    }

    /**
     * Updates character language skills.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateLanguageSkills(actorData, genesisCharacter) {
        // Initialize language skills
        actorData.system.skills.language.value = {};

        // Find language skills in the skills array
        const languageSkills = genesisCharacter.skills.filter(skill => skill.id === 'language');

        for (const skill of languageSkills) {
            const id = randomID(16);

            // Add the language skill
            actorData.system.skills.language.value[id] = {
                name: skill.name,
                base: skill.rating || 0,
                specs: (skill.specializations || []).map(spec => spec.name)
            };
        }
    }

    /**
     * Updates character derived stats.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateDerivedStats(actorData, genesisCharacter) {
        // Update initiative
        if (genesisCharacter.initiatives) {
            // Find the physical initiative
            const physicalInit = genesisCharacter.initiatives.find(init => init.id === 'INITIATIVE_PHYSICAL');
            if (physicalInit) {
                // Extract dice from the dice string (e.g., "+1D6" -> 1)
                const diceMatch = physicalInit.dice.match(/\+(\d+)D6/);
                if (diceMatch && diceMatch[1]) {
                    actorData.system.initiative.dice = parseInt(diceMatch[1]);
                }
            }
        }

        // Calculate physical track based on body attribute
        const bodyAttr = genesisCharacter.attributes.find(attr => attr.id === 'BODY');
        if (bodyAttr) {
            const bodyValue = bodyAttr.points || 0;
            actorData.system.track.physical.max = 8 + Math.ceil(bodyValue / 2);
            // Default to full health
            actorData.system.track.physical.value = 0;
        }

        // Calculate stun track based on willpower attribute
        const willpowerAttr = genesisCharacter.attributes.find(attr => attr.id === 'WILLPOWER');
        if (willpowerAttr) {
            const willpowerValue = willpowerAttr.points || 0;
            actorData.system.track.stun.max = 8 + Math.ceil(willpowerValue / 2);
            // Default to full health
            actorData.system.track.stun.value = 0;
        }

        // Set overflow track
        if (bodyAttr) {
            const bodyValue = bodyAttr.points || 0;
            actorData.system.track.physical.overflow.max = bodyValue;
            actorData.system.track.physical.overflow.value = 0;
        }
    }

    /**
     * Updates character matrix stats.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateMatrixStats(actorData, genesisCharacter) {
        if (!genesisCharacter.matrix) return;

        // Update matrix attributes
        if (genesisCharacter.matrix.attributes) {
            actorData.system.matrix.attack = genesisCharacter.matrix.attributes.attack || 0;
            actorData.system.matrix.sleaze = genesisCharacter.matrix.attributes.sleaze || 0;
            actorData.system.matrix.data_processing = genesisCharacter.matrix.attributes.data_processing || 0;
            actorData.system.matrix.firewall = genesisCharacter.matrix.attributes.firewall || 0;
        }

        // Update matrix condition monitor
        if (genesisCharacter.matrix.condition_monitor) {
            actorData.system.matrix.condition_monitor.max = genesisCharacter.matrix.condition_monitor.max || 0;
            actorData.system.matrix.condition_monitor.value = genesisCharacter.matrix.condition_monitor.value || 0;
        }
    }

    /**
     * Updates character magic stats.
     * @param {*} actorData The actor data to update.
     * @param {*} genesisCharacter The Genesis character data.
     */
    updateMagicStats(actorData, genesisCharacter) {
        if (!genesisCharacter.magic) return;

        // Update magic tradition
        if (genesisCharacter.magic.tradition) {
            actorData.system.magic.tradition = genesisCharacter.magic.tradition;
        }

        // Update magic attributes
        actorData.system.magic.magic = genesisCharacter.attributes.magic || 0;

        // Update drain attribute
        if (genesisCharacter.magic.drain_attribute) {
            actorData.system.magic.drain_attribute = genesisCharacter.magic.drain_attribute;
        }
    }
}
