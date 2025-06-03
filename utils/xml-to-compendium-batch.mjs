/**
 * XML to Compendium Batch Importer Script
 *
 * This script imports all XML data from the data directory into JSON files for Foundry VTT compendiums.
 * It reads XML files and their corresponding .properties files to create properly formatted
 * JSON files that can be packed into compendiums using the packs.mjs script.
 *
 * Usage:
 * node utils/xml-to-compendium-batch.mjs --source=data --packPrefix=sr6e
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xml2js from 'xml2js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Define constants
const PACK_SRC = path.join(rootDir, 'packs/_source');
const DATA_DIR = path.join(rootDir, 'data');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('source', {
    alias: 's',
    description: 'Source directory containing XML files (relative to project root)',
    type: 'string',
    default: 'data'
  })
  .option('packPrefix', {
    alias: 'p',
    description: 'Prefix for compendium pack names',
    type: 'string',
    default: 'sr6e'
  })
  .option('updateSystem', {
    alias: 'u',
    description: 'Update system.json with new compendium packs',
    type: 'boolean',
    default: true
  })
  .help()
  .alias('help', 'h')
  .argv;

/**
 * Reads and parses an XML file
 * @param {string} filePath - Path to the XML file
 * @returns {Promise<object>} - Parsed XML as a JavaScript object
 */
async function readXmlFile(filePath) {
  try {
    const xmlData = fs.readFileSync(filePath, 'utf8');
    const parser = new xml2js.Parser({
      explicitArray: false,
      explicitCharkey: true,
      charkey: '_TEXT'
    });

    return await parser.parseStringPromise(xmlData);
  } catch (error) {
    console.error(`Error reading or parsing XML file: ${error.message}`);
    throw error;
  }
}

/**
 * Reads and parses a properties file
 * @param {string} filePath - Path to the properties file
 * @returns {object} - Parsed properties as a JavaScript object
 */
function readPropertiesFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Properties file not found: ${filePath}`);
      return {};
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const properties = {};

    data.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const separatorIndex = line.indexOf('=');
        if (separatorIndex > 0) {
          const key = line.substring(0, separatorIndex).trim();
          const value = line.substring(separatorIndex + 1).trim();
          properties[key] = value;
        }
      }
    });

    return properties;
  } catch (error) {
    console.error(`Error reading properties file: ${error.message}`);
    throw error;
  }
}

/**
 * Converts an XML item to a Foundry VTT compendium item
 * @param {object} xmlItem - The XML item object
 * @param {object} properties - The properties object
 * @returns {object} - A Foundry VTT compendium item
 */
function convertToCompendiumItem(xmlItem, properties) {
  const itemId = xmlItem.$.id;
  const itemName = properties[`item.${itemId}`] || itemId;
  const itemPage = properties[`item.${itemId}.page`] || '';

  // Generate a UUID for the item
  const uuid = generateUUID();

  // Create a basic item structure based on the XML data
  const item = {
    _id: uuid,
    name: itemName,
    type: determineItemType(xmlItem),
    img: determineItemIcon(xmlItem),
    effects: [],
    folder: null,
    sort: 0,
    flags: {},
    system: {
      description: {
        value: `<p>Page: ${itemPage}</p>`,
        chat: '',
        source: ''
      },
      // Add other system properties based on the XML data
      ...buildSystemData(xmlItem)
    },
    ownership: {
      default: 0
    },
    _stats: {
      systemId: 'sr6elysium',
      systemVersion: '0.23.2',
      coreVersion: '11',
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: 'xml-importer'
    },
    // Add the _key field which is required by Foundry VTT packing process
    _key: `!items!${uuid}`
  };

  return item;
}

/**
 * Determines the item type based on the XML data
 * @param {object} xmlItem - The XML item object
 * @returns {string} - The item type
 */
function determineItemType(xmlItem) {
  // Default to 'equipment' if we can't determine a more specific type
  let type = 'equipment';

  if (xmlItem.useas) {
    const useAs = xmlItem.useas.$;

    if (useAs.type === 'ACCESSORY' && useAs.subtype === 'ARMOR_BODY') {
      type = 'armor';
    } else if (useAs.type === 'WEAPON') {
      type = 'weapon';
    } else if (useAs.type === 'AMMO') {
      type = 'ammo';
    } else if (useAs.type === 'PROGRAM') {
      type = 'program';
    } else if (useAs.type === 'CYBERWARE') {
      type = 'cyberware';
    } else if (useAs.type === 'BIOWARE') {
      type = 'bioware';
    }
    // Add more type determinations as needed
  }

  return type;
}

/**
 * Determines the item icon based on the item type and other properties
 * @param {object} xmlItem - The XML item object
 * @returns {string} - Path to the icon
 */
function determineItemIcon(xmlItem) {
  const type = determineItemType(xmlItem);

  // Default icons based on item type
  const iconMap = {
    'armor': 'systems/sr6elysium/dist/icons/redist/armor.svg',
    'weapon': 'systems/sr6elysium/dist/icons/redist/weapon.svg',
    'equipment': 'systems/sr6elysium/dist/icons/redist/gear.svg',
    'ammo': 'systems/sr6elysium/dist/icons/redist/ammo.svg',
    'program': 'systems/sr6elysium/dist/icons/redist/program.svg',
    'cyberware': 'systems/sr6elysium/dist/icons/redist/cyberware.svg',
    'bioware': 'systems/sr6elysium/dist/icons/redist/bioware.svg'
  };

  return iconMap[type] || iconMap.equipment;
}

/**
 * Builds the system data object based on the XML item
 * @param {object} xmlItem - The XML item object
 * @returns {object} - The system data object
 */
function buildSystemData(xmlItem) {
  const $ = xmlItem.$;
  const type = determineItemType(xmlItem);

  // Base system data
  const systemData = {
    technology: {
      rating: parseInt($.rating) || 0,
      availability: {
        value: parseInt($.avail) || 0,
        mod: ''
      },
      cost: parseInt($.cost) || 0
    },
    importFlags: {
      name: $.id,
      type: type,
      subType: '',
      isFreshImport: true
    }
  };

  // Add type-specific data
  if (type === 'armor') {
    systemData.armor = {
      value: parseInt($.armor) || 0,
      base: parseInt($.armor) || 0,
      mod: 0
    };

    if (xmlItem.useas) {
      const useAs = xmlItem.useas.$;
      systemData.type = useAs.subtype.toLowerCase();
      systemData.slot = useAs.slot.toLowerCase();
      systemData.capacity = parseInt(useAs.cap) || 0;
    }
  } else if (type === 'weapon') {
    // Add weapon-specific data
    systemData.action = {
      type: 'simple',
      attribute: 'agility',
      skill: 'firearms',
      limit: {
        value: 0,
        attribute: ''
      }
    };

    systemData.range = {
      category: 'standard',
      ranges: {
        short: { value: 0 },
        medium: { value: 0 },
        long: { value: 0 },
        extreme: { value: 0 }
      }
    };

    systemData.damage = {
      type: { value: 'physical' },
      element: { value: '' },
      value: parseInt($.damage) || 0,
      ap: { value: parseInt($.ap) || 0 }
    };
  }

  return systemData;
}

/**
 * Generates a UUID for the item
 * @returns {string} - A UUID
 */
function generateUUID() {
  return 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return r.toString(16);
  });
}

/**
 * Ensures the target directory exists
 * @param {string} dirPath - Path to the directory
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Determines a compendium pack name from an XML file name
 * @param {string} fileName - The XML file name
 * @param {string} prefix - Prefix for the pack name
 * @returns {string} - A compendium pack name
 */
function determinePackName(fileName, prefix) {
  // Remove file extension
  let baseName = path.basename(fileName, '.xml');

  // Extract the main category from the file name
  // Example: gear_armor1_accessories_SEATTLE.xml -> armor-accessories
  const parts = baseName.split('_');

  let category = '';
  if (parts.length >= 2) {
    // Use the first part as the main category
    category = parts[0];

    // If there's a subcategory, add it
    if (parts.length >= 3) {
      // Check if the second part contains a number (like armor1)
      if (/\d+$/.test(parts[1])) {
        // Remove the number from the second part
        const mainType = parts[1].replace(/\d+$/, '');
        category = `${mainType}-${parts[2]}`;
      } else {
        category = `${parts[1]}-${parts[2]}`;
      }
    }
  } else {
    // If the file name doesn't follow the expected pattern, use it as is
    category = baseName;
  }

  // Clean up the category name
  category = category.toLowerCase().replace(/[^a-z0-9-]/g, '-');

  // Add the prefix
  return `${prefix}-${category}`;
}

/**
 * Updates the system.json file with new compendium packs
 * @param {string[]} packNames - Array of pack names to add
 */
function updateSystemJson(packNames) {
  try {
    const systemJsonPath = path.join(rootDir, 'system.json');
    const systemJson = JSON.parse(fs.readFileSync(systemJsonPath, 'utf8'));

    // Get existing pack names
    const existingPackNames = systemJson.packs.map(pack => pack.name);

    // Add new packs
    let packsAdded = 0;
    for (const packName of packNames) {
      if (!existingPackNames.includes(packName)) {
        // Create a label from the pack name
        const packLabel = packName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        systemJson.packs.push({
          name: packName,
          label: packLabel,
          path: `packs/${packName}`,
          ownership: {
            PLAYER: "OBSERVER",
            TRUSTED: "OBSERVER",
            ASSISTANT: "OWNER"
          },
          type: "Item",
          system: "sr6elysium"
        });

        packsAdded++;
      }
    }

    // Save the updated system.json
    fs.writeFileSync(systemJsonPath, JSON.stringify(systemJson, null, 4));

    console.log(`Updated system.json with ${packsAdded} new compendium packs.`);
  } catch (error) {
    console.error(`Error updating system.json: ${error.message}`);
  }
}

/**
 * Process a single XML file
 * @param {string} xmlFilePath - Path to the XML file
 * @param {string} packPrefix - Prefix for the pack name
 * @returns {string} - The pack name
 */
async function processXmlFile(xmlFilePath, packPrefix) {
  try {
    const fileName = path.basename(xmlFilePath);
    const packName = determinePackName(fileName, packPrefix);

    console.log(`Processing ${fileName} into pack ${packName}...`);

    // Get the properties file path
    const propertiesFilePath = xmlFilePath.replace('.xml', '.properties');

    // Read and parse the XML and properties files
    const xmlData = await readXmlFile(xmlFilePath);
    const properties = readPropertiesFile(propertiesFilePath);

    // Ensure the target directory exists
    const targetDir = path.join(PACK_SRC, packName);
    ensureDirectoryExists(targetDir);

    // Process each item in the XML file
    const items = xmlData.items.item;
    const itemArray = Array.isArray(items) ? items : [items];

    for (const xmlItem of itemArray) {
      const item = convertToCompendiumItem(xmlItem, properties);
      const itemFileName = `${item.system.importFlags.name}.json`;
      const itemFilePath = path.join(targetDir, itemFileName);

      // Write the item to a JSON file
      fs.writeFileSync(itemFilePath, JSON.stringify(item, null, 2));
      console.log(`  Created item: ${item.name}`);
    }

    console.log(`Imported ${itemArray.length} items from ${fileName} to ${packName}`);

    return packName;
  } catch (error) {
    console.error(`Error processing ${xmlFilePath}: ${error.message}`);
    return null;
  }
}

/**
 * Main function to run the batch importer
 */
async function main() {
  try {
    // Get the source directory path and pack prefix
    const sourceDir = path.resolve(rootDir, argv.source);
    const packPrefix = argv.packPrefix;

    console.log(`Importing from ${sourceDir} with pack prefix ${packPrefix}...`);

    // Check if the source directory exists
    if (!fs.existsSync(sourceDir)) {
      console.error(`Source directory not found: ${sourceDir}`);
      process.exit(1);
    }

    // Get all XML files in the source directory
    const files = fs.readdirSync(sourceDir)
      .filter(file => file.endsWith('.xml'))
      .map(file => path.join(sourceDir, file));

    console.log(`Found ${files.length} XML files to process.`);

    // Process each XML file
    const packNames = [];
    for (const file of files) {
      const packName = await processXmlFile(file, packPrefix);
      if (packName) {
        packNames.push(packName);
      }
    }

    // Update system.json if requested
    if (argv.updateSystem && packNames.length > 0) {
      updateSystemJson(packNames);
    }

    console.log(`\nImport complete! ${files.length} files processed into ${packNames.length} compendium packs.`);
    console.log(`\nTo pack the compendiums, run: node ./utils/packs.mjs package pack`);

  } catch (error) {
    console.error(`Error during import: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
