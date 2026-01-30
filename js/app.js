/**
 * Recepten Vinder - Main Application
 * 
 * Features:
 * - Search recipes by ingredients, cooking method, time, etc.
 * - Personal recipe library with localStorage persistence
 * - AI-powered online recipe search (requires API key)
 * - Rating system that improves recommendations
 */

// ============================================
// STATE MANAGEMENT
// ============================================
let state = {
    ingredient: '',
    meal: '',
    method: '',
    time: 30,
    persons: 2,
    setting: '',
    theme: '',
    cuisine: '',
    extraIngredients: ''
};

// Library stored in localStorage
let library = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.LIBRARY) || '[]');
let currentRecipe = null;
window.currentSearchResults = [];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    updateLibraryCount();
    initializeFormHandlers();
    initializeTabNavigation();
    initializeModalHandlers();
});

function updateLibraryCount() {
    const badge = document.getElementById('libraryCount');
    if (badge) {
        badge.textContent = library.length;
    }
}

// ============================================
// TAB NAVIGATION
// ============================================
function initializeTabNavigation() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active states
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabContent = document.getElementById(btn.dataset.tab + 'Tab');
            if (tabContent) {
                tabContent.classList.add('active');
            }
            
            // Render library when switching to library tab
            if (btn.dataset.tab === 'library') {
                renderLibrary();
            }
        });
    });
}

// ============================================
// FORM HANDLERS
// ============================================
function initializeFormHandlers() {
    // Chip selection
    setupChipSelection('ingredient-chip', 'ingredient');
    setupChipSelection('meal-chip', 'meal');
    setupChipSelection('method-chip', 'method');
    setupChipSelection('setting-chip', 'setting');
    setupChipSelection('theme-chip', 'theme');
    setupChipSelection('cuisine-chip', 'cuisine');
    
    // Input fields
    const ingredientInput = document.getElementById('ingredient');
    if (ingredientInput) {
        ingredientInput.addEventListener('input', (e) => {
            state.ingredient = e.target.value;
            document.querySelectorAll('.ingredient-chip').forEach(c => c.classList.remove('selected'));
        });
    }
    
    const extraIngredientsInput = document.getElementById('extraIngredients');
    if (extraIngredientsInput) {
        extraIngredientsInput.addEventListener('input', (e) => {
            state.extraIngredients = e.target.value;
        });
    }
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    const timeValue = document.getElementById('timeValue');
    if (timeSlider && timeValue) {
        timeSlider.addEventListener('input', (e) => {
            state.time = parseInt(e.target.value);
            timeValue.textContent = state.time;
        });
    }
    
    // Person counter
    const personCount = document.getElementById('personCount');
    const decreaseBtn = document.getElementById('decreaseBtn');
    const increaseBtn = document.getElementById('increaseBtn');
    
    if (decreaseBtn && personCount) {
        decreaseBtn.addEventListener('click', () => {
            if (state.persons > 1) {
                state.persons--;
                personCount.textContent = state.persons;
            }
        });
    }
    
    if (increaseBtn && personCount) {
        increaseBtn.addEventListener('click', () => {
            if (state.persons < 20) {
                state.persons++;
                personCount.textContent = state.persons;
            }
        });
    }
    
    // Extra options toggle
    const extraToggle = document.getElementById('extraToggle');
    const extraOptions = document.getElementById('extraOptions');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (extraToggle && extraOptions && toggleIcon) {
        extraToggle.addEventListener('click', () => {
            extraOptions.classList.toggle('visible');
            toggleIcon.textContent = extraOptions.classList.contains('visible') ? '▲' : '▼';
        });
    }
    
    // Search button
    const findRecipesBtn = document.getElementById('findRecipes');
    if (findRecipesBtn) {
        findRecipesBtn.addEventListener('click', handleSearch);
    }
    
    // Library filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLibrary(btn.dataset.filter);
        });
    });
}

function setupChipSelection(className, stateKey) {
    document.querySelectorAll(`.${className}`).forEach(chip => {
        chip.addEventListener('click', () => {
            // Deselect all chips of this type
            document.querySelectorAll(`.${className}`).forEach(c => c.classList.remove('selected'));
            // Select clicked chip
            chip.classList.add('selected');
            // Update state
            state[stateKey] = chip.dataset.value;
            
            // Sync with input field for ingredients
            if (stateKey === 'ingredient') {
                const input = document.getElementById('ingredient');
                if (input) {
                    input.value = chip.dataset.value;
                }
            }
        });
    });
}

