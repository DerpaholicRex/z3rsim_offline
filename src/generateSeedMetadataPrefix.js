   // Function to strip :1 from names
function stripSuffix(name) {
    return name.replace(/:1$/, '');
}


// Function to generate seed metadata prefix string from spoiler log
function generateSeedMetadataPrefix(spoilerLog) {
    if (!spoilerLog || !spoilerLog.meta) {
        throw new Error('Invalid spoiler log: missing meta section');
    }

    const meta = spoilerLog.meta;

    const special = spoilerLog.Special;
    // Position mappings based on collectSeedMetadata function
    const positionMappings = {
        // Position 20: item_placement
        20: {
            'basic': '0',
            'advanced': '1'
        }[meta.item_placement] || '0',

        // Position 21: dungeon_items
        21: {
            'standard': '0',
            'mc': '1',
            'mcs': '2',
            'full': '3'
        }[meta.dungeon_items] || '0',

        // Position 22: accessibility
        22: {
            'items': '0',
            'locations': '1',
            'none': '2'
        }[meta.accessibility] || '0',

        // Position 23: goal
        23: {
            'ganon': '0',
            'dungeons': '1',
            'pedestal': '2',
            'triforce': '3',
            'fast_ganon': '4'
        }[meta.goal] || '0',

        // Position 24: entry_crystals_tower (direct value)
        24: meta.entry_crystals_tower || '0',

        // Position 25: entry_crystals_ganon (direct value)
        25: meta.entry_crystals_ganon || '0',

        // Position 26: mode
        26: {
            'standard': '0',
            'open': '1',
            'inverted': '2'
        }[meta.mode] || '0',

        // Position 27: enemizer (default to 'none' if not specified)
        27: {
            'none': '0',
            'simple': '1',
            'full': '2',
            'random': '3'
        }[meta.enemizer || 'none'],

        // Position 28: weapons
        28: {
            'randomized': '0',
            'assured': '1',
            'vanilla': '2',
            'swordless': '3'
        }[meta.weapons] || '0',

        // Position 29: mmMedallion (default to 'bombos')
        29: {
            'bombos': '0',
            'ether': '1',
            'quake': '2'
        }[stripSuffix(special["Misery Mire Medallion:1"]).toLocaleLowerCase() || 'bombos'],

        // Position 30: trMedallion (default to 'bombos')
        30: {
            'bombos': '0',
            'ether': '1',
            'quake': '2'
        }[stripSuffix(special["Turtle Rock Medallion:1"]).toLocaleLowerCase() || 'bombos']
    };

    // Build the prefix string (positions 0-39 for 40 total characters)
    let prefix = '';

    // Positions 0-19: seed (use placeholder since not in spoiler log)
    // You may want to extract this from somewhere else or use a known seed
    prefix += '000001xXJAo0A0ebe3WP'; // Using the example seed from your sample

    // Add the metadata positions (20-30)
    for (let i = 20; i <= 30; i++) {
        prefix += positionMappings[i];
    }

    // Add padding zeros for positions 31-39 to reach 40 characters total
    for (let i = 31; i <= 39; i++) {
        prefix += '0';
    }

    return prefix;
}

// Make function available globally if in browser environment
if (typeof window !== 'undefined') {
    window.generateSeedMetadataPrefix = generateSeedMetadataPrefix;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateSeedMetadataPrefix };
}
