/**
 * Recepten Vinder - Configuration
 * 
 * BELANGRIJK: Voor de online zoekfunctie heb je een Anthropic API key nodig.
 * 
 * OPTIE 1: Gebruik zonder API (alleen lokale bibliotheek)
 * - Laat ANTHROPIC_API_KEY leeg
 * - Je kunt nog steeds recepten handmatig toevoegen aan je bibliotheek
 * 
 * OPTIE 2: Met Anthropic API (online zoeken + AI)
 * - Maak een account op https://console.anthropic.com
 * - Genereer een API key
 * - Vul deze hieronder in
 * 
 * LET OP: Zet nooit je API key in een publieke repository!
 * Gebruik environment variables of een backend proxy voor productie.
 */

const CONFIG = {
    // Anthropic API configuratie
    // Laat leeg om alleen de lokale bibliotheek te gebruiken
    ANTHROPIC_API_KEY: '',
    
    // API endpoint (niet aanpassen tenzij je een proxy gebruikt)
    API_ENDPOINT: 'https://api.anthropic.com/v1/messages',
    
    // Model om te gebruiken voor recepten zoeken
    MODEL: 'claude-sonnet-4-20250514',
    
    // Maximum aantal tokens voor API response
    MAX_TOKENS: 4000,
    
    // Zoek instellingen
    SEARCH: {
        // Minimum aantal recepten in bibliotheek voordat online wordt gezocht
        MIN_LIBRARY_RESULTS: 3,
        
        // Maximum aantal recepten om te tonen
        MAX_RESULTS: 6,
        
        // Tijd tolerantie (recepten binnen X minuten van gevraagde tijd)
        TIME_TOLERANCE: 15
    },
    
    // LocalStorage keys
    STORAGE_KEYS: {
        LIBRARY: 'recipeLibrary',
        PREFERENCES: 'userPreferences'
    }
};

// Freeze config om wijzigingen te voorkomen
Object.freeze(CONFIG);
Object.freeze(CONFIG.SEARCH);
Object.freeze(CONFIG.STORAGE_KEYS);
