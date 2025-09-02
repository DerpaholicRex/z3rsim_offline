const fs = require('fs');

// Read the item name to full item map
const itemNameToFullItemMap = JSON.parse(fs.readFileSync('./src/hotfix/itemNameToFullItemMap.json', 'utf8'));

// Convert to array for sorting
const itemsArray = Object.entries(itemNameToFullItemMap).map(([itemName, itemData]) => ({
    itemName,
    ...itemData
}));

// Sort by id ascending
itemsArray.sort((a, b) => a.id - b.id);

// Convert back to object
const sortedItemMap = {};
itemsArray.forEach(item => {
    const { itemName, ...itemData } = item;
    sortedItemMap[itemName] = itemData;
});

// Write the sorted map back to the file
fs.writeFileSync('./src/hotfix/itemNameToFullItemMap.json', JSON.stringify(sortedItemMap, null, 2));

console.log('Item map sorted by id (ascending)');
console.log(`Total items: ${Object.keys(sortedItemMap).length}`);
console.log('First few items:');
const firstFew = Object.entries(sortedItemMap).slice(0, 5);
firstFew.forEach(([name, data]) => {
    console.log(`  ${data.id}: ${name}`);
});
console.log('Last few items:');
const lastFew = Object.entries(sortedItemMap).slice(-5);
lastFew.forEach(([name, data]) => {
    console.log(`  ${data.id}: ${name}`);
});