// ============================================
// LIBRARY MANAGEMENT
// ============================================
function saveToLibrary(recipe) {
    const exists = library.find(r => r.id === recipe.id);
    if (!exists) {
        recipe.savedAt = new Date().toISOString();
        recipe.source = recipe.source || 'online';
        library.push(recipe);
        localStorage.setItem(CONFIG.STORAGE_KEYS.LIBRARY, JSON.stringify(library));
        updateLibraryCount();
        return true;
    }
    return false;
}

function removeFromLibrary(recipeId) {
    library = library.filter(r => r.id !== recipeId);
    localStorage.setItem(CONFIG.STORAGE_KEYS.LIBRARY, JSON.stringify(library));
    updateLibraryCount();
    renderLibrary();
}

function updateRecipeRating(recipeId, rating) {
    const recipe = library.find(r => r.id === recipeId);
    if (recipe) {
        recipe.userRating = rating;
        recipe.ratedAt = new Date().toISOString();
        localStorage.setItem(CONFIG.STORAGE_KEYS.LIBRARY, JSON.stringify(library));
    }
}

function searchLibrary(criteria) {
    return library.filter(recipe => {
        let matches = true;
        
        // Filter by ingredient
        if (criteria.ingredient) {
            const ing = criteria.ingredient.toLowerCase();
            matches = matches && (
                recipe.ingredient?.toLowerCase().includes(ing) ||
                recipe.name?.toLowerCase().includes(ing) ||
                recipe.ingredients?.some(i => i.toLowerCase().includes(ing))
            );
        }
        
        // Filter by cooking method
        if (criteria.method && criteria.method !== 'geen voorkeur') {
            matches = matches && recipe.method === criteria.method;
        }
        
        // Filter by time
        if (criteria.time) {
            matches = matches && recipe.time <= criteria.time + CONFIG.SEARCH.TIME_TOLERANCE;
        }
        
        // Filter by cuisine
        if (criteria.cuisine) {
            matches = matches && recipe.cuisine?.toLowerCase() === criteria.cuisine.toLowerCase();
        }
        
        // Filter by theme
        if (criteria.theme) {
            matches = matches && recipe.tags?.some(t => 
                t.toLowerCase().includes(criteria.theme.toLowerCase())
            );
        }
        
        // Exclude poorly rated recipes (1-2 stars)
        if (recipe.userRating && recipe.userRating <= 2) {
            matches = false;
        }
        
        return matches;
    }).sort((a, b) => {
        // Sort by rating (higher first), then by recency
        const ratingA = a.userRating || 3;
        const ratingB = b.userRating || 3;
        if (ratingB !== ratingA) return ratingB - ratingA;
        return new Date(b.savedAt) - new Date(a.savedAt);
    });
}

function renderLibrary(filter = 'all') {
    const grid = document.getElementById('libraryGrid');
    const empty = document.getElementById('emptyLibrary');
    
    if (!grid || !empty) return;
    
    let recipes = [...library];
    
    if (filter === 'favorites') {
        recipes = recipes.filter(r => r.userRating >= 4);
    } else if (filter === 'recent') {
        recipes = recipes.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).slice(0, 10);
    }
    
    if (recipes.length === 0) {
        empty.style.display = 'block';
        grid.innerHTML = '';
        return;
    }
    
    empty.style.display = 'none';
    grid.innerHTML = recipes.map(recipe => createRecipeCard(recipe, true)).join('');
}

