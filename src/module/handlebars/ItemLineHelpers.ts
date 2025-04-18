import { SR6ItemDataWrapper } from '../data/SR6ItemDataWrapper';
import { SR6 } from '../config';
import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import MarkedDocument = Shadowrun.MarkedDocument;
import { InventorySheetDataByType } from '../actor/sheets/SR6BaseActorSheet';
import { SR6ActiveEffect } from '../effect/SR6ActiveEffect';
import { formatStrict } from '../utils/strings';
import ActionType = Shadowrun.ActionType;
import InitiativeTiming = Shadowrun.InitiativeTiming;

/**
 * Format action type and initiative timing with appropriate classes for styling
 * @param actionType The action type (major, minor, free, etc.)
 * @param initiativeTiming The initiative timing (initiative, anytime, etc.)
 * @returns HTML string with appropriate classes
 */
function formatActionTypeWithClasses(actionType: ActionType, initiativeTiming: InitiativeTiming): string {
    let typeCode = '';
    let typeClass = '';
    let timingCode = '';
    let timingClass = '';

    // Get the type code and class
    if (actionType) {
        switch(actionType) {
            case 'major':
                typeCode = 'M';
                typeClass = 'action-major';
                break;
            case 'minor':
                typeCode = 'm';
                typeClass = 'action-minor';
                break;
            case 'free':
                typeCode = 'F';
                typeClass = 'action-free';
                break;
            case 'varies':
                typeCode = 'V';
                typeClass = 'action-varies';
                break;
            case 'none':
            default:
                typeCode = '';
                typeClass = '';
                break;
        }
    }

    // Get the timing code and class
    if (initiativeTiming) {
        switch(initiativeTiming) {
            case 'initiative':
                timingCode = '(I)';
                timingClass = 'timing-initiative';
                break;
            case 'anytime':
                timingCode = '(A)';
                timingClass = 'timing-anytime';
                break;
            case 'none':
            default:
                timingCode = '';
                timingClass = '';
                break;
        }
    }

    // If we have no type code, return an empty string
    if (!typeCode) return '';

    // Combine the codes with appropriate classes
    const classes = ['action-type', typeClass, timingClass].filter(Boolean).join(' ');
    return `<span class="${classes}">${typeCode}${timingCode}</span>`;
}

/**
 * Typing around the legacy item list helper.
 */
interface ItemListRightSide {
    // Provide a simple text, main use for column headers.
    text?: {
        text: string | number | undefined
        title?: string // TODO: This doesn't seem to be doing anything in ListItem.html
        cssClass?: string
    }
    // Provide a button element, main use for column values.
    button?: {
        text: string | number
        cssClass?: string
        // Shorten the button visually...
        short?: boolean
    }
    // Provide a input element, main use for column values.
    input?: {
        type: string
        value: any
        cssClass?: string
    }
    // Provide html as string.
    html?: {
        text: string
        cssClass?: string
    }
}

