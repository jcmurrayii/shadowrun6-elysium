// Node.js script to update adept power icon paths
const fs = require('fs');
const path = require('path');

console.log("Updating adept power icon paths...");

const adeptDir = "packs/_source/adept_powers";
const adeptFiles = fs.readdirSync(adeptDir).filter(file => file.endsWith('.json'));

let updatedCount = 0;

adeptFiles.forEach(file => {
    try {
        const filePath = path.join(adeptDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const adeptData = JSON.parse(content);
        
        // Update the icon path to use the importer critter_power mana.svg
        if (adeptData.img === "systems/sr6elysium/dist/icons/adept_power.svg" ||
            adeptData.img === "systems/sr6elysium/dist/icons/mana.svg") {
            adeptData.img = "systems/sr6elysium/dist/icons/importer/critter_power/mana.svg";
            
            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(adeptData, null, 2), 'utf8');
            
            console.log(`✓ Updated icon for: ${adeptData.name}`);
            updatedCount++;
        }
        
    } catch (error) {
        console.log(`✗ Error processing ${file}: ${error.message}`);
    }
});

console.log(`\n✅ Updated ${updatedCount} adept power icons to use mana.svg`);
console.log("Adept powers now use: systems/sr6elysium/dist/icons/importer/critter_power/mana.svg");
