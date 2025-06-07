/**
 * Factory class for creating test actors with predefined configurations
 */
export class TestActorFactory {
    /**
     * Create a basic test character
     * @param name Optional name for the character
     * @returns The created actor
     */
    static async createTestCharacter(name: string = "Test Character"): Promise<Actor> {
        return await Actor.create({
            name,
            type: "character",
            img: "icons/svg/mystery-man.svg",
            system: {
                attributes: {
                    body: { value: 4 },
                    agility: { value: 4 },
                    reaction: { value: 4 },
                    strength: { value: 4 },
                    willpower: { value: 4 },
                    logic: { value: 4 },
                    intuition: { value: 4 },
                    charisma: { value: 4 },
                    edge: { value: 4, uses: 4 }
                },
                skills: {
                    firearms: { value: 4 },
                    hacking: { value: 4 }
                },
                armor: {
                    defense_rating: {
                        base: 2,
                        mod: [],
                        value: 0
                    }
                }
            },
            flags: {
                "sr6elysium": {
                    hasMatrixActions: true
                }
            },
            // Add a special flag to identify test actors
            prototypeToken: {
                name: name,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
            }
        });
    }

    /**
     * Create a test character with high body attribute
     * @param name Optional name for the character
     * @returns The created actor
     */
    static async createHighBodyCharacter(name: string = "High Body Character"): Promise<Actor> {
        return await Actor.create({
            name,
            type: "character",
            img: "icons/svg/mystery-man.svg",
            system: {
                attributes: {
                    body: { value: 6 },
                    agility: { value: 3 },
                    reaction: { value: 3 },
                    strength: { value: 5 },
                    willpower: { value: 3 },
                    logic: { value: 2 },
                    intuition: { value: 3 },
                    charisma: { value: 2 },
                    edge: { value: 3, uses: 3 }
                },
                skills: {
                    athletics: { value: 4 },
                    close_combat: { value: 5 }
                },
                armor: {
                    defense_rating: {
                        base: 3,
                        mod: [],
                        value: 0
                    }
                }
            },
            flags: {
                "sr6elysium": {
                    hasMatrixActions: true
                }
            },
            // Add a special flag to identify test actors
            prototypeToken: {
                name: name,
                disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY
            }
        });
    }

    /**
     * Create a test character with high logic attribute
     * @param name Optional name for the character
     * @returns The created actor
     */
    static async createHighLogicCharacter(name: string = "High Logic Character"): Promise<Actor> {
        return await Actor.create({
            name,
            type: "character",
            img: "icons/svg/mystery-man.svg",
            system: {
                attributes: {
                    body: { value: 2 },
                    agility: { value: 3 },
                    reaction: { value: 4 },
                    strength: { value: 2 },
                    willpower: { value: 4 },
                    logic: { value: 6 },
                    intuition: { value: 5 },
                    charisma: { value: 3 },
                    edge: { value: 3, uses: 3 }
                },
                skills: {
                    hacking: { value: 5 },
                    electronics: { value: 4 }
                },
                armor: {
                    defense_rating: {
                        base: 1,
                        mod: [],
                        value: 0
                    }
                }
            },
            flags: {
                "sr6elysium": {
                    hasMatrixActions: true
                }
            }
        });
    }

    /**
     * Create a test sprite
     * @param name Optional name for the sprite
     * @returns The created actor
     */
    static async createTestSprite(name: string = "Test Sprite"): Promise<Actor> {
        return await Actor.create({
            name,
            type: "sprite",
            img: "icons/svg/mystery-man.svg",
            system: {
                level: 4,
                spriteType: "courier",
                attributes: {
                    attack: { value: 4 },
                    sleaze: { value: 5 },
                    data_processing: { value: 6 },
                    firewall: { value: 3 }
                }
            },
            flags: {
                "sr6elysium": {
                    hasMatrixActions: true
                }
            }
        });
    }

    /**
     * Create a test IC
     * @param name Optional name for the IC
     * @returns The created actor
     */
    static async createTestIC(name: string = "Test IC"): Promise<Actor> {
        return await Actor.create({
            name,
            type: "ic",
            img: "icons/svg/mystery-man.svg",
            system: {
                level: 4,
                icType: "patrol",
                attributes: {
                    attack: { value: 5 },
                    sleaze: { value: 3 },
                    data_processing: { value: 4 },
                    firewall: { value: 4 }
                }
            },
            flags: {
                "sr6elysium": {
                    hasMatrixActions: true
                }
            }
        });
    }
}
