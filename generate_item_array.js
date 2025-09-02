const fs = require('fs');

// Read the mapping files
const itemNameToFullItemMap = JSON.parse(fs.readFileSync('./src/hotfix/itemNameToFullItemMap.json', 'utf8'));
const spoilerToDetailedMap = JSON.parse(fs.readFileSync('./src/hotfix/spoilerToDetailedMap.json', 'utf8'));
const detailedMap = JSON.parse(fs.readFileSync('./src/hotfix/detailedMap.json', 'utf8'));

// Read the spoiler log
const spoilerLog = JSON.parse(fs.readFileSync('./src/hotfix/spoilerLog.json', 'utf8'));

// Initialize array with -1 for all positions (0-225 based on detailed map values)
const itemArray = new Array(226).fill(-1);

// Collect unmapped location warnings
const unmappedLocationWarnings = [];

// Function to strip :1 from names
function stripSuffix(name) {
    return name.replace(/:1$/, '');
}

// Process each section of the spoiler log
function processSection(sectionName, section) {
    for (const [locationName, itemName] of Object.entries(section)) {
        // Skip non-item entries (like boss fights, etc.)
        if (typeof itemName !== 'string' || !itemName.includes(':')) {
            continue;
        }

        // Strip :1 from location and item names
        const cleanLocationName = stripSuffix(locationName);
        const cleanItemName = stripSuffix(itemName);

        // Look up location in spoilerToDetailedMap
        const locationMapping = spoilerToDetailedMap[cleanLocationName];
        if (!locationMapping) {
            const warning = `Warning: Location "${cleanLocationName}" not found in mapping`;
            console.log(warning);
            unmappedLocationWarnings.push({
                type: 'location_not_found',
                locationName: cleanLocationName,
                originalLocationName: locationName,
                itemName: cleanItemName,
                section: sectionName,
                message: warning
            });
            continue;
        }

        const locationIndex = locationMapping.detailedMapValue;

        // Look up item in itemNameToFullItemMap
        const itemMapping = itemNameToFullItemMap[cleanItemName];
        if (!itemMapping) {
            console.log(`Warning: Item "${cleanItemName}" not found in mapping`);
            continue;
        }

        const itemId = itemMapping.id;

        // Place item ID at the correct location index (formatted as 3-digit number with leading zeros)
        if (locationIndex >= 0 && locationIndex < itemArray.length) {
            itemArray[locationIndex] = itemId.toString().padStart(3, '0');
        } else {
            console.log(`Warning: Invalid location index ${locationIndex} for location "${cleanLocationName}"`);
        }
    }
}

// Process each major section of the spoiler log
for (const [sectionName, section] of Object.entries(spoilerLog)) {
    if (sectionName === 'meta' || sectionName === 'Bosses' || sectionName === 'playthrough') {
        continue; // Skip metadata sections
    }

    if (sectionName === 'Shops') {
        // Handle shops differently if needed
        continue;
    }

    if (sectionName === 'Equipped') {
        // Skip equipped items
        continue;
    }

    if (typeof section === 'object' && section !== null) {
        processSection(sectionName, section);
    }
}

// Create reverse mapping from detailed map for lookup
const detailedMapReverse = {};
for (const [locationName, index] of Object.entries(detailedMap)) {
    detailedMapReverse[index] = locationName;
}

// Find all indices that are still -1 (unmapped locations)
const unmappedIndices = [];
const unmappedLocations = [];

itemArray.forEach((itemId, index) => {
    if (itemId === -1) {
        unmappedIndices.push(index);

        // Look up the detailed map name
        const detailedMapName = detailedMapReverse[index] || 'Unknown';

        unmappedLocations.push({
            index: index,
            detailedMapName: detailedMapName,
            note: 'No item placed at this location in spoiler log'
        });
    }
});

// Write unmapped locations to a separate file
fs.writeFileSync('./src/hotfix/unmapped_item_locations.json', JSON.stringify({
    summary: {
        totalIndices: itemArray.length,
        unmappedCount: unmappedIndices.length,
        mappedCount: itemArray.filter(id => id !== -1).length
    },
    unmappedLocations: unmappedLocations
}, null, 2));

// Write unmapped location warnings to a persistent file
fs.writeFileSync('./src/hotfix/unmapped_location_warnings.json', JSON.stringify({
    summary: {
        totalWarnings: unmappedLocationWarnings.length,
        timestamp: new Date().toISOString()
    },
    warnings: unmappedLocationWarnings
}, null, 2));

// Write the result to a JSON file
fs.writeFileSync('./src/hotfix/itemArray.json', JSON.stringify(itemArray, null, 2));

// Also write as a JavaScript module for easy importing
const jsContent = `// Item array where index corresponds to detailedMapValue and value is item ID
// -1 indicates no item found at that location
const itemArray = ${JSON.stringify(itemArray, null, 2)};

module.exports = itemArray;
`;

fs.writeFileSync('./src/hotfix/itemArray.js', jsContent);

console.log('Item array generated successfully!');
console.log(`Array length: ${itemArray.length}`);
console.log(`Items placed: ${itemArray.filter(id => id !== -1).length}`);
console.log(`Empty slots (-1): ${itemArray.filter(id => id === -1).length}`);

if (unmappedLocations.length > 0) {
    console.log('\n🔍 Unmapped Locations (indices with -1):');
    unmappedLocations.forEach(loc => {
        console.log(`  Index ${loc.index}: ${loc.locationName} (${loc.detailedMapName})`);
    });

    console.log(`\n📄 Unmapped locations saved to: ./src/hotfix/unmapped_item_locations.json`);
}

if (unmappedLocationWarnings.length > 0) {
    console.log('\n⚠️  Unmapped Location Warnings:');
    unmappedLocationWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. [${warning.section}] ${warning.message}`);
        console.log(`   Item: ${warning.itemName}`);
    });

    console.log(`\n📄 Warnings saved to: ./src/hotfix/unmapped_location_warnings.json`);
}

console.log('\nOutput files:');
console.log('  - ./src/hotfix/itemArray.json');
console.log('  - ./src/hotfix/itemArray.js');
console.log('  - ./src/hotfix/unmapped_item_locations.json');
console.log('  - ./src/hotfix/unmapped_location_warnings.json');
