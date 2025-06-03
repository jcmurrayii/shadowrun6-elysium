/**
 * XML to Compendium Importer Script
 *
 * This script imports XML data from the data directory into JSON files for Foundry VTT compendiums.
 * It reads XML files and their corresponding .properties files to create properly formatted
 * JSON files that can be packed into compendiums using the packs.mjs script.
 *
 * Usage:
 * node utils/xml-to-compendium.mjs --source=data/gear_armor1_accessories_SEATTLE.xml --pack=armor-accessories
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
    description: 'Source XML file path (relative to project root)',
    type: 'string',
    demandOption: true
  })
  .option('pack', {
    alias: 'p',
    description: 'Target compendium pack name',
    type: 'string',
    demandOption: true
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
    'equipment': 'systems/sr6elysium/dist/icons/redist/gear.svg'
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
      rating: 0,
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
    // This would need to be expanded based on your weapon data structure
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
 * Main function to run the importer
 */
async function main() {
  try {
    // Get the source file path and target pack name
    const sourceFilePath = path.resolve(rootDir, argv.source);
    const packName = argv.pack;

    console.log(`Importing from ${sourceFilePath} to pack ${packName}...`);

    // Check if the source file exists
    if (!fs.existsSync(sourceFilePath)) {
      console.error(`Source file not found: ${sourceFilePath}`);
      process.exit(1);
    }

    // Get the properties file path
    const propertiesFilePath = sourceFilePath.replace('.xml', '.properties');

    // Read and parse the XML and properties files
    const xmlData = await readXmlFile(sourceFilePath);
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
      console.log(`Created item: ${item.name} (${itemFilePath})`);
    }

    console.log(`Import complete! ${itemArray.length} items imported to ${targetDir}`);
    console.log(`\nTo pack the compendium, run: node ./utils/packs.mjs package pack ${packName}`);

  } catch (error) {
    console.error(`Error during import: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
