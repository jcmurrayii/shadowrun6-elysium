#!/usr/bin/env python3
"""
Fixed weapons.py script for SR6 Elysium system
This script extracts weapon data from a PDF and creates proper FoundryVTT weapon JSON files
"""

import json
import re
import os
import sys

# Check if pdfplumber is available
try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False
    print("Warning: pdfplumber not installed. Install with: pip install pdfplumber")

def generate_foundry_id():
    """Generate a valid 16-character alphanumeric FoundryVTT document ID"""
    import random
    import string
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(16))

def slugify(name):
    """Convert name to filename-safe slug"""
    name = name.lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"\s+", "-", name.strip())
    return name

def create_weapon_template():
    """Create a proper weapon template based on existing weapon structure"""
    weapon_id = generate_foundry_id()
    timestamp = int(1000 * __import__('time').time())  # Current timestamp in milliseconds

    return {
        "name": "",
        "type": "weapon",
        "img": "systems/sr6elysium/dist/icons/importer/weapon/assault-rifles.svg",
        "system": {
            "description": {
                "value": "",
                "chat": "",
                "source": ""
            },
            "action": {
                "type": "complex",
                "test": "RangedAttackTest",
                "categories": [],
                "attribute": "agility",
                "attribute2": "",
                "skill": "firearms",
                "armor": False,
                "spec": False,
                "mod": None,
                "mod_description": "",
                "roll_mode": "publicroll",
                "limit": {
                    "value": 0,
                    "base": 0,
                    "attribute": ""
                },
                "threshold": {
                    "value": 0,
                    "base": 0
                },
                "extended": False,
                "damage": {
                    "type": {
                        "value": "",
                        "base": "physical"
                    },
                    "element": {
                        "value": "",
                        "base": ""
                    },
                    "value": 0,
                    "base": 0,
                    "ap": {
                        "value": 0,
                        "base": 0,
                        "base_formula_operator": "add",
                        "attribute": ""
                    },
                    "base_formula_operator": "add",
                    "attribute": "",
                    "source": {
                        "actorId": "",
                        "itemId": "",
                        "itemType": "",
                        "itemName": ""
                    }
                },
                "opposed": {
                    "type": "",
                    "test": "PhysicalDefenseTest",
                    "attribute": "",
                    "attribute2": "",
                    "skill": "",
                    "armor": False,
                    "mod": 0,
                    "description": "",
                    "resist": {
                        "test": "PhysicalResistTest",
                        "skill": "",
                        "attribute": "",
                        "attribute2": "",
                        "armor": False,
                        "mod": 0
                    }
                },
                "followed": {
                    "test": "",
                    "attribute": "",
                    "attribute2": "",
                    "skill": "",
                    "armor": False,
                    "mod": 0
                },
                "modifiers": []
            },
            "technology": {
                "rating": 1,
                "availability": "",
                "quantity": 1,
                "cost": 0,
                "equipped": False,
                "conceal": {
                    "base": 0,
                    "value": 0
                },
                "condition_monitor": {
                    "value": 0,
                    "max": 9
                },
                "wireless": True,
                "networkController": None
            },
            "category": "range",
            "subcategory": "",
            "ammo": {
                "spare_clips": {
                    "value": 0,
                    "max": 0
                },
                "current": {
                    "value": 0,
                    "max": 0
                },
                "clip_type": "",
                "partial_reload_value": -1
            },
            "range": {
                "category": "",
                "ranges": {
                    "short": 0,
                    "medium": 0,
                    "long": 0,
                    "extreme": 0,
                    "category": "",
                    "attribute": None
                },
                "rc": {
                    "value": 0,
                    "base": 0
                },
                "modes": {
                    "single_shot": False,
                    "semi_auto": False,
                    "burst_fire": False,
                    "full_auto": False
                }
            },
            "melee": {
                "reach": 0
            },
            "thrown": {
                "ranges": {
                    "short": 0,
                    "medium": 0,
                    "long": 0,
                    "extreme": 0,
                    "attribute": "",
                    "category": "manual"
                },
                "blast": {
                    "radius": 0,
                    "dropoff": 0
                }
            }
        },
        "effects": [],
        "folder": None,
        "sort": 0,
        "permission": {
            "default": 0
        },
        "flags": {},
        "_stats": {
            "coreVersion": "12.331",
            "systemId": "sr6elysium",
            "systemVersion": "0.0.13",
            "createdTime": timestamp,
            "modifiedTime": timestamp,
            "lastModifiedBy": "sr5ebuilder"
        },
        "_id": weapon_id,
        "_key": f"!items!{weapon_id}"
    }

