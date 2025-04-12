# XML to Compendium Importer

This utility provides scripts to import XML data from the `data` directory into JSON files for Foundry VTT compendiums. It reads XML files and their corresponding `.properties` files to create properly formatted JSON files that can be packed into compendiums using the `packs.mjs` script.

## Prerequisites

Make sure you have the required dependencies installed:

```bash
npm install xml2js yargs
```

## Single File Importer

### Basic Usage

```bash
node utils/xml-to-compendium.mjs --source=data/gear_armor1_accessories_SEATTLE.xml --pack=armor-accessories
```

### Parameters

- `--source` or `-s`: Source XML file path (relative to project root)
- `--pack` or `-p`: Target compendium pack name
- `--help` or `-h`: Show help

### Example Workflow

1. Import XML data to JSON files:

```bash
node utils/xml-to-compendium.mjs --source=data/gear_armor1_accessories_SEATTLE.xml --pack=armor-accessories
```

2. Pack the JSON files into a compendium:

```bash
node ./utils/packs.mjs package pack armor-accessories
```

3. Update your `system.json` file to include the new compendium:

```json
"packs": [
    {
        "name": "armor-accessories",
        "label": "SR6e Armor Accessories",
        "path": "packs/armor-accessories",
        "ownership": {
            "PLAYER": "OBSERVER",
            "TRUSTED": "OBSERVER",
            "ASSISTANT": "OWNER"
        },
        "type": "Item",
        "system": "shadowrun6-elysium"
    },
    // ... other packs
]
```

## Batch Importer

The batch importer processes all XML files in a directory and creates compendium packs for each file.

### Basic Usage

```bash
node utils/xml-to-compendium-batch.mjs --source=data --packPrefix=sr6e
```

### Parameters

- `--source` or `-s`: Source directory containing XML files (relative to project root, defaults to 'data')
- `--packPrefix` or `-p`: Prefix for compendium pack names (defaults to 'sr6e')
- `--updateSystem` or `-u`: Update system.json with new compendium packs (defaults to true)
- `--help` or `-h`: Show help

### Example Workflow

1. Import all XML data to JSON files:

```bash
node utils/xml-to-compendium-batch.mjs
```

2. Pack all the JSON files into compendiums:

```bash
node ./utils/packs.mjs package pack
```

The batch importer will automatically:
- Process all XML files in the specified directory
- Create appropriate compendium pack names based on file names
- Generate JSON files for each item in the XML files
- Update the system.json file with the new compendium packs (if --updateSystem is true)

## Customization

The script includes several functions that determine how XML data is converted to Foundry VTT item data:

- `determineItemType`: Determines the item type based on the XML data
- `determineItemIcon`: Determines the item icon based on the item type
- `buildSystemData`: Builds the system data object based on the XML item

You can modify these functions to customize how your XML data is imported.

## Extending for Different XML Formats

If you have different XML formats, you may need to modify the script to handle them appropriately. The key functions to modify would be:

- `readXmlFile`: For parsing the XML file
- `convertToCompendiumItem`: For converting XML items to Foundry VTT items
- `buildSystemData`: For building the system-specific data

## Troubleshooting

- Make sure your XML file and properties file are in the correct format
- Check that the target compendium directory exists in `packs/_source`
- Verify that you have the necessary permissions to read/write to the directories
