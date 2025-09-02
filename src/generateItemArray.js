// In-memory item array generator for Z3R Simulator
// This function processes the spoiler log and returns an item array without writing files

function generateItemArray(spoilerLogData, itemNameToFullItemMapData, spoilerToDetailedMapData, detailedMapData) {
    // Parse JSON data if strings are passed
    const itemNameToFullItemMap = typeof itemNameToFullItemMapData === 'string'
        ? JSON.parse(itemNameToFullItemMapData)
        : itemNameToFullItemMapData;

    const spoilerToDetailedMap = typeof spoilerToDetailedMapData === 'string'
        ? JSON.parse(spoilerToDetailedMapData)
        : spoilerToDetailedMapData;

    const detailedMap = typeof detailedMapData === 'string'
        ? JSON.parse(detailedMapData)
        : detailedMapData;

    const spoilerLog = typeof spoilerLogData === 'string'
        ? JSON.parse(spoilerLogData)
        : spoilerLogData;

    // Initialize array with -1 for all positions (0-225 based on detailed map values)
    const itemArray = new Array(226).fill("000");

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
                // Skip unmapped locations silently for in-memory version
                continue;
            }

            const locationIndex = locationMapping.detailedMapValue;

            // Look up item in itemNameToFullItemMap
            const itemMapping = itemNameToFullItemMap[cleanItemName];
            if (!itemMapping) {
                // Skip unmapped items silently for in-memory version
                continue;
            }

            const itemId = itemMapping.id;

            // Place item ID at the correct location index (formatted as 3-digit number with leading zeros)
            if (locationIndex >= 0 && locationIndex < itemArray.length) {
                let itemStr = itemId?.toString();
                if(itemId == -1 || !itemId){
                    itemStr = "000"
                }
                itemArray[locationIndex] = itemStr.padStart(3, '0');
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

    return itemArray;
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = generateItemArray;
}

// Also make it available globally for browser environments
if (typeof window !== 'undefined') {
    window.generateItemArray = generateItemArray;
}
