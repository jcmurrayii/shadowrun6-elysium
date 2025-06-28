import pdfplumber
import json
import re
import os

# Load template JSON
with open('./template.json', 'r') as f:
    template = json.load(f)

# Utility to slugify names for filenames
def slugify(name):
    name = name.lower()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"\s+", "-", name.strip())
    return name

# Mapping for modes
mode_keys = ["single_shot", "semi_auto", "burst_fire", "full_auto"]

# Open the PDF and iterate over gear pages
pdf_path = '/shadowrun/CAT28000S_SR6_Core_City_Edition_Seattle.pdf'
output_dir = './packs/_source/weapons'
os.makedirs(output_dir, exist_ok=True)

with pdfplumber.open(pdf_path) as pdf:
    for page_num in range(247, 260):  # pages 247 to 258 inclusive
        page = pdf.pages[page_num - 1]
        table = page.extract_table()

        # Skip if no table found
        if not table or len(table) < 2:
            continue

        headers = table[0]
        for row in table[1:]:
            if len(row) < len(headers):
                continue  # skip malformed rows

            entry = dict(zip(headers, row))
            name = entry.get('WEAPON') or entry.get('Weapon')
            if not name:
                continue

            # Start from the template
            weapon_data = json.loads(json.dumps(template))
            weapon_data['name'] = name
            weapon_data['system']['description']['source'] = f"SR6 Core p. {page_num}"

            # Parse DV
            dv_match = re.match(r"(\d+)([PS])", entry['DV'])
            if dv_match:
                weapon_data['system']['action']['damage']['base'] = int(dv_match.group(1))
                weapon_data['system']['action']['damage']['type']['base'] = 'physical' if dv_match.group(2) == 'P' else 'stun'

            # Parse MODES
            modes = entry['MODES'].split('/')
            for idx, key in enumerate(mode_keys):
                weapon_data['system']['range']['modes'][key] = (idx < len(modes) and modes[idx] != '—')

            # Parse attack ratings
            ratings = entry['ATTACK RATINGS'].split('/')
            dist_keys = ['short', 'medium', 'long', 'extreme']
            for idx, dk in enumerate(dist_keys):
                try:
                    val = int(ratings[idx])
                except:
                    val = 0
                weapon_data['system']['range']['attackRating'][dk] = val

            # Parse ammo
            ammo_str = entry.get('AMMO', '').strip()
            ammo_match = re.match(r"(\d+)", ammo_str)
            weapon_data['system']['ammo']['current']['max'] = int(ammo_match.group(1)) if ammo_match else 0
            weapon_data['system']['ammo']['clip_type'] = re.sub(r"[\d()]", "", ammo_str) or ''

            # Parse availability and cost
            weapon_data['system']['technology']['availability'] = entry.get('AVAILABILITY', '').strip()
            cost_str = entry.get('COST', '').replace('¥', '').strip()
            try:
                weapon_data['system']['technology']['cost'] = int(cost_str)
            except:
                weapon_data['system']['technology']['cost'] = 0

            # Write output JSON
            filename = f"{slugify(name)}.json"
            out_path = os.path.join(output_dir, filename)
            with open(out_path, 'w') as out_file:
                json.dump(weapon_data, out_file, indent=2)

print(f"Extracted JSON files written to {output_dir}")