def main():
    """Main function to extract weapons from PDF or create sample weapons"""

    # Check for PDF file
    pdf_path = r'C:\shadowrun\CAT28000S_SR6_Core_City_Edition_Seattle.pdf'
    if not os.path.exists(pdf_path):
        print(f"PDF file not found at: {pdf_path}")
        print("Please update the pdf_path variable to point to your SR6 Core PDF")
        return False

    if not PDF_AVAILABLE:
        print("pdfplumber is required to extract from PDF")
        print("Install with: pip install pdfplumber")
        return False

    output_dir = './packs/_source/weapons'
    os.makedirs(output_dir, exist_ok=True)

    # Mapping for modes
    mode_keys = ["single_shot", "semi_auto", "burst_fire", "full_auto"]

    weapons_created = 0

    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"PDF opened successfully. Total pages: {len(pdf.pages)}")
            for page_num in range(247, 252):  # Test smaller range first
                if page_num > len(pdf.pages):
                    print(f"Page {page_num} exceeds PDF length ({len(pdf.pages)})")
                    continue

                print(f"Processing page {page_num}...")
                page = pdf.pages[page_num - 1]
                table = page.extract_table()

                # Skip if no table found
                if not table or len(table) < 2:
                    print(f"  No valid table found on page {page_num}")
                    # Try to extract text to see what's on the page
                    text = page.extract_text()
                    if text and 'WEAPON' in text.upper():
                        print(f"  Page contains 'WEAPON' text but no extractable table")
                        print(f"  First 200 chars: {text[:200]}...")
                    continue

                print(f"  Found table with {len(table)} rows")

                headers = table[0]
                print(f"  Headers: {headers}")
                for row_idx, row in enumerate(table[1:]):
                    if len(row) < len(headers):
                        print(f"    Row {row_idx}: Skipped malformed row (length {len(row)} vs {len(headers)})")
                        continue  # skip malformed rows

                    entry = dict(zip(headers, row))
                    name = entry.get('WEAPON') or entry.get('Weapon')
                    print(f"    Row {row_idx}: Found weapon name: '{name}'")
                    if not name or name.strip() == '':
                        print(f"    Row {row_idx}: Skipped empty weapon name")
                        continue

                    # Start from the template
                    weapon_data = create_weapon_template()
                    weapon_data['name'] = name.strip()
                    weapon_data['system']['description']['source'] = f"SR6 Core p. {page_num}"

                    # Parse DV
                    dv_str = entry.get('DV', '')
                    if dv_str:
                        dv_match = re.match(r"(\d+)([PS])", dv_str)
                        if dv_match:
                            weapon_data['system']['action']['damage']['base'] = int(dv_match.group(1))
                            damage_type = 'physical' if dv_match.group(2) == 'P' else 'stun'
                            weapon_data['system']['action']['damage']['type']['base'] = damage_type

                    # Parse MODES
                    modes_str = entry.get('MODES', '')
                    if modes_str:
                        modes = modes_str.split('/')
                        for idx, key in enumerate(mode_keys):
                            weapon_data['system']['range']['modes'][key] = (idx < len(modes) and modes[idx] != '—')

                    # Parse attack ratings (ranges)
                    ratings_str = entry.get('ATTACK RATINGS', '')
                    if ratings_str:
                        ratings = ratings_str.split('/')
                        dist_keys = ['short', 'medium', 'long', 'extreme']
                        for idx, dk in enumerate(dist_keys):
                            if idx < len(ratings):
                                try:
                                    val = int(ratings[idx])
                                    weapon_data['system']['range']['ranges'][dk] = val
                                except (ValueError, TypeError):
                                    weapon_data['system']['range']['ranges'][dk] = 0

                    # Parse ammo
                    ammo_str = entry.get('AMMO', '').strip()
                    if ammo_str:
                        ammo_match = re.match(r"(\d+)", ammo_str)
                        if ammo_match:
                            ammo_capacity = int(ammo_match.group(1))
                            weapon_data['system']['ammo']['current']['max'] = ammo_capacity
                            weapon_data['system']['ammo']['current']['value'] = ammo_capacity

                        # Extract clip type
                        clip_type = re.sub(r"[\d()]", "", ammo_str).strip()
                        weapon_data['system']['ammo']['clip_type'] = clip_type

                    # Parse availability and cost
                    availability = entry.get('AVAILABILITY', '').strip()
                    weapon_data['system']['technology']['availability'] = availability

                    cost_str = entry.get('COST', '').replace('¥', '').strip()
                    try:
                        weapon_data['system']['technology']['cost'] = int(cost_str.replace(',', ''))
                    except (ValueError, TypeError):
                        weapon_data['system']['technology']['cost'] = 0

                    # Write output JSON
                    filename = f"{slugify(name)}.json"
                    out_path = os.path.join(output_dir, filename)

                    with open(out_path, 'w', encoding='utf-8') as out_file:
                        json.dump(weapon_data, out_file, indent=2, ensure_ascii=False)

                    print(f"Created: {filename}")
                    weapons_created += 1

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False

    print(f"\n✅ Successfully created {weapons_created} weapon files in {output_dir}")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