// ============================================
// RECIPE CARD CREATION
// ============================================
function createRecipeCard(recipe, fromLibrary = false) {
    const ratingHtml = recipe.userRating ? `
        <div class="recipe-rating">
            ${[1,2,3,4,5].map(i => `
                <span class="rating-star ${i <= recipe.userRating ? '' : 'empty'}">★</span>
            `).join('')}
        </div>
    ` : '';
    
    const sourceClass = fromLibrary ? 'from-library' : 'from-online';
    
    return `
        <div class="recipe-card ${sourceClass}" onclick="showRecipeDetail('${recipe.id}', ${fromLibrary})">
            <div class="recipe-image">${recipe.emoji || '🍽️'}</div>
            <div class="recipe-content">
                <div class="recipe-tags">
                    <span class="recipe-tag time">⏱️ ${recipe.time} min</span>
                    ${(recipe.tags || []).slice(0, 2).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                </div>
                <h3 class="recipe-name">${recipe.name}</h3>
                <p class="recipe-description">${recipe.description}</p>
                ${ratingHtml}
                <div class="recipe-meta">
                    <div class="meta-item">👥 ${state.persons} personen</div>
                    <div class="meta-item">📊 ${recipe.difficulty || 'Gemiddeld'}</div>
                    <div class="meta-item">🔥 ${recipe.calories || '~400'} kcal</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// MODAL HANDLERS
// ============================================
function initializeModalHandlers() {
    const modal = document.getElementById('recipeModal');
    
    if (modal) {
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'recipeModal') {
                closeModal();
            }
        });
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function showRecipeDetail(recipeId, fromLibrary = false) {
    let recipe;
    if (fromLibrary) {
        recipe = library.find(r => r.id === recipeId);
    } else {
        recipe = window.currentSearchResults?.find(r => r.id === recipeId);
    }
    
    if (!recipe) return;
    currentRecipe = recipe;
    
    const isInLibrary = library.some(r => r.id === recipe.id);
    const libraryRecipe = library.find(r => r.id === recipe.id);
    const currentRating = libraryRecipe?.userRating || 0;
    
    const modal = document.getElementById('recipeModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <div class="modal-emoji">${recipe.emoji || '🍽️'}</div>
            <div>
                <div class="modal-source">
                    ${recipe.source === 'library' ? '📚 Uit je bibliotheek' : 
                      recipe.sourceUrl ? `🌐 <a href="${recipe.sourceUrl}" target="_blank" rel="noopener">${recipe.sourceName || 'Online recept'}</a>` : 
                      '🤖 AI gegenereerd'}
                </div>
                <h2 class="modal-title">${recipe.name}</h2>
                <div class="modal-tags">
                    ${(recipe.tags || []).map(tag => `<span class="recipe-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
        
        <p class="modal-description">${recipe.fullDescription || recipe.description}</p>
        
        <div class="modal-stats">
            <div class="stat-item">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">${recipe.time}</div>
                <div class="stat-label">minuten</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">👥</div>
                <div class="stat-value">${state.persons}</div>
                <div class="stat-label">personen</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${recipe.difficulty || 'Gemiddeld'}</div>
                <div class="stat-label">niveau</div>
            </div>
            <div class="stat-item">
                <div class="stat-icon">🔥</div>
                <div class="stat-value">${recipe.calories || '~400'}</div>
                <div class="stat-label">kcal</div>
            </div>
        </div>

        ${isInLibrary ? `
        <div class="rating-section">
            <h4>Hoe vond je dit recept?</h4>
            <div class="rating-stars">
                ${[1,2,3,4,5].map(i => `
                    <button class="rating-star-btn ${i <= currentRating ? 'active' : ''}" 
                            onclick="rateRecipe('${recipe.id}', ${i})">★</button>
                `).join('')}
            </div>
            <p class="rating-feedback ${currentRating > 0 ? 'visible' : ''}" id="ratingFeedback">
                ${currentRating >= 4 ? '❤️ Dit recept wordt vaker aanbevolen!' : 
                  currentRating <= 2 && currentRating > 0 ? '👋 Dit recept wordt minder vaak getoond.' : ''}
            </p>
        </div>
        ` : ''}

        <div class="modal-section">
            <h3 class="modal-section-title">🥘 Ingrediënten</h3>
            <ul class="ingredients-list">
                ${(recipe.ingredients || ['Ingrediënten niet beschikbaar']).map(ing => `<li>${ing}</li>`).join('')}
            </ul>
        </div>

        <div class="modal-section">
            <h3 class="modal-section-title">👨‍🍳 Bereiding</h3>
            <ol class="steps-list">
                ${(recipe.steps || ['Bereiding niet beschikbaar']).map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>

        <div class="modal-actions">
            ${!isInLibrary ? `
                <button class="action-btn primary" onclick="saveCurrentRecipe()">
                    📚 Opslaan in bibliotheek
                </button>
            ` : `
                <button class="action-btn danger" onclick="removeCurrentRecipe()">
                    🗑️ Verwijderen
                </button>
            `}
            <button class="action-btn secondary" onclick="closeModal()">
                Sluiten
            </button>
        </div>
    `;
    
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function rateRecipe(recipeId, rating) {
    updateRecipeRating(recipeId, rating);
    
    // Update UI
    document.querySelectorAll('.rating-star-btn').forEach((btn, index) => {
        btn.classList.toggle('active', index < rating);
    });
    
    const feedback = document.getElementById('ratingFeedback');
    if (feedback) {
        if (rating >= 4) {
            feedback.textContent = '❤️ Dit recept wordt vaker aanbevolen!';
        } else if (rating <= 2) {
            feedback.textContent = '👋 Dit recept wordt minder vaak getoond.';
        } else {
            feedback.textContent = '👍 Bedankt voor je feedback!';
        }
        feedback.classList.add('visible');
    }
}

function saveCurrentRecipe() {
    if (currentRecipe) {
        if (saveToLibrary(currentRecipe)) {
            alert('✅ Recept opgeslagen in je bibliotheek!');
            showRecipeDetail(currentRecipe.id, true);
        } else {
            alert('Dit recept staat al in je bibliotheek.');
        }
    }
}

function removeCurrentRecipe() {
    if (currentRecipe && confirm('Weet je zeker dat je dit recept wilt verwijderen?')) {
        removeFromLibrary(currentRecipe.id);
        closeModal();
    }
}

function closeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.classList.remove('visible');
    }
    document.body.style.overflow = '';
    currentRecipe = null;
}

// Make functions globally available
window.showRecipeDetail = showRecipeDetail;
window.rateRecipe = rateRecipe;
window.saveCurrentRecipe = saveCurrentRecipe;
window.removeCurrentRecipe = removeCurrentRecipe;
window.closeModal = closeModal;

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
async function handleSearch() {
    const searchStatus = document.getElementById('searchStatus');
    const results = document.getElementById('results');
    const recipeGrid = document.getElementById('recipeGrid');
    const submitBtn = document.getElementById('findRecipes');
    
    // Get current ingredient
    const ingredient = state.ingredient || document.getElementById('ingredient')?.value || '';
    if (!ingredient.trim()) {
        alert('Vul een hoofdingrediënt in om te zoeken.');
        return;
    }
    
    // Show loading
    if (searchStatus) searchStatus.classList.add('visible');
    if (results) results.classList.remove('visible');
    if (submitBtn) submitBtn.disabled = true;
    
    const steps = {
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3')
    };
    
    try {
        // Step 1: Search library
        if (steps.step1) steps.step1.classList.add('active');
        await sleep(500);
        
        const libraryResults = searchLibrary({
            ingredient: ingredient,
            method: state.method,
            time: state.time,
            cuisine: state.cuisine,
            theme: state.theme
        });
        
        if (steps.step1) {
            steps.step1.classList.remove('active');
            steps.step1.classList.add('completed');
            steps.step1.textContent = `📚 ${libraryResults.length} recepten in bibliotheek gevonden`;
        }
        
        // Step 2: Search online if needed
        let onlineResults = [];
        const needsOnlineSearch = libraryResults.length < CONFIG.SEARCH.MIN_LIBRARY_RESULTS;
        
        if (needsOnlineSearch && CONFIG.ANTHROPIC_API_KEY) {
            if (steps.step2) steps.step2.classList.add('active');
            const statusText = document.getElementById('statusText');
            if (statusText) statusText.textContent = 'Online zoeken naar recepten...';
            
            onlineResults = await searchOnlineRecipes({
                ingredient: ingredient,
                method: state.method,
                time: state.time,
                meal: state.meal,
                cuisine: state.cuisine,
                theme: state.theme,
                setting: state.setting,
                extraIngredients: state.extraIngredients,
                persons: state.persons
            });
            
            if (steps.step2) {
                steps.step2.classList.remove('active');
                steps.step2.classList.add('completed');
                steps.step2.textContent = `🌐 ${onlineResults.length} online recepten gevonden`;
            }
        } else if (!CONFIG.ANTHROPIC_API_KEY) {
            if (steps.step2) {
                steps.step2.textContent = `🌐 Online zoeken niet beschikbaar (geen API key)`;
                steps.step2.classList.add('completed');
            }
        } else {
            if (steps.step2) {
                steps.step2.textContent = `🌐 Online zoeken overgeslagen (genoeg in bibliotheek)`;
                steps.step2.classList.add('completed');
            }
        }
        
        // Step 3: Combine and rank results
        if (steps.step3) steps.step3.classList.add('active');
        await sleep(300);
        
        // Mark sources
        libraryResults.forEach(r => r.source = 'library');
        onlineResults.forEach(r => r.source = 'online');
        
        // Combine: library first (if highly rated), then online
        const allResults = [
            ...libraryResults.filter(r => r.userRating >= 4),
            ...onlineResults,
            ...libraryResults.filter(r => !r.userRating || r.userRating < 4)
        ].slice(0, CONFIG.SEARCH.MAX_RESULTS);
        
        window.currentSearchResults = allResults;
        
        if (steps.step3) {
            steps.step3.classList.remove('active');
            steps.step3.classList.add('completed');
        }
        
        // Show results
        if (searchStatus) searchStatus.classList.remove('visible');
        
        if (allResults.length === 0) {
            if (recipeGrid) {
                recipeGrid.innerHTML = `
                    <div class="empty-library">
                        <div class="empty-library-icon">🔍</div>
                        <h3>Geen recepten gevonden</h3>
                        <p>Probeer andere zoekcriteria${!CONFIG.ANTHROPIC_API_KEY ? ' of voeg een API key toe voor online zoeken' : ''}.</p>
                    </div>
                `;
            }
        } else {
            const libraryCount = allResults.filter(r => r.source === 'library').length;
            const onlineCount = allResults.filter(r => r.source === 'online').length;
            
            const resultsTitle = document.getElementById('resultsTitle');
            const resultsSource = document.getElementById('resultsSource');
            
            if (resultsTitle) {
                resultsTitle.textContent = `🎉 ${allResults.length} recepten gevonden`;
            }
            
            if (resultsSource) {
                resultsSource.innerHTML = `
                    ${libraryCount > 0 ? `<span class="source-library">📚 ${libraryCount} uit bibliotheek</span>` : ''}
                    ${onlineCount > 0 ? `<span class="source-online">🌐 ${onlineCount} online</span>` : ''}
                `;
            }
            
            if (recipeGrid) {
                recipeGrid.innerHTML = allResults.map(recipe => 
                    createRecipeCard(recipe, recipe.source === 'library')
                ).join('');
            }
        }
        
        if (results) {
            results.classList.add('visible');
            results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
    } catch (error) {
        console.error('Search error:', error);
        alert('Er ging iets mis bij het zoeken. Probeer het opnieuw.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        
        // Reset steps
        Object.values(steps).forEach(step => {
            if (step) {
                step.classList.remove('active', 'completed');
            }
        });
        
        if (steps.step1) steps.step1.textContent = '📚 Zoeken in je bibliotheek...';
        if (steps.step2) steps.step2.textContent = '🌐 Online recepten zoeken...';
        if (steps.step3) steps.step3.textContent = '✨ Beste recepten selecteren...';
        
        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = 'Recepten zoeken...';
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// AI-POWERED ONLINE RECIPE SEARCH
// ============================================
async function searchOnlineRecipes(criteria) {
    if (!CONFIG.ANTHROPIC_API_KEY) {
        console.log('No API key configured, skipping online search');
        return [];
    }
    
    try {
        const prompt = buildSearchPrompt(criteria);
        
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": CONFIG.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true"
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                max_tokens: CONFIG.MAX_TOKENS,
                tools: [
                    {
                        type: "web_search_20250305",
                        name: "web_search"
                    }
                ],
                messages: [
                    { 
                        role: "user", 
                        content: prompt 
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract text content from response
        const textContent = data.content
            ?.filter(item => item.type === "text")
            ?.map(item => item.text)
            ?.join("\n") || "";
        
        // Parse JSON from response
        const jsonMatch = textContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const recipes = JSON.parse(jsonMatch[0]);
            return recipes.map((r, index) => ({
                ...r,
                id: `online-${Date.now()}-${index}`,
                source: 'online'
            }));
        }
        
        return [];
    } catch (error) {
        console.error('Online search error:', error);
        return getFallbackRecipes(criteria);
    }
}

function buildSearchPrompt(criteria) {
    const parts = [];
    
    parts.push(`Zoek naar recepten met ${criteria.ingredient} als hoofdingrediënt.`);
    
    if (criteria.method && criteria.method !== 'geen voorkeur') {
        parts.push(`Bereidingswijze: ${criteria.method}.`);
    }
    if (criteria.time) {
        parts.push(`Maximale bereidingstijd: ${criteria.time} minuten.`);
    }
    if (criteria.meal) {
        parts.push(`Type maaltijd: ${criteria.meal}.`);
    }
    if (criteria.cuisine) {
        parts.push(`Keukenstijl: ${criteria.cuisine}.`);
    }
    if (criteria.theme) {
        parts.push(`Thema/dieet: ${criteria.theme}.`);
    }
    if (criteria.setting) {
        parts.push(`Setting: ${criteria.setting}.`);
    }
    if (criteria.extraIngredients) {
        parts.push(`Extra ingrediënten om te gebruiken: ${criteria.extraIngredients}.`);
    }
    parts.push(`Aantal personen: ${criteria.persons}.`);
    
    return `Je bent een recepten-expert. Zoek online naar 3-4 echte recepten die voldoen aan deze criteria:

${parts.join('\n')}

Zoek op populaire receptensites zoals Allerhande, Leukerecepten, Smulweb, 24Kitchen, of internationale sites.

Geef de resultaten terug als een JSON array met deze structuur (en ALLEEN de JSON, geen andere tekst):
[
  {
    "name": "Naam van het recept",
    "description": "Korte beschrijving (1-2 zinnen)",
    "fullDescription": "Uitgebreide beschrijving (2-3 zinnen)",
    "emoji": "Passende emoji",
    "time": 30,
    "difficulty": "Makkelijk/Gemiddeld/Gevorderd",
    "calories": 450,
    "ingredient": "${criteria.ingredient}",
    "method": "${criteria.method || 'pan'}",
    "cuisine": "${criteria.cuisine || 'algemeen'}",
    "tags": ["Tag1", "Tag2"],
    "ingredients": ["Ingrediënt 1", "Ingrediënt 2", "etc"],
    "steps": ["Stap 1", "Stap 2", "etc"],
    "sourceName": "Naam van de website",
    "sourceUrl": "URL van het recept"
  }
]

Zorg dat de recepten in het Nederlands zijn en realistisch uitvoerbaar.`;
}

function getFallbackRecipes(criteria) {
    // Fallback recipes if API fails or is not configured
    const fallbacks = {
        'kip': [
            {
                id: 'fallback-kip-1',
                name: 'Simpele Kip met Groenten',
                description: 'Makkelijke doordeweekse maaltijd met malse kip en verse groenten.',
                fullDescription: 'Een snelle en gezonde maaltijd die iedereen lust. Perfect voor drukke dagen.',
                emoji: '🍗',
                time: 30,
                difficulty: 'Makkelijk',
                calories: 380,
                ingredient: 'kip',
                method: criteria.method || 'pan',
                tags: ['Snel', 'Gezond'],
                ingredients: ['400g kipfilet', '2 paprika\'s', '1 courgette', '2 el olijfolie', 'Kruiden naar smaak'],
                steps: ['Snijd de kip en groenten in stukjes.', 'Verhit olie in een pan.', 'Bak de kip gaar.', 'Voeg groenten toe en bak 5-7 minuten.', 'Breng op smaak met kruiden.']
            }
        ],
        'default': [
            {
                id: 'fallback-default-1',
                name: 'Snelle Pasta',
                description: 'Eenvoudige pasta die altijd lukt.',
                fullDescription: 'Een klassieke pasta die je in 20 minuten op tafel zet.',
                emoji: '🍝',
                time: 20,
                difficulty: 'Makkelijk',
                calories: 450,
                ingredient: criteria.ingredient,
                method: 'pan',
                tags: ['Snel', 'Makkelijk'],
                ingredients: ['300g pasta', 'Saus naar keuze', 'Parmezaan'],
                steps: ['Kook de pasta.', 'Verwarm de saus.', 'Meng en serveer met kaas.']
            }
        ]
    };
    
    return fallbacks[criteria.ingredient?.toLowerCase()] || fallbacks['default'];
}
