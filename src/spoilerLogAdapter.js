// Browser usage example with localStorage support for spoiler log
// Include this script after generateItemArray.js in your HTML

// Main function to load data and generate item array
async function loadAndGenerateItemArray() {
    try {
        console.log('Loading data files...');

        // Load spoiler log from localStorage (if available) or fallback to fetch
        let spoilerLog;
        const storedSpoilerLog = localStorage.getItem('z3r_spoiler_log');

        if (storedSpoilerLog) {
            console.log('📱 Loading spoiler log from localStorage...');
            spoilerLog = JSON.parse(storedSpoilerLog);
        } else {
            console.log('🌐 Fetching spoiler log from server...');
            spoilerLog = await fetch('./hotfix/spoilerLog.json').then(r => r.json());
        }

        // Load other required JSON files using fetch
        const [itemNameToFullItemMap, spoilerToDetailedMap, detailedMap] = await Promise.all([
            fetch('./hotfix/itemNameToFullItemMap.json').then(r => r.json()),
            fetch('./hotfix/spoilerToDetailedMap.json').then(r => r.json()),
            fetch('./hotfix/detailedMap.json').then(r => r.json())
        ]);

        console.log('Data loaded successfully. Generating from spoiler log...');

        // Generate seed metadata prefix from spoiler log
        console.log('🔧 Generating seed metadata prefix...');
        const seedMetadataPrefix = window.generateSeedMetadataPrefix(spoilerLog);
        localStorage.setItem('seedMetadataPrefix', seedMetadataPrefix);
        console.log('💾 Seed metadata prefix stored in localStorage:', seedMetadataPrefix);

        // Generate the item array using the global function
        const itemArray = window.generateItemArray(
            spoilerLog,
            itemNameToFullItemMap,
            spoilerToDetailedMap,
            detailedMap
        );

        console.log('✅ Item array generated successfully!');
        console.log('📊 Array length:', itemArray.length);
        console.log('📍 Items placed:', itemArray.filter(id => id !== -1).length);
        console.log('🗂️  Empty slots:', itemArray.filter(id => id === -1).length);

        // Example usage
        console.log('🎯 Sample items:');
        console.log('   Location 0:', itemArray[0]); // e.g., "019"
        console.log('   Location 9:', itemArray[9]);  // e.g., "153"
        console.log('   Location 153:', itemArray[153]); // e.g., "008"

        // Find all locations with Progressive Sword
        const locationsWithProgressiveSword = itemArray
            .map((itemId, index) => ({ itemId, index }))
            .filter(({ itemId }) => itemId === '153')
            .map(({ index }) => index);

        console.log('⚔️  Progressive Sword locations:', locationsWithProgressiveSword);

        // Get item distribution
        const itemCounts = {};
        itemArray.forEach(itemId => {
            if (itemId !== -1) {
                itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
            }
        });

        console.log('📈 Item distribution (top 10):',
            Object.entries(itemCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([id, count]) => `${id}: ${count}`)
        );

        return itemArray;

    } catch (error) {
        console.error('❌ Error loading data or generating array:', error);
        throw error;
    }
}

// Function to save spoiler log to localStorage
function saveSpoilerLogToLocalStorage(spoilerLogData) {
    // debugger;
    try {
        localStorage.setItem('z3r_spoiler_log', JSON.stringify(spoilerLogData));
        console.log('💾 Spoiler log saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// Function to load spoiler log from file and save to localStorage
async function loadSpoilerLogFromFileAndSave() {
    try {
        const spoilerLog = await fetch('./hotfix/spoilerLog.json').then(r => r.json());
        saveSpoilerLogToLocalStorage(spoilerLog);
        console.log('📁 Spoiler log loaded from file and saved to localStorage');
        return spoilerLog;
    } catch (error) {
        console.error('❌ Error loading spoiler log from file:', error);
        throw error;
    }
}

// Function to check if spoiler log exists in localStorage
function hasSpoilerLogInLocalStorage() {
    return localStorage.getItem('z3r_spoiler_log') !== null;
}

// Function to clear spoiler log from localStorage
function clearSpoilerLogFromLocalStorage() {
    localStorage.removeItem('z3r_spoiler_log');
    console.log('🗑️  Spoiler log cleared from localStorage');
}

// Helper function to get item name from ID
function getItemNameFromId(itemId, itemMap) {
    const item = Object.values(itemMap).find(item => item.id.toString() === itemId);
    return item ? item.longName : 'Unknown Item';
}

// Helper function to get location name from index
function getLocationNameFromIndex(index, detailedMap, spoilerToDetailedMap) {
    // Find the location name that maps to this index
    const locationName = Object.keys(spoilerToDetailedMap).find(
        key => spoilerToDetailedMap[key].detailedMapValue === index
    );
    return locationName || `Unknown Location ${index}`;
}

// Example: Get detailed info about a specific location
function getLocationDetails(locationIndex, itemArray, itemMap, detailedMap, spoilerToDetailedMap) {
    const itemId = itemArray[locationIndex];
    const locationName = getLocationNameFromIndex(locationIndex, detailedMap, spoilerToDetailedMap);
    const itemName = getItemNameFromId(itemId, itemMap);

    return {
        index: locationIndex,
        locationName: locationName,
        itemId: itemId,
        itemName: itemName
    };
}

// Make functions available globally
window.loadAndGenerateItemArray = loadAndGenerateItemArray;
window.saveSpoilerLogToLocalStorage = saveSpoilerLogToLocalStorage;
window.loadSpoilerLogFromFileAndSave = loadSpoilerLogFromFileAndSave;
window.hasSpoilerLogInLocalStorage = hasSpoilerLogInLocalStorage;
window.clearSpoilerLogFromLocalStorage = clearSpoilerLogFromLocalStorage;
window.getItemNameFromId = getItemNameFromId;
window.getLocationNameFromIndex = getLocationNameFromIndex;
window.getLocationDetails = getLocationDetails;

// Usage example:
/*
// Check if we have a spoiler log in localStorage
if (hasSpoilerLogInLocalStorage()) {
    console.log('Using spoiler log from localStorage');
    const itemArray = await loadAndGenerateItemArray();
} else {
    console.log('Loading spoiler log from file and saving to localStorage');
    await loadSpoilerLogFromFileAndSave();
    const itemArray = await loadAndGenerateItemArray();
}

// Use the item array
console.log('Item at location 0:', itemArray[0]);
console.log('Item at location 9:', itemArray[9]);
*/