export const registerItemLineHelpers = () => {
    Handlebars.registerHelper('InventoryHeaderIcons', function (section: InventorySheetDataByType) {
        var icons = Handlebars.helpers['ItemHeaderIcons'](section.type) as object[];

        icons.push(section.isOpen
            ? {
                icon: 'fas fa-square-chevron-up',
                title: game.i18n.localize('SR6.Collapse'),
                cssClass: 'item-toggle',
                // Add HTML data attributes using a key<string>:value<string> structure
                data: {}
            }
            : {
                icon: 'fas fa-square-chevron-down',
                title: game.i18n.localize('SR6.Expand'),
                cssClass: 'item-toggle',
                // Add HTML data attributes using a key<string>:value<string> structure
                data: {}
            }
        );

        return icons;
    })

    Handlebars.registerHelper('ItemHeaderIcons', function (type: string) {
        const PlusIcon = 'fas fa-plus';
        const AddText = game.i18n.localize('SR6.Add');
        const addIcon = {
            icon: PlusIcon,
            text: AddText,
            title: formatStrict('SR6.Create', { type: 'SR6.Item' }),
            cssClass: 'item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: {}
        };
        switch (type) {
            case 'lifestyle':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Lifestyle' });
                return [addIcon];
            case 'contact':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.Contact' });
                return [addIcon];
            case 'sin':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.SIN' });
                return [addIcon];
            case 'license':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.License' });
                return [addIcon];
            case 'quality':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Quality' });
                return [addIcon];
            case 'adept_power':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.AdeptPower' });
                return [addIcon];
            case 'action':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Action' });
                return [addIcon];
            case 'spell':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.Spell' });
                return [addIcon];
            case 'ritual':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.Ritual' });
                return [addIcon];
            case 'gear':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Gear' });
                return [addIcon];
            case 'complex_form':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ComplexForm' });
                return [addIcon];
            case 'program':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Program' });
                return [addIcon];
            case 'weapon':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.Weapon' });
                return [addIcon];
            case 'armor':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Armor' });
                return [addIcon];
            case 'ammo':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Ammo' });
                return [addIcon];
            case 'modification':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Modification' });
                return [addIcon];
            case 'device':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Device' });
                return [addIcon];
            case 'equipment':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Equipment' });
                return [addIcon];
            case 'cyberware':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Cyberware' });
                return [addIcon];
            case 'bioware':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.Bioware' });
                return [addIcon];
            case 'critter_power':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.CritterPower' });
                return [addIcon];
            case 'sprite_power':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.ItemTypes.SpritePower' });
                return [addIcon];
            case 'echo':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Echo' });
                return [addIcon];
            case 'metamagic':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Metamagic' });
                return [addIcon];
            case 'summoning':
                // NOTE: summoning is not an actual item type. It's a call_in_action sub type
                addIcon.title = game.i18n.localize('SR6.CallInAction.CreateSummoning');
                return [addIcon];
            case 'compilation':
                // NOTE: compilation is not an actual item type. It's a call_in_action sub type
                addIcon.title = game.i18n.localize('SR6.CallInAction.CreateCompilation');
                return [addIcon];
            case 'effect':
                addIcon.title = formatStrict('SR6.Create', { type: 'SR6.Effect' });
                addIcon.cssClass = 'effect-control';
                addIcon.data = { action: 'create' };
                return [addIcon];
            default:
                return [];
        }
    });

    Handlebars.registerHelper('InventoryIcons', function (name: string) {
        const addItemIcon = {
            icon: 'fas fa-plus',
            text: game.i18n.localize('SR6.Add'),
            title: formatStrict('SR6.Create', { type: 'SR6.Item' }),
            cssClass: 'inventory-item-create',
            // Add HTML data attributes using a key<string>:value<string> structure
            data: { inventory: name }
        };

        return [addItemIcon];
    });

    /**
     * The legacy ItemList helper to provide a generic way of defining headers and columns
     * on the 'right side' of an item list across all document sheets.
     */
    Handlebars.registerHelper('ItemHeaderRightSide', function (id: string): ItemListRightSide[] {
        switch (id) {
            case 'action':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.ActionType'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Skill'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Attribute'),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Modifier'),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'weapon':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'modification':
            case 'ammo':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Qty'),
                        },
                    },
                ];
            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Target'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Fade'),
                        },
                    },
                ];
            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.PowerType'),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Spell.Type'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Spell.Range'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Duration'),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Drain'),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.CritterPower.Type')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.CritterPower.Range')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.CritterPower.Duration')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Rating')
                        }
                    },
                ];
            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.QualityType'),
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Rating'),
                        },
                    },
                ];
            case 'echo':
            case 'metamagic':
                return [{}];
            case 'summoning':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Summoning.SpiritType')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Force')
                        }
                    }
                ]
            case 'compilation':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Compilation.SpriteType')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Level')
                        }
                    }
                ]

            // General use case item lines
            case 'modifiers':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.Value')
                        }
                    }
                ]
            case 'itemEffects':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.ActiveEffect.ApplyTo')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Duration')
                        }
                    },
                    {
                        text: {
                            // Used as a placeholder for effect line icons.
                            // This way the header column is empty (as no +Add makes sense)
                            // However the line column contains the normal interaction icons.
                            text: ''
                        }
                    }
                ]
            case 'effects':
                return [
                    {
                        text: {
                            text: game.i18n.localize('SR6.ActiveEffect.ApplyTo')
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize('SR6.Duration')
                        }
                    }
                ]
            default:
                return [];
        }
    });

    /**
     * Helper for ListItem parts do define segments on the right hand sight per list row.
     *
     * These must match in order and quantity to the ItemHeadersRightSide helper.
     * Example of a matching list header by ItemHeader:
     * <header name>                          <ItemHeaderRightSide>['First Header', 'Second Header']
     * Example of a list item row:
     * <list name>                            <ItemRightSide>      ['First Value',  'Second Value']
     *
     * @param item The item to render the right side for.
     *             NOTE: ItemHeaderRightSide doesn't use the whole item to determine what to show, while
     *                   ItemRightSide does. This is due to ItemRightSide showing content, while ItemHeaderRightSide
     *                   showing dscriptors for that content.
     */
    Handlebars.registerHelper('ItemRightSide', function (item: ShadowrunItemData): ItemListRightSide[] {
        const wrapper = new SR6ItemDataWrapper(item);
        const qtyInput = {
            input: {
                type: 'number',
                value: wrapper.getQuantity(),
                cssClass: 'item-qty',
            },
        };

        switch (item.type) {
            case 'action':

                // Only show a limit, when one is defined. Either by name or attribute
                const limitAttribute = item.system.action.limit.attribute;
                const limitBase = Number(item.system.action.limit.base);
                // Transform into text values, either numerical or localized.
                const textLimitParts: string[] = [];
                if (!isNaN(limitBase) && limitBase > 0) {
                    textLimitParts.push(limitBase.toString());
                }
                if (limitAttribute) {
                    textLimitParts.push(game.i18n.localize(SR6.limits[limitAttribute ?? '']));
                }
                const textLimit = textLimitParts.join(' + ');

                return [
                    {
                        html: {
                            // Use HTML to add classes for styling
                            text: formatActionTypeWithClasses(item.system.action.type, item.system.action.initiative_timing),
                            cssClass: 'action-type-container'
                        },
                    },
                    {
                        text: {
                            // Either use the legacy skill localization OR just the skill name/id instead.
                            text: game.i18n.localize(SR6.activeSkills[wrapper.getActionSkill() ?? ''] ?? wrapper.getActionSkill()),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.attributes[wrapper.getActionAttribute() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            // Legacy actions could have both skill and attribute2 set, which would show both information, when it shouldn't.
                            text: wrapper.getActionSkill() ? '' : game.i18n.localize(SR6.attributes[wrapper.getActionAttribute2() ?? '']),
                            cssClass: 'six',
                        },
                    },
                    {
                        text: {
                            text: wrapper.getActionDicePoolMod(),
                            cssClass: 'six',
                        },
                    },
                ];
            case 'armor':
            case 'ammo':
            case 'modification':
                if (wrapper.isVehicleModification()) {
                    return [
                        {
                            text: {
                                text: game.i18n.localize(SR6.modificationCategories[wrapper.getModificationCategory() ?? ''])
                            },

                        },
                        {
                            text: {
                                text: wrapper.getModificationCategorySlots() ?? ''
                            },
                        },
                        qtyInput,
                    ];
                };

                if (wrapper.isDroneModification()) {
                    return [
                        {
                            text: {
                                text: wrapper.getModificationCategorySlots() ?? ''
                            },
                        },
                        qtyInput,
                    ];
                }
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
                return [qtyInput];
            case 'weapon':
                // Both Ranged and Melee Weapons can have ammo.
                if (wrapper.isRangedWeapon() || (wrapper.isMeleeWeapon() && item.system.ammo?.current.max > 0)) {
                    const count = wrapper.getAmmo()?.current.value ?? 0;
                    const max = wrapper.getAmmo()?.current.max ?? 0;
                    const partialReloadRounds = wrapper.getAmmo()?.partial_reload_value ?? -1;

                    const reloadLinks: ItemListRightSide[] = [];

                    // Show reload on both no ammo configured and partially consumed clips.
                    const textReload = count < max ?
                        `${game.i18n.localize('SR6.Weapon.Reload')} ` :
                        `${game.i18n.localize('SR6.AmmoFull')}`;

                    const cssClassReload = 'no-break';

                    reloadLinks.push({
                        text: {
                            title: `${game.i18n.localize('SR6.Weapon.AmmoCount')}: `,
                            text: textReload,
                            cssClass: cssClassReload,
                        },
                    });

                    if (count < max) {
                        const textFullReload = `${game.i18n.localize('SR6.Weapon.FullReload')} (${count}/${max})`;
                        const cssClassFullReload = 'no-break reload-ammo roll';

                        reloadLinks.push({
                            button: {
                                short: true,
                                text: textFullReload,
                                cssClass: cssClassFullReload,
                            },
                        });
                    }

                    if(count < max && partialReloadRounds > 0) {
                        const textPartialReload = `${game.i18n.localize('SR6.Weapon.PartialReload')} (+${partialReloadRounds})`;
                        const cssClassPartialReload = 'no-break partial-reload-ammo roll';

                        reloadLinks.push({
                            button: {
                                short: true,
                                text: textPartialReload,
                                cssClass: cssClassPartialReload,
                            },
                        });
                    }

                    reloadLinks.push(qtyInput)

                    return reloadLinks;
                } else {
                    return [qtyInput];
                }

            case 'quality':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR6.qualityTypes[item.system.type ?? '']),
                        }
                    },
                    {
                        text: {
                            text: item.system.rating || '',
                        },
                    }
                ];

            case 'adept_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR6.adeptPower.types[item.system.type ?? '']),
                        },
                    },
                ];
            case 'spell':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR6.spellTypes[item.system.type ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.spellRanges[item.system.range ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.durations[item.system.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: wrapper.getDrain(),
                        },
                    },
                ];
            case 'critter_power':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR6.critterPower.types[item.system.powerType ?? ''])
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.critterPower.ranges[item.system.range ?? ''])
                        }
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.critterPower.durations[item.system.duration ?? ''])
                        }
                    },
                    {
                        text: {
                            text: item.system.rating ?? ''
                        }
                    }
                ];

            case 'complex_form':
                return [
                    {
                        text: {
                            text: game.i18n.localize(SR6.matrixTargets[item.system.target ?? '']),
                        },
                    },
                    {
                        text: {
                            text: game.i18n.localize(SR6.durations[item.system.duration ?? '']),
                        },
                    },
                    {
                        text: {
                            text: String(item.system.fade),
                        },
                    },
                ];
            case 'program':
                return [
                    {
                        button: {
                            cssClass: `item-equip-toggle ${wrapper.isEquipped() ? 'light' : ''}`,
                            short: true,
                            text: wrapper.isEquipped() ? game.i18n.localize('SR6.Loaded') : game.i18n.localize('SR6.Load') + ' >>',
                        },
                    },
                ];

            case 'echo':
            case 'metamagic':
                return [{}];
            /**
             * Call In Actions differ depending on called in actor type.
             */
            case 'call_in_action':
                if (item.system.actor_type === 'spirit') {
                    const summoningData = item.system as Shadowrun.CallInActionData;
                    const spiritTypeLabel = SR6.spiritTypes[summoningData.spirit.type] ?? '';

                    return [
                        {
                            text: {
                                text: game.i18n.localize(spiritTypeLabel)
                            }
                        },
                        {
                            text: {
                                text: summoningData.spirit.force
                            }
                        }
                    ]
                }

                if (item.system.actor_type === 'sprite') {
                    const compilationData = item.system as Shadowrun.CallInActionData;
                    const spriteTypeLabel = SR6.spriteTypes[compilationData.sprite.type] ?? '';

                    return [
                        {
                            text: {
                                text: game.i18n.localize(spriteTypeLabel)
                            }
                        },
                        {
                            text: {
                                text: compilationData.sprite.level
                            }
                        }
                    ]
                }

            default:
                return [];
        }
    });

    Handlebars.registerHelper('ItemIcons', function (item: ShadowrunItemData) {
        const wrapper = new SR6ItemDataWrapper(item);

        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR6.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR6.DeleteItem'),
        };
        const equipIcon = {
            icon: `${wrapper.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR6.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR6.OpenSource'),
        };

        const icons = [pdfIcon, editIcon, removeIcon];

        switch (wrapper.getType()) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'weapon':
                icons.unshift(equipIcon);
        }

        return icons;
    });

    /**
     * Used for the actor sheets display of active effects.
     */
    Handlebars.registerHelper('EffectRightSide', function (effect: SR6ActiveEffect) {
        const getDurationLabel = () => {
            // @ts-expect-error - duration is not typed correctly
            if (effect.duration.seconds) return `${effect.duration.seconds}s`;
            // @ts-expect-error - duration is not typed correctly
            if (effect.duration.rounds && effect.duration.turns) return `${effect.duration.rounds}r, ${effect.duration.turns}t`;
            // @ts-expect-error - duration is not typed correctly
            if (effect.duration.rounds) return `${effect.duration.rounds}r`;
            // @ts-expect-error - duration is not typed correctly
            if (effect.duration.turns) return `${effect.duration.turns}t`;

            return '';
        }

        return [
            {
                // Apply To Column
                text: {
                    text: game.i18n.localize(SR6.effectApplyTo[effect.applyTo]),
                    cssClass: 'six',
                }
            },
            {
                // Duration Column
                text: {
                    text: getDurationLabel(),
                    cssClass: 'six',
                }
            }
        ];
    });

    Handlebars.registerHelper('InventoryItemIcons', function (item: ShadowrunItemData) {
        const wrapper = new SR6ItemDataWrapper(item);
        const moveIcon = {
            icon: 'fas fa-exchange-alt inventory-item-move',
            title: game.i18n.localize('SR6.MoveItemInventory')
        };
        const editIcon = {
            icon: 'fas fa-edit item-edit',
            title: game.i18n.localize('SR6.EditItem'),
        };
        const removeIcon = {
            icon: 'fas fa-trash item-delete',
            title: game.i18n.localize('SR6.DeleteItem'),
        };
        const equipIcon = {
            icon: `${wrapper.isEquipped() ? 'fas fa-check-circle' : 'far fa-circle'} item-equip-toggle`,
            title: game.i18n.localize('SR6.ToggleEquip'),
        };
        const pdfIcon = {
            icon: 'fas fa-file open-source',
            title: game.i18n.localize('SR6.OpenSource'),
        };

        const icons = [pdfIcon, moveIcon, editIcon, removeIcon];

        switch (wrapper.getType()) {
            case 'program':
            case 'armor':
            case 'device':
            case 'equipment':
            case 'cyberware':
            case 'bioware':
            case 'weapon':
                icons.unshift(equipIcon);
        }

        return icons;
    });

    /**
     * Helper specifically for active effect icons.
     *
     * Add HTML data attributes using a key<string>:value<string> structure for each icon.
     */
    Handlebars.registerHelper('EffectIcons', function (effect) {
        const editIcon = {
            icon: 'fas fa-edit effect-control',
            title: game.i18n.localize('SR6.EditItem'),
            data: { action: 'edit' }
        };
        const removeIcon = {
            icon: 'fas fa-trash effect-control',
            title: game.i18n.localize('SR6.DeleteItem'),
            data: { action: 'delete' }
        };
        const disableIcon = {
            icon: `${effect.disabled ? 'far fa-circle' : 'fas fa-check-circle'} effect-control`,
            title: game.i18n.localize('SR6.ToggleActive'),
            data: { action: "toggle" }
        };
        const openOriginIcon = {
            icon: 'fas fa-file effect-control',
            title: game.i18n.localize('SR6.OpenOrigin'),
            data: { action: "open-origin" }
        }
        // Disallow changes to effects that aren't of direct origin.
        let icons = [disableIcon, editIcon, removeIcon];
        if (effect.isOriginOwned) icons = [openOriginIcon, ...icons];
        return icons;
    });

    /**
     * Helper specifically for active effect icons sourced from an actors items to display in list form.
     */
    Handlebars.registerHelper('ItemEffectIcons', function (effect) {
        const openOriginIcon = {
            icon: 'fas fa-file item-effect-control',
            title: game.i18n.localize('SR6.OpenOrigin'),
            data: { action: "open-origin" }
        }
        const disableIcon = {
            icon: `${effect.disabled ? 'far fa-circle' : 'fas fa-check-circle'} item-effect-control`,
            title: game.i18n.localize('SR6.ToggleActive'),
            data: { action: "toggle" }
        };
        const editIcon = {
            icon: 'fas fa-edit item-effect-control',
            title: game.i18n.localize('SR6.EditItem'),
            data: { action: 'edit' }
        };

        return [openOriginIcon, disableIcon, editIcon];
    });

    // Allow Matrix Marks to be changed on the spot on a Sheet.
    Handlebars.registerHelper('MarksRightSide', (marked: MarkedDocument) => {
        const quantityInput = {
            input: {
                type: 'number',
                value: marked.marks,
                cssClass: 'marks-qty',
            },
        };
        return [quantityInput]
    });

    // Matrix Mark interaction on a Sheet.
    Handlebars.registerHelper('MarksIcons', (marked: MarkedDocument) => {
        const incrementIcon = {
            icon: 'fas fa-plus marks-add-one',
            title: game.i18n.localize('SR6.Labels.Sheet.AddOne'),
            data: { action: 'add-one' }
        };
        const decrementIcon = {
            icon: 'fas fa-minus marks-remove-one',
            title: game.i18n.localize('SR6.Labels.Sheet.SubtractOne'),
            data: { action: 'remove-one' }
        }

        return [incrementIcon, decrementIcon];
    });

    /**
     * Helper to convert action types to their abbreviated form with initiative timing
     * Format: [Type][Timing]
     *
     * Type:
     * - Major: 'M'
     * - Minor: 'm'
     * - Free: 'F'
     * - None: ''
     * - Varies: 'V'
     *
     * Timing (in parentheses):
     * - In Initiative: '(I)'
     * - Any Time: '(A)'
     * - None: '' (no parentheses)
     */
    Handlebars.registerHelper('formatActionType', function(actionType: ActionType, initiativeTiming: InitiativeTiming) {
        let typeCode = '';
        let timingCode = '';

        // Get the type code
        if (actionType) {
            switch(actionType) {
                case 'major': typeCode = 'M'; break;
                case 'minor': typeCode = 'm'; break;
                case 'free': typeCode = 'F'; break;
                case 'varies': typeCode = 'V'; break;
                case 'none':
                default: typeCode = ''; break;
            }
        }

        // Get the timing code
        if (initiativeTiming) {
            switch(initiativeTiming) {
                case 'initiative': timingCode = '(I)'; break;
                case 'anytime': timingCode = '(A)'; break;
                case 'none':
                default: timingCode = ''; break;
            }
        }

        // Combine the codes
        return typeCode + timingCode;
    });

    Handlebars.registerHelper('MarkListHeaderRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR6.FOUNDRY.Scene'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR6.FOUNDRY.Item'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR6.Qty'),
                },
            }]
    });

    Handlebars.registerHelper('MarkListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR6.ClearMarks'),
            text: game.i18n.localize('SR6.Del'),
            cssClass: 'marks-clear-all'
        }];
    });

    Handlebars.registerHelper('NetworkDevicesListRightSide', () => {
        return [
            {
                text: {
                    text: game.i18n.localize('SR6.FOUNDRY.Actor'),
                },
            },
            {
                text: {
                    text: game.i18n.localize('SR6.FOUNDRY.Item'),
                },
            }]
    })

    Handlebars.registerHelper('NetworkDevicesListHeaderIcons', () => {
        return [{
            icon: 'fas fa-trash',
            title: game.i18n.localize('SR6.Labels.Sheet.ClearNetwork'),
            text: game.i18n.localize('SR6.Del'),
            cssClass: 'network-clear'
        }];
    });

    /**
     * Helper to check if a string contains a substring
     */
    Handlebars.registerHelper('contains', function(str, substring) {
        if (!str || !substring) return false;
        return String(str).toLowerCase().includes(String(substring).toLowerCase());
    });

    /**
     * Helper for logical OR operation
     */
    Handlebars.registerHelper('or', function() {
        for (let i = 0; i < arguments.length - 1; i++) {
            if (arguments[i]) return true;
        }
        return false;
    });

    /**
     * Helper to convert a JSON string to an object
     */
    Handlebars.registerHelper('json', function(context) {
        if (typeof context === 'string') {
            try {
                return JSON.stringify(context);
            } catch (e) {
                return context;
            }
        }
        return JSON.stringify(context);
    });

    /**
     * Helper for equality comparison
     */
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });
};
