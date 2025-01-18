/**
 * Shadowrun 5 configuration for static values.
 *
 * NOTE: Do NOT import code into this file, as this might cause circular imports.
 */

export const SR6 = {
    itemTypes: {
        action: 'SR6.ItemTypes.Action',
        adept_power: 'SR6.ItemTypes.AdeptPower',
        ammo: 'SR6.ItemTypes.Ammo',
        armor: 'SR6.ItemTypes.Armor',
        bioware: 'SR6.ItemTypes.Bioware',
        complex_form: 'SR6.ItemTypes.ComplexForm',
        contact: 'SR6.ItemTypes.Contact',
        critter_power: 'SR6.ItemTypes.CritterPower',
        cyberware: 'SR6.ItemTypes.Cyberware',
        device: 'SR6.ItemTypes.Device',
        echo: 'SR6.ItemTypes.Echo',
        equipment: 'SR6.ItemTypes.Equipment',
        host: 'SR6.ItemTypes.Host',
        lifestyle: 'SR6.ItemTypes.Lifestyle',
        metamagic: 'SR6.ItemTypes.Metamagic',
        modification: 'SR6.ItemTypes.Modification',
        program: 'SR6.ItemTypes.Program',
        quality: 'SR6.ItemTypes.Quality',
        ritual: 'SR6.ItemTypes.Ritual',
        sin: 'SR6.ItemTypes.Sin',
        spell: 'SR6.ItemTypes.Spell',
        sprite_power: 'SR6.ItemTypes.SpritePower',
        weapon: 'SR6.ItemTypes.Weapon',
        call_in_action: 'TYPES.Item.call_in_action'
    },

    // All available attributes. These are available as testable attributes across all actor types.
    attributes: {
        agility: 'SR6.AttrAgility',
        attack: 'SR6.MatrixAttrAttack',
        body: 'SR6.AttrBody',
        charisma: 'SR6.AttrCharisma',
        data_processing: 'SR6.MatrixAttrDataProc',
        edge: 'SR6.AttrEdge',
        essence: 'SR6.AttrEssence',
        firewall: 'SR6.MatrixAttrFirewall',
        intuition: 'SR6.AttrIntuition',
        logic: 'SR6.AttrLogic',
        magic: 'SR6.AttrMagic',
        reaction: 'SR6.AttrReaction',
        resonance: 'SR6.AttrResonance',
        sleaze: 'SR6.MatrixAttrSleaze',
        strength: 'SR6.AttrStrength',
        willpower: 'SR6.AttrWillpower',
        pilot: 'SR6.Vehicle.Stats.Pilot',
        force: 'SR6.Force',
        initiation: 'SR6.Initiation',
        submersion: 'SR6.Submersion',
        transhumanism: 'SR6.Transhumanism',
        rating: 'SR6.Rating',
    },

    /**
     * All labels for all limits used across all actor and item types.
     */
    limits: {
        physical: 'SR6.LimitPhysical',
        social: 'SR6.LimitSocial',
        mental: 'SR6.LimitMental',
        astral: 'SR6.LimitAstral',
        attack: 'SR6.MatrixAttrAttack',
        sleaze: 'SR6.MatrixAttrSleaze',
        data_processing: 'SR6.MatrixAttrDataProc',
        firewall: 'SR6.MatrixAttrFirewall',
        speed: 'SR6.Vehicle.Stats.Speed',
        sensor: 'SR6.Vehicle.Stats.Sensor',
        handling: 'SR6.Vehicle.Stats.Handling',
        magic: 'SR6.AttrMagic',
        initiation: 'SR6.Initiation'
    },

    specialTypes: {
        mundane: 'SR6.Mundane',
        magic: 'SR6.Awakened',
        resonance: 'SR6.Emerged',
    },

    damageTypes: {
        physical: 'SR6.DmgTypePhysical',
        stun: 'SR6.DmgTypeStun',
        matrix: 'SR6.DmgTypeMatrix'
    },

    weaponRangeCategories: {
        manual: {
            label: 'SR6.Weapon.Range.Category.Manual',
        },
        taser: {
            label: 'SR6.Weapon.Range.Category.Taser',
            ranges: {
                short: 5,
                medium: 10,
                long: 15,
                extreme: 20,
            },
        },
        holdOutPistol: {
            label: 'SR6.Weapon.Range.Category.HoldOutPistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        lightPistol: {
            label: 'SR6.Weapon.Range.Category.LightPistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        heavyPistol: {
            label: 'SR6.Weapon.Range.Category.HeavyPistol',
            ranges: {
                short: 5,
                medium: 20,
                long: 40,
                extreme: 60,
            },
        },
        machinePistol: {
            label: 'SR6.Weapon.Range.Category.MachinePistol',
            ranges: {
                short: 5,
                medium: 15,
                long: 30,
                extreme: 50,
            },
        },
        smg: {
            label: 'SR6.Weapon.Range.Category.SMG',
            ranges: {
                short: 10,
                medium: 40,
                long: 80,
                extreme: 150,
            },
        },
        assaultRifle: {
            label: 'SR6.Weapon.Range.Category.AssaultRifle',
            ranges: {
                short: 25,
                medium: 150,
                long: 350,
                extreme: 550,
            },
        },
        shotgunFlechette: {
            label: 'SR6.Weapon.Range.Category.ShotgunFlechette',
            ranges: {
                short: 15,
                medium: 30,
                long: 45,
                extreme: 60,
            },
        },
        shotgunSlug: {
            label: 'SR6.Weapon.Range.Category.ShotgunSlug',
            ranges: {
                short: 10,
                medium: 40,
                long: 80,
                extreme: 150,
            },
        },
        sniperRifle: {
            label: 'SR6.Weapon.Range.Category.SniperRifle',
            ranges: {
                short: 50,
                medium: 350,
                long: 800,
                extreme: 1500,
            },
        },
        sportingRifle: {
            label: 'SR6.Weapon.Range.Category.SportingRifle',
            ranges: {
                short: 50,
                medium: 250,
                long: 500,
                extreme: 750,
            },
        },
        lightMachinegun: {
            label: 'SR6.Weapon.Range.Category.LightMachinegun',
            ranges: {
                short: 25,
                medium: 200,
                long: 400,
                extreme: 800,
            },
        },
        mediumHeavyMachinegun: {
            label: 'SR6.Weapon.Range.Category.MediumHeavyMachinegun',
            ranges: {
                short: 40,
                medium: 250,
                long: 750,
                extreme: 1200,
            },
        },
        assaultCannon: {
            label: 'SR6.Weapon.Range.Category.AssaultCannon',
            ranges: {
                short: 50,
                medium: 300,
                long: 750,
                extreme: 1500,
            },
        },
        grenadeLauncher: {
            label: 'SR6.Weapon.Range.Category.GrenadeLauncher',
            ranges: {
                short: 50,
                medium: 100,
                long: 150,
                extreme: 500,
            },
        },
        missileLauncher: {
            label: 'SR6.Weapon.Range.Category.MissileLauncher',
            ranges: {
                short: 70,
                medium: 150,
                long: 450,
                extreme: 1500,
            },
        },
        bow: {
            label: 'SR6.Weapon.Range.Category.Bow',
            ranges: {
                short: 1,
                medium: 10,
                long: 30,
                extreme: 60,
                attribute: 'strength',
            },
        },
        lightCrossbow: {
            label: 'SR6.Weapon.Range.Category.LightCrossbow',
            ranges: {
                short: 6,
                medium: 24,
                long: 60,
                extreme: 120,
            },
        },
        mediumCrossbow: {
            label: 'SR6.Weapon.Range.Category.MediumCrossbow',
            ranges: {
                short: 9,
                medium: 36,
                long: 90,
                extreme: 150,
            },
        },
        heavyCrossbow: {
            label: 'SR6.Weapon.Range.Category.HeavyCrossbow',
            ranges: {
                short: 15,
                medium: 45,
                long: 120,
                extreme: 180,
            },
        },
        thrownKnife: {
            label: 'SR6.Weapon.Range.Category.ThrownKnife',
            ranges: {
                short: 1,
                medium: 2,
                long: 3,
                extreme: 5,
                attribute: 'strength',
            },
        },
        net: {
            label: 'SR6.Weapon.Range.Category.Net',
            ranges: {
                short: 0.5,
                medium: 1,
                long: 1.5,
                extreme: 2.5,
                attribute: 'strength',
            },
        },
        shuriken: {
            label: 'SR6.Weapon.Range.Category.Shuriken',
            ranges: {
                short: 1,
                medium: 2,
                long: 5,
                extreme: 7,
                attribute: 'strength',
            },
        },
        standardThrownGrenade: {
            label: 'SR6.Weapon.Range.Category.StandardThrownGrenade',
            ranges: {
                short: 2,
                medium: 4,
                long: 6,
                extreme: 10,
                attribute: 'strength',
            },
        },
        aerodynamicThrownGrenade: {
            label: 'SR6.Weapon.Range.Category.AerodynamicThrownGrenade',
            ranges: {
                short: 2,
                medium: 4,
                long: 8,
                extreme: 15,
                attribute: 'strength',
            },
        },
        harpoonGun: {
            label: 'SR6.Weapon.Range.Category.HarpoonGun',
            ranges: {
                short: 5,
                medium: 20,
                long: 40,
                extreme: 60,
            },
        },
        harpoonGunUnderwater: {
            label: 'SR6.Weapon.Range.Category.HarpoonGunUnderwater',
            ranges: {
                short: 6,
                medium: 24,
                long: 60,
                extreme: 120,
            },
        },
        flamethrower: {
            label: 'SR6.Weapon.Range.Category.Flamethrower',
            ranges: {
                short: 15,
                medium: 20,
                long: -1,
                extreme: -1,
            },
        }

    },

    elementTypes: {
        fire: 'SR6.ElementFire',
        cold: 'SR6.ElementCold',
        acid: 'SR6.ElementAcid',
        electricity: 'SR6.ElementElectricity',
        radiation: 'SR6.ElementRadiation',
    },

    spellCategories: {
        combat: 'SR6.Spell.CatCombat',
        detection: 'SR6.Spell.CatDetection',
        health: 'SR6.Spell.CatHealth',
        illusion: 'SR6.Spell.CatIllusion',
        manipulation: 'SR6.Spell.CatManipulation'
    },

    spellTypes: {
        physical: 'SR6.Spell.TypePhysical',
        mana: 'SR6.Spell.TypeMana',
    },

    spellRanges: {
        touch: 'SR6.Spell.RangeTouch',
        los: 'SR6.Spell.RangeLos',
        los_a: 'SR6.Spell.RangeLosA',
    },

    combatSpellTypes: {
        direct: 'SR6.Spell.CombatDirect',
        indirect: 'SR6.Spell.CombatIndirect',
    },

    detectionSpellTypes: {
        directional: 'SR6.Spell.DetectionDirectional',
        psychic: 'SR6.Spell.DetectionPsychic',
        area: 'SR6.Spell.DetectionArea',
    },

    illusionSpellTypes: {
        obvious: 'SR6.Spell.IllusionObvious',
        realistic: 'SR6.Spell.IllusionRealistic',
    },

    illusionSpellSenses: {
        'single-sense': 'SR6.Spell.IllusionSingleSense',
        'multi-sense': 'SR6.Spell.IllusionMultiSense',
    },

    attributeRolls: {
        composure: 'SR6.RollComposure',
        lift_carry: 'SR6.RollLiftCarry',
        judge_intentions: 'SR6.RollJudgeIntentions',
        memory: 'SR6.RollMemory',
    },

    /**
     * Used for complex form targeting options.
     */
    matrixTargets: {
        persona: 'SR6.TargetPersona',
        device: 'SR6.TargetDevice',
        file: 'SR6.TargetFile',
        self: 'SR6.TargetSelf',
        sprite: 'SR6.TargetSprite',
        host: 'TYPES.Item.host',
        ic: 'TYPES.Actor.ic',
        other: 'SR6.TargetOther',
    },

    durations: {
        instant: 'SR6.DurationInstant',
        sustained: 'SR6.DurationSustained',
        permanent: 'SR6.DurationPermanent',
    },

    weaponCategories: {
        range: 'SR6.Weapon.Category.Range',
        melee: 'SR6.Weapon.Category.Melee',
        thrown: 'SR6.Weapon.Category.Thrown',
    },

    weaponCliptypes: {
        removable_clip: 'SR6.Weapon.Cliptype.RemovableClip',
        break_action:'SR6.Weapon.Cliptype.BreakAction',
        belt_fed:'SR6.Weapon.Cliptype.BeltFed',
        internal_magazin:'SR6.Weapon.Cliptype.InternalMagazin',
        muzzle_loader:'SR6.Weapon.Cliptype.MuzzleLoader',
        cylinder:'SR6.Weapon.Cliptype.Cylinder',
        drum:'SR6.Weapon.Cliptype.Drum',
        bow:'SR6.Weapon.Cliptype.Bow',
    },

    weaponRanges: {
        short: 'SR6.Weapon.Range.Short',
        medium: 'SR6.Weapon.Range.Medium',
        long: 'SR6.Weapon.Range.Long',
        extreme: 'SR6.Weapon.Range.Extreme',
    },

    qualityTypes: {
        positive: 'SR6.QualityTypePositive',
        negative: 'SR6.QualityTypeNegative',
        lifemodule: 'SR6.QualityTypeLifeModule'
    },

    adeptPower: {
        types: {
            active: 'SR6.AdeptPower.Types.Active',
            passive: 'SR6.AdeptPower.Types.Passive',
        },
    },

    deviceCategories: {
        commlink: 'SR6.DeviceCatCommlink',
        cyberdeck: 'SR6.DeviceCatCyberdeck',
        rcc: 'SR6.DeviceCatRCC',
    },

    cyberwareGrades: {
        standard: 'SR6.CyberwareGradeStandard',
        alpha: 'SR6.CyberwareGradeAlpha',
        beta: 'SR6.CyberwareGradeBeta',
        delta: 'SR6.CyberwareGradeDelta',
        used: 'SR6.CyberwareGradeUsed',
    },

    knowledgeSkillCategories: {
        street: 'SR6.KnowledgeSkillStreet',
        academic: 'SR6.KnowledgeSkillAcademic',
        professional: 'SR6.KnowledgeSkillProfessional',
        interests: 'SR6.KnowledgeSkillInterests',
    },

    activeSkills: {
        astral: 'SR6.Skill.Astral',
        athletics: 'SR6.Skill.Athletics',
        biotech: 'SR6.Skill.Biotech',
        closecombat: 'SR6.Skill.CloseCombat',
        con: 'SR6.Skill.Con',
        conjuring: 'SR6.Skill.Conjuring',
        cracking: 'SR6.Skill.Cracking',
        electronics: 'SR6.Skill.Electronics',
        enchanting: 'SR6.Skill.Enchanting',
        engineering: 'SR6.Skill.Engineering',
        exoticweapons: 'SR6.Skill.ExoticWeapons',
        firearms: 'SR6.Skill.Firearms',
        influence: 'SR6.Skill.Influence',
        outdoors: 'SR6.Skill.Outdoors',
        perception: 'SR6.Skill.Perception',
        piloting: 'SR6.Skill.Piloting',
        sorcery: 'SR6.Skill.Sorcery',
        stealth: 'SR6.Skill.Stealth',
        tasking: 'SR6.Skill.Tasking'
    },

    /**
     * Some skills are created on the fly and don't exist on all actors.
     * These values are used for those.
     */
    activeSkillAttribute: {
        flight: 'agility'
    },

    actionTypes: {
        none: 'SR6.ActionTypeNone',
        free: 'SR6.ActionTypeFree',
        simple: 'SR6.ActionTypeSimple',
        complex: 'SR6.ActionTypeComplex',
        varies: 'SR6.ActionTypeVaries',
    },

    // Use within action damage calculation (base <operator> attribute) => value
    actionDamageFormulaOperators: {
        add: '+',
        subtract: '-',
        multiply: '*',
        divide: '/'
    },

    // Map all Shadowrun.ActionCategories to their matching labels.
    // For more information around action categories, see type documentation.
    actionCategories: {
        'addiction_mental': "SR6.ActionCategory.AddictionMental",
        'addiction_physical': "SR6.ActionCategory.AddictionPhysical",
        'addiction': "SR6.ActionCategory.Addiction",
        'attack_melee': "SR6.ActionCategory.AttackMelee",
        'attack_ranged': "SR6.ActionCategory.AttackRanged",
        'attack_thrown': "SR6.ActionCategory.AttackThrown",
        'attack': "SR6.ActionCategory.Attack",
        'brute_force': "SR6.ActionCategory.BruteForce",
        "climbing": "SR6.ActionCategory.Climbing",
        'compiling': "SR6.ActionCategory.Compiling",
        'complex_form': "SR6.ActionCategory.ComplexForm",
        'defense_suppression': "SR6.ActionCategory.DefenseSuppression",
        'defense': "SR6.ActionCategory.Defense",
        'drain': "SR6.ActionCategory.Drain",
        'fade': "SR6.ActionCategory.Fade",
        'hack_on_the_fly': "SR6.ActionCategory.HackOnTheFly",
        'magic': "SR6.ActionCategory.Magic",
        'matrix': 'SR6.ActionCategory.Matrix',
        'recovery_physical': "SR6.ActionCategory.RecoveryPhysical",
        'recovery_stun': "SR6.ActionCategory.RecoveryStun",
        'recovery': "SR6.ActionCategory.Recovery",
        'resist_disease': "SR6.ActionCategory.ResistDisease",
        'resist_toxin': "SR6.ActionCategory.ResistToxin",
        'resist': "SR6.ActionCategory.Resist",
        'resonance': "SR6.ActionCategory.Resonance",
        'rigging': "SR6.ActionCategory.Rigging",
        'social': 'SR6.ActionCategory.Social',
        'spell_combat': "SR6.ActionCategory.SpellCombat",
        'spell_detection': "SR6.ActionCategory.SpellDetection",
        'spell_healing': "SR6.ActionCategory.SpellHealing",
        'spell_illusion': "SR6.ActionCategory.SpellIllusion",
        'spell_manipulation': "SR6.ActionCategory.SpellManipulation",
        'spell_ritual': "SR6.ActionCategory.SpellRitual",
        'summoning': "SR6.ActionCategory.Summoning",
    },

    matrixAttributes: {
        attack: 'SR6.MatrixAttrAttack',
        sleaze: 'SR6.MatrixAttrSleaze',
        data_processing: 'SR6.MatrixAttrDataProc',
        firewall: 'SR6.MatrixAttrFirewall'
    },

    initiativeCategories: {
        meatspace: 'SR6.InitCatMeatspace',
        astral: 'SR6.InitCatAstral',
        matrix: 'SR6.InitCatMatrix',
    },

    // Gear modification types. :) Not modifiers.
    modificationTypes: {
        weapon: 'SR6.Weapon.Weapon',
        armor: 'SR6.Armor',
        vehicle: 'SR6.Vehicle.Vehicle',
        drone: 'SR6.Vehicle.Drone'
    },

    mountPoints: {
        barrel: 'SR6.Barrel',
        under_barrel: 'SR6.UnderBarrel',
        stock: 'SR6.Stock',
        top: 'SR6.Top',
        side: 'SR6.Side',
        internal: 'SR6.Internal',
    },

    modificationCategories: {
        body: 'SR6.Vehicle.ModificationCategoryTypes.body',
        cosmetic: 'SR6.Vehicle.ModificationCategoryTypes.cosmetic',
        electromagnetic: 'SR6.Vehicle.ModificationCategoryTypes.electromagnetic',
        power_train: 'SR6.Vehicle.ModificationCategoryTypes.power_train',
        protection: 'SR6.Vehicle.ModificationCategoryTypes.protection',
        weapons: 'SR6.Vehicle.ModificationCategoryTypes.weapons',
    },

    lifestyleTypes: {
        street: 'SR6.LifestyleStreet',
        squatter: 'SR6.LifestyleSquatter',
        low: 'SR6.LifestyleLow',
        medium: 'SR6.LifestyleMiddle',
        high: 'SR6.LifestyleHigh',
        luxory: 'SR6.LifestyleLuxory',
        other: 'SR6.LifestyleOther',
    },

    /**
     * Labels for ALL actor types actor based local modifiers.
     *
     * All modifiers across all actor types must be included here, this is only used for display.
     */
    actorModifiers: {
        armor: 'SR6.ModifierTypes.Armor',
        astral_initiative_dice: 'SR6.ModifierTypes.AstralDice',
        astral_initiative: 'SR6.ModifierTypes.AstralInit',
        astral_limit: 'SR6.ModifierTypes.AstralLimit',
        composure: 'SR6.ModifierTypes.Composure',
        defense_block: 'SR6.ModifierTypes.DefenseBlock',
        defense_dodge: 'SR6.ModifierTypes.DefenseDodge',
        defense_parry: 'SR6.ModifierTypes.DefenseParry',
        defense_melee: 'SR6.ModifierTypes.DefenseMelee',
        defense_ranged: 'SR6.ModifierTypes.DefenseRanged',
        defense: 'SR6.ModifierTypes.Defense',
        drain: 'SR6.ModifierTypes.Drain',
        essence: 'SR6.ModifierTypes.Essence',
        fade: 'SR6.ModifierTypes.Fade',
        global: 'SR6.ModifierTypes.Global',
        judge_intentions: 'SR6.ModifierTypes.JudgeIntentions',
        lift_carry: 'SR6.ModifierTypes.LiftCarry',
        matrix_initiative_dice: 'SR6.ModifierTypes.MatrixDice',
        matrix_initiative: 'SR6.ModifierTypes.MatrixInit',
        matrix_track: 'SR6.ModifierTypes.MatrixTrack',
        meat_initiative_dice: 'SR6.ModifierTypes.MeatSpaceDice',
        meat_initiative: 'SR6.ModifierTypes.MeatSpaceInit',
        memory: 'SR6.ModifierTypes.Memory',
        mental_limit: 'SR6.ModifierTypes.MentalLimit',
        multi_defense: 'SR6.ModifierTypes.DefenseMulti',
        pain_tolerance_physical: 'SR6.ModifierTypes.PainTolerancePhysical',
        pain_tolerance_stun: 'SR6.ModifierTypes.PainToleranceStun',
        physical_limit: 'SR6.ModifierTypes.PhysicalLimit',
        physical_overflow_track: 'SR6.ModifierTypes.PhysicalOverflowTrack',
        physical_track: 'SR6.ModifierTypes.PhysicalTrack',
        reach: 'SR6.ModifierTypes.Reach',
        run: 'SR6.ModifierTypes.Run',
        soak: 'SR6.ModifierTypes.Soak',
        social_limit: 'SR6.ModifierTypes.SocialLimit',
        stun_track: 'SR6.ModifierTypes.StunTrack',
        walk: 'SR6.ModifierTypes.Walk',
        wound_tolerance: 'SR6.ModifierTypes.WoundTolerance',
    },

    /**
     * Tooltip labels used for actor modifiers. Key should use actorModifiers key.
     */
    actorModifiersTooltip: {
        armor: 'SR6.Tooltips.Modifiers.armor',
        astral_initiative_dice: 'SR6.Tooltips.Modifiers.astral_initiative_dice',
        astral_initiative: 'SR6.Tooltips.Modifiers.astral_initiative',
        astral_limit: 'SR6.Tooltips.Modifiers.astral_limit',
        composure: 'SR6.Tooltips.Modifiers.composure',
        defense_block: 'SR6.Tooltips.Modifiers.defense_block',
        defense_dodge: 'SR6.Tooltips.Modifiers.defense_dodge',
        defense_parry: 'SR6.Tooltips.Modifiers.defense_parry',
        defense_melee: 'SR6.Tooltips.Modifiers.defense_melee',
        defense_ranged: 'SR6.Tooltips.Modifiers.defense_ranged',
        defense: 'SR6.Tooltips.Modifiers.defense',
        drain: 'SR6.Tooltips.Modifiers.drain',
        essence: 'SR6.Tooltips.Modifiers.essence',
        fade: 'SR6.Tooltips.Modifiers.fade',
        global: 'SR6.Tooltips.Modifiers.global',
        judge_intentions: 'SR6.Tooltips.Modifiers.judge_intentions',
        lift_carry: 'SR6.Tooltips.Modifiers.lift_carry',
        matrix_initiative_dice: 'SR6.Tooltips.Modifiers.matrix_initiative_dice',
        matrix_initiative: 'SR6.Tooltips.Modifiers.matrix_initiative',
        matrix_track: 'SR6.Tooltips.Modifiers.matrix_track',
        meat_initiative_dice: 'SR6.Tooltips.Modifiers.meat_initiative_dice',
        meat_initiative: 'SR6.Tooltips.Modifiers.meat_initiative',
        memory: 'SR6.Tooltips.Modifiers.memory',
        mental_limit: 'SR6.Tooltips.Modifiers.mental_limit',
        multi_defense: 'SR6.Tooltips.Modifiers.multi_defense',
        pain_tolerance_physical: 'SR6.Tooltips.Modifiers.pain_tolerance_physical',
        pain_tolerance_stun: 'SR6.Tooltips.Modifiers.pain_tolerance_stun',
        physical_limit: 'SR6.Tooltips.Modifiers.physical_limit',
        physical_overflow_track: 'SR6.Tooltips.Modifiers.physical_overflow_track',
        physical_track: 'SR6.Tooltips.Modifiers.physical_track',
        reach: 'SR6.Tooltips.Modifiers.reach',
        run: 'SR6.Tooltips.Modifiers.run',
        soak: 'SR6.Tooltips.Modifiers.soak',
        social_limit: 'SR6.Tooltips.Modifiers.social_limit',
        stun_track: 'SR6.Tooltips.Modifiers.stun_track',
        walk: 'SR6.Tooltips.Modifiers.walk',
        wound_tolerance: 'SR6.Tooltips.Modifiers.wound_tolerance',
    },

    /**
     * Modification types used for actions and general success tests, based on actors.
     *
     * These are meant to be used with the Modifiers and SituationModifier classes and SR6Actor.modifiers.totalFor('wounds').
     *
     * There are additional item based modifiers that aren't present here.
     *
     * NOTE: Adding a modifier type here will directly affect modifiers shown on item actions for user selection.
     */
    modifierTypes: {
        armor: 'SR6.ModifierTypes.Armor',
        composure: 'SR6.ModifierTypes.Composure',
        defense: 'SR6.ModifierTypes.Defense',
        multi_defense: 'SR6.ModifierTypes.DefenseMulti',
        drain: 'SR6.ModifierTypes.Drain',
        environmental: 'SR6.ModifierTypes.Environmental',
        ['environmental.light']: 'SR6.ModifierTypes.EnvironmentalLight',
        ['environmental.visibility']: 'SR6.ModifierTypes.EnvironmentalVisibility',
        ['environmental.wind']: 'SR6.ModifierTypes.EnvironmentalWind',
        ['environmental.range']: 'SR6.ModifierTypes.EnvironmentalRange',
        background_count: 'SR6.ModifierTypes.BackgroundCount',
        noise: 'SR6.ModifierTypes.Noise',
        fade: 'SR6.ModifierTypes.Fade',
        global: 'SR6.ModifierTypes.Global',
        judge_intentions: 'SR6.ModifierTypes.JudgeIntentions',
        lift_carry: 'SR6.ModifierTypes.LiftCarry',
        memory: 'SR6.ModifierTypes.Memory',
        soak: 'SR6.ModifierTypes.Soak',
        wounds: 'SR6.ModifierTypes.Wounds',
        recoil: 'SR6.ModifierTypes.Recoil',
    },

    /**
     * Define here what kind of active test is to be used for the different weapon categories as a main action test.
     */
    weaponCategoryActiveTests: {
        'range': 'RangedAttackTest',
        'melee': 'MeleeAttackTest',
        'thrown': 'ThrownAttackTest'
    },

    /**
     * When casting tests from these item types, use these tests as active tests
     */
    activeTests: {
        'spell': 'SpellCastingTest',
        'ritual': 'RitualSpellcastingTest',
        'complex_form': 'ComplexFormTest'
    },

    /**
     * Using different active test details should result in these opposed tests
     *
     * Structure: {
     *  [item.type]: {[item.system.type]}: 'OpposedTest'
     * }
     */
    opposedTests: {
        'spell': {
            'combat': 'CombatSpellDefenseTest'
        }
    },

    /**
     * Using different resist tests for the oppositing depending on active tests details
     *  Structure: {
     *  [item.type]: {[item.system.type]}: 'OpposedTest'
     * }
     */
    opposedResistTests: {
        'spell': {
            'combat': 'PhysicalResistTest'
        }
    },

    /**
     * When a test is cast an active test this defines what tests should follow that tests completion
     */
    followedTests: {
        'SpellCastingTest': 'DrainTest'
    },

    // When a firemode with suppression is used, this test should defend against it.
    suppressionDefenseTest: 'SuppressionDefenseTest',

    /**
     * Names of FoundryVTT packs supplied by the system to be used as action sources.
     */
    packNames: {
        'generalActions': 'general-actions',
        'matrixActions': 'matrix-actions'
    },

    programTypes: {
        common_program: 'SR6.CommonProgram',
        hacking_program: 'SR6.HackingProgram',
        agent: 'SR6.Agent',
    },

    spiritTypes: {
        // base types
        air: 'SR6.Spirit.Types.Air',
        aircraft: 'SR6.Spirit.Types.Aircraft',
        airwave: 'SR6.Spirit.Types.Airwave',
        automotive: 'SR6.Spirit.Types.Automotive',
        beasts: 'SR6.Spirit.Types.Beasts',
        ceramic: 'SR6.Spirit.Types.Ceramic',
        earth: 'SR6.Spirit.Types.Earth',
        energy: 'SR6.Spirit.Types.Energy',
        fire: 'SR6.Spirit.Types.Fire',
        guardian: 'SR6.Spirit.Types.Guardian',
        guidance: 'SR6.Spirit.Types.Guidance',
        man: 'SR6.Spirit.Types.Man',
        metal: 'SR6.Spirit.Types.Metal',
        plant: 'SR6.Spirit.Types.Plant',
        ship: 'SR6.Spirit.Types.Ship',
        task: 'SR6.Spirit.Types.Task',
        train: 'SR6.Spirit.Types.Train',
        water: 'SR6.Spirit.Types.Water',

        // toxic types
        toxic_air: 'SR6.Spirit.Types.ToxicAir',
        toxic_beasts: 'SR6.Spirit.Types.ToxicBeasts',
        toxic_earth: 'SR6.Spirit.Types.ToxicEarth',
        toxic_fire: 'SR6.Spirit.Types.ToxicFire',
        toxic_man: 'SR6.Spirit.Types.ToxicMan',
        toxic_water: 'SR6.Spirit.Types.ToxicWater',

        // blood types
        blood: 'SR6.Spirit.Types.Blood',

        // shadow types
        muse: 'SR6.Spirit.Types.Muse',
        nightmare: 'SR6.Spirit.Types.Nightmare',
        shade: 'SR6.Spirit.Types.Shade',
        succubus: 'SR6.Spirit.Types.Succubus',
        wraith: 'SR6.Spirit.Types.Wraith',

        // shedim types
        shedim: 'SR6.Spirit.Types.Shedim',
        master_shedim: 'SR6.Spirit.Types.MasterShedim',

        // insect types
        caretaker: 'SR6.Spirit.Types.Caretaker',
        nymph: 'SR6.Spirit.Types.Nymph',
        scout: 'SR6.Spirit.Types.Scout',
        soldier: 'SR6.Spirit.Types.Soldier',
        worker: 'SR6.Spirit.Types.Worker',
        queen: 'SR6.Spirit.Types.Queen',

        // Necro types
        carcass: "SR6.Spirit.Types.Carcass",
        corpse: "SR6.Spirit.Types.Corpse",
        rot: "SR6.Spirit.Types.Rot",
        palefire: "SR6.Spirit.Types.Palefire",
        detritus: "SR6.Spirit.Types.Detritus",

        // Howling Shadow spirits
        anarch: "SR6.Spirit.Types.Anarch",
        arboreal: "SR6.Spirit.Types.Arboreal",
        blackjack: "SR6.Spirit.Types.Blackjack",
        boggle: "SR6.Spirit.Types.Boggle",
        bugul: "SR6.Spirit.Types.Bugul",
        chindi: "SR6.Spirit.Types.Chindi",
        croki: "SR6.Spirit.Types.Croki",
        duende: "SR6.Spirit.Types.Duende",
        elvar: "SR6.Spirit.Types.Elvar",
        erinyes: "SR6.Spirit.Types.Erinyes",
        greenman: "SR6.Spirit.Types.Greenman",
        imp: "SR6.Spirit.Types.Imp",
        jarl: "SR6.Spirit.Types.Jarl",
        kappa: "SR6.Spirit.Types.Kappa",
        kokopelli: "SR6.Spirit.Types.Kokopelli",
        morbi: "SR6.Spirit.Types.Morbi",
        nocnitasa: "SR6.Spirit.Types.Nocnitasa",
        phantom: "SR6.Spirit.Types.Phantom",
        preta: "SR6.Spirit.Types.Preta",
        stabber: "SR6.Spirit.Types.Stabber",
        tungak: "SR6.Spirit.Types.Tungak",
        vucub: "SR6.Spirit.Types.Vucub",
    },

    /**
     * Actor types that can be called in using the call in action type and be
     * set in it's system.action_type property.
     */
    callInActorTypes: {
        'spirit': 'TYPES.Actor.spirit',
        'sprite': 'TYPES.Actor.sprite'
    },

    critterPower: {
        categories: {
            mundane: 'SR6.CritterPower.Categories.Mundane',
            paranormal: 'SR6.CritterPower.Categories.Paranormal',
            free_spirit: 'SR6.CritterPower.Categories.FreeSpirit',
            emergent: 'SR6.CritterPower.Categories.Emergent',
            shapeshifter: 'SR6.CritterPower.Categories.Shapeshifter',
            drake: 'SR6.CritterPower.Categories.Drake',
            echoes: 'SR6.CritterPower.Categories.Echoes',
            weakness: 'SR6.CritterPower.Categories.Weakness',
            paranormal_infected: 'SR6.CritterPower.Categories.ParanormalInfected',
        },
        types: {
            mana: 'SR6.CritterPower.Types.Mana',
            physical: 'SR6.CritterPower.Types.Physical',
        },
        ranges: {
            los: 'SR6.CritterPower.Ranges.LineOfSight',
            self: 'SR6.CritterPower.Ranges.Self',
            touch: 'SR6.CritterPower.Ranges.Touch',
            los_a: 'SR6.CritterPower.Ranges.LineOfSightArea',
            special: 'SR6.CritterPower.Ranges.Special',
        },
        durations: {
            always: 'SR6.CritterPower.Durations.Always',
            instant: 'SR6.CritterPower.Durations.Instant',
            sustained: 'SR6.CritterPower.Durations.Sustained',
            permanent: 'SR6.CritterPower.Durations.Permanent',
            special: 'SR6.CritterPower.Durations.Special',
        },
    },

    spriteTypes: {
        courier: 'SR6.Sprite.Types.Courier',
        crack: 'SR6.Sprite.Types.Crack',
        data: 'SR6.Sprite.Types.Data',
        fault: 'SR6.Sprite.Types.Fault',
        machine: 'SR6.Sprite.Types.Machine',
        companion: 'SR6.Sprite.Types.Companion',
        generalist:'SR6.Sprite.Types.Generalist',
    },

    vehicle: {
        types: {
            air: 'SR6.Vehicle.Types.Air',
            aerospace: 'SR6.Vehicle.Types.Aerospace',
            ground: 'SR6.Vehicle.Types.Ground',
            water: 'SR6.Vehicle.Types.Water',
            walker: 'SR6.Vehicle.Types.Walker',
            exotic: 'SR6.Vehicle.Types.Exotic',
        },
        stats: {
            handling: 'SR6.Vehicle.Stats.Handling',
            off_road_handling: 'SR6.Vehicle.Stats.OffRoadHandling',
            speed: 'SR6.Vehicle.Stats.Speed',
            off_road_speed: 'SR6.Vehicle.Stats.OffRoadSpeed',
            acceleration: 'SR6.Vehicle.Stats.Acceleration',
            pilot: 'SR6.Vehicle.Stats.Pilot',
            sensor: 'SR6.Vehicle.Stats.Sensor',
            seats: 'SR6.Vehicle.Stats.Seats'
        },
        control_modes: {
            manual: 'SR6.Vehicle.ControlModes.Manual',
            remote: 'SR6.Vehicle.ControlModes.Remote',
            rigger: 'SR6.Vehicle.ControlModes.Rigger',
            autopilot: 'SR6.Vehicle.ControlModes.Autopilot',
        },
        environments: {
            speed: 'SR6.Vehicle.Environments.Speed',
            handling: 'SR6.Vehicle.Environments.Handling',
        },
    },

    ic: {
        types: {
            acid: "SR6.IC.Types.Acid",
            binder: "SR6.IC.Types.Binder",
            black_ic: "SR6.IC.Types.BlackIC",
            blaster: "SR6.IC.Types.Blaster",
            bloodhound: "SR6.IC.Types.Bloodhound",
            blue_goo: "SR6.IC.Types.BlueGoo",
            catapult: "SR6.IC.Types.Catapult",
            crash: "SR6.IC.Types.Crash",
            flicker: "SR6.IC.Types.Flicker",
            jammer: "SR6.IC.Types.Jammer",
            killer: "SR6.IC.Types.Killer",
            marker: "SR6.IC.Types.Marker",
            patrol: "SR6.IC.Types.Patrol",
            probe: "SR6.IC.Types.Probe",
            scramble: "SR6.IC.Types.Scramble",
            shocker: "SR6.IC.Types.Shocker",
            sleuther: "SR6.IC.Types.Sleuther",
            sparky: "SR6.IC.Types.Sparky",
            tar_baby: "SR6.IC.Types.TarBaby",
            track: "SR6.IC.Types.Track"
        }
    },

    character: {
        types: {
            human: 'SR6.Character.Types.Human',
            elf: 'SR6.Character.Types.Elf',
            ork: 'SR6.Character.Types.Ork',
            dwarf: 'SR6.Character.Types.Dwarf',
            troll: 'SR6.Character.Types.Troll',
        },
    },

    /**
     * The available range weapon modes for to SR5#424
     *
     * These are the mode selectors on the weapon. The term 'fire mode'
     * is only used to describe as the combination of weapon mode and action
     * used, causing a specific fire mode.
     *
     * NOTE: This list is also used for sorting order of ranged weapon mode.
     *       Alter it with care.
     */
    rangeWeaponMode: [
        'single_shot',
        'semi_auto',
        'burst_fire',
        'full_auto'
    ],

    rangeWeaponModeLabel: {
        'single_shot': 'SR6.Weapon.Mode.SingleShot',
        'semi_auto': 'SR6.Weapon.Mode.SemiAuto',
        'burst_file': 'SR6.Weapon.Mode.BurstFire',
        'full_auto': 'SR6.Weapon.Mode.FullAuto'
    },

    /**
     * The preconfigured default Shadowrun firemodes according to SR5#180
     *
     * These are separate from ranged weapon modes but depend on the selected
     * ranged weapon mode.
     */
    fireModes: [
    {
        label: "SR6.Weapon.Mode.SingleShot",
        value: 1,
        recoil: false,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'single_shot'
    },
    {
        label: "SR6.Weapon.Mode.SemiAutoShort",
        value: 1,
        recoil: true,
        defense: 0,
        suppression: false,
        action: 'simple',
        mode: 'semi_auto'
    },
    {
        label: "SR6.Weapon.Mode.SemiAutoBurst",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'complex',
        mode: 'semi_auto'
    },

    {
        label: "SR6.Weapon.Mode.BurstFire",
        value: 3,
        recoil: true,
        defense: -2,
        suppression: false,
        action: 'simple',
        mode: 'burst_fire'
    },
    {
        label: "SR6.Weapon.Mode.BurstFireLong",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'complex',
        mode: 'burst_fire',
    },
    {
        label: "SR6.Weapon.Mode.FullAutoShort",
        value: 6,
        recoil: true,
        defense: -5,
        suppression: false,
        action: 'simple',
        mode: 'full_auto'
    },
    {
        label: 'SR6.Weapon.Mode.FullAutoLong',
        value: 10,
        recoil: true,
        defense: -9,
        suppression: false,
        action: 'complex',
        mode: 'full_auto'
    },
    {
        label: 'SR6.Suppressing',
        value: 20,
        recoil: false,
        defense: 0,
        suppression: true,
        action: 'complex',
        mode: 'full_auto'
    }
    ] as Shadowrun.FireModeData[],

    /**
     * Active/AdvancedEffect apply To types and their labels.
     *
     * actor is the default Foundry apply to type of ActiveEffects and will be affect actor data.
     */
    effectApplyTo: {
        'actor': 'SR6.FOUNDRY.Actor',
        // 'item': 'SR6.FOUNDRY.Item', // Disabled, as systems nested item approach brings issues.
        'targeted_actor': 'SR6.ActiveEffect.ApplyTos.TargetedActor',
        'test_all': 'SR6.Test',
        'test_item': 'SR6.ActiveEffect.ApplyTos.TestItem',
        'modifier': 'SR6.Modifier'
    },

    itemSubTypeIconOverrides: {
        action: {},
        adept_power: {
            'adept-spell': 'spell/spell'
        },
        ammo: {
            'ammo': '',
            'arrow': '',
            'bola': '',
            'bolt': '',
            'grenade': '',
            'micro-torpedo': '',
            'minigrenade': '',
            'missile': '',
            'rocket': '',
            'torpedo-grenade': ''
        },
        armor: {
            'armor': '',
            'cloaks': '',
            'clothing': '',
            'high-fashion-armor-clothing': '',
            'specialty-armor': ''
        },
        bioware: {
            'basic': 'bioware/bioware',
            'bio-weapons': '',
            'biosculpting': '',
            'chemical-gland-modifications': '',
            'complimentary-genetics': '',
            'cosmetic-bioware': '',
            'cultured': '',
            'environmental-microadaptation': '',
            'exotic-metaglands': '',
            'genetic-restoration': '',
            'immunization': '',
            'orthoskin-upgrades': '',
            'phenotype-adjustment': 'bioware/biosculpting',
            'symbionts': 'bioware/cultured',
            'transgenic-alteration': 'bioware/transgenic-alteration',
            'transgenics': ''
        },
        complex_form: {},
        contact: {},
        critter_power: {
            'mana': '',
            'physical': 'critter_power/critter_power'
        },
        cyberware: {
            'auto-injector-mods': '',
            'bodyware': '',
            'cosmetic-enhancement': 'bioware/cosmetic-bioware',
            'cyber-implant-weapon': '',
            'cyber-implant-weapon-accessory': '',
            'cyberlimb': '',
            'cyberlimb-accessory': '',
            'cyberlimb-enhancement': '',
            'cybersuite': '',
            'earware': '',
            'eyeware': '',
            'hard-nanoware': '',
            'headware': 'cyberware/cyberware',
            'nanocybernetics': 'cyberware/hard-nanoware',
            'soft-nanoware': 'cyberware/hard-nanoware',
            'special-biodrone-cyberware': ''
        },
        device: {
            'commlink': 'device',
            'cyberdeck': '',
            'rcc': ''
        },
        echo: {},
        equipment: {
            'alchemical-tools': '',
            'appearance-modification': '',
            'armor-enhancements': '',
            'audio-devices': '',
            'audio-enhancements': '',
            'autosofts': 'equipment/software',
            'biotech': '',
            'booster-chips': '',
            'breaking-and-entering-gear': '',
            'btls': '',
            'chemicals': '',
            'commlink-accessories': '',
            'commlink-apps': 'equipment/software',
            'commlink-cyberdeck-form-factors': '',
            'communications-and-countermeasures': 'equipment/pi-tac',
            'contracts-upkeep': '',
            'critter-gear': '',
            'currency': '',
            'custom-cyberdeck-attributes': '',
            'cyberdeck-modules': '',
            'cyberterminals': 'equipment/pi-tac',
            'disguises': 'equipment/appearance-modification',
            'drug-grades': '',
            'drugs': '',
            'electronic-accessories': '',
            'electronic-modification': '',
            'electronic-parts': '',
            'electronics-accessories': '',
            'entertainment': '',
            'explosives': '',
            'extraction-devices': '',
            'foci': '',
            'food': '',
            'formulae': '',
            'grapple-gun': '',
            'hard-nanoware': 'cyberware/hard-nanoware',
            'housewares': '',
            'id-credsticks': '',
            'magical-compounds': '',
            'magical-supplies': '',
            'matrix-accessories': '',
            'metatype-specific': '',
            'miscellany': '',
            'musical-instruments': '',
            'nanogear': 'cyberware/hard-nanoware',
            'paydata': '',
            'pi-tac': '',
            'pi-tac-programs': 'equipment/software',
            'printing': '',
            'reporter-gear': '',
            'rfid-tags': 'equipment/pi-tac',
            'security-devices': '',
            'sensor-functions': '',
            'sensor-housings': '',
            'sensors': 'equipment/pi-tac',
            'services': '',
            'skillsofts': 'equipment/software',
            'software': '',
            'software-tweaks': 'equipment/software',
            'survival-gear': '',
            'tailored-perfume-cologne': '',
            'tools': '',
            'tools-of-the-trade': '',
            'toxins': '',
            'vision-devices': '',
            'vision-enhancements': ''
        },
        host: {},
        lifestyle: {},
        metamagic: {},
        modification: {
            'barrel': '',
            'other': '',
            'side': '',
            'stock': '',
            'top': '',
            'under': 'modification/modification'
        },
        program:        {
            'common_program': '',
            'hacking_program': ''
        },
        quality: {
            'negative': '',
            'positive': ''
        },
        sin: {},
        spell: {
            'combat': '',
            'detection': '',
            'enchantments': '',
            'health': '',
            'illusion': '',
            'manipulation': ''
        },
        ritual: {},
        sprite_power: {},
        weapon: {
            // Options before : in name are 'Grenade', 'Minigrenade', 'Rocket', 'Missile', 'Torpedo Grenade', 'Micro-Torpedo'
            'melee': '',
            'ranged': '',
            'thrown': '',
            'assault-cannons': '',
            'assault-rifles': '',
            'bio-weapon': 'cyberware/cyber-implant-weapon',
            'blades': '',
            'bows': '',
            'carbines': '',
            'clubs': '',
            'crossbows': '',
            'cyberweapon': 'cyberware/cyber-implant-weapon',
            'exotic-melee-weapons': '',
            'exotic-ranged-weapons': '',
            'flamethrowers': '',
            'gear': 'equipment/equipment',
            'grenade-launchers': '',
            'grenade': 'ammo/grenade',
            'heavy-machine-guns': 'weapon/assault-cannons',
            'heavy-pistols': '',
            'holdouts': '',
            'improvised-weapons': '',
            'laser-weapons': '',
            'light-machine-guns': 'weapon/assault-cannons',
            'light-pistols': '',
            'machine-pistols': '',
            'medium-machine-guns': 'weapon/assault-cannons',
            'micro-drone-weapons': '',
            'micro-torpedo': 'ammo/micro-torpedo',
            'minigrenade': 'ammo/minigrenade',
            'missile': 'ammo/missile',
            'missile-launchers': '',
            'quality': 'quality/quality',
            'rocket': 'ammo/rocket',
            'shotguns': '',
            'sniper-rifles': '',
            'sporting-rifles': 'weapon/carbines',
            'submachine-guns': '',
            'tasers': '',
            'torpedo-grenade': 'ammo/torpedo-grenade',
            'unarmed': '',
            'underbarrel-weapons': 'modification/modification'
        }
    }
} as const;
