/**
 * AyuDiet Food Database API
 * ---------------------------
 * A client-side API layer for the AyuDiet Connect food database.
 * Loads from a local JSON file and provides search, filter, and
 * Ayurvedic dosha-based recommendation capabilities.
 *
 * Data sources:
 *   - IFCT 2017 (Indian Food Composition Tables, NIN Hyderabad)
 *   - Kaggle Ayurvedic Indian Food Nutrition Dataset
 *   - Kaggle Indian Food Properties Dataset
 *   - USDA FoodData Central (cross-referenced)
 *
 * @version 1.0.0
 * @license MIT
 */

const AyuDietDB = (() => {
  /* ================================================================
   *  PRIVATE STATE
   * ================================================================ */
  let _db = null;        // cached database
  let _ready = false;    // load flag
  let _loadPromise = null;

  /* ================================================================
   *  LOADER
   * ================================================================ */

  /**
   * Load the food database JSON.  Caches after first successful fetch.
   * @param {string} [path='api/food-database.json'] - Path to JSON file
   * @returns {Promise<object>} The full database object
   */
  async function load(path = 'api/food-database.json') {
    if (_ready) return _db;
    if (_loadPromise) return _loadPromise;

    _loadPromise = fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load food database: ${res.status}`);
        return res.json();
      })
      .then(data => {
        _db = data;
        _ready = true;
        console.log(
          `✅ AyuDiet DB loaded: ${data.foods.length} foods in ${data.categories.length} categories`
        );
        return _db;
      });

    return _loadPromise;
  }

  /* ================================================================
   *  GETTERS
   * ================================================================ */

  /** @returns {object[]} All food items */
  function getAllFoods() {
    _ensureLoaded();
    return _db.foods;
  }

  /** @returns {object[]} All category definitions */
  function getCategories() {
    _ensureLoaded();
    return _db.categories;
  }

  /** @returns {object} Database metadata */
  function getMeta() {
    _ensureLoaded();
    return _db.meta;
  }

  /**
   * Get a single food by its ID.
   * @param {string} id - e.g. "GR001"
   * @returns {object|null}
   */
  function getFoodById(id) {
    _ensureLoaded();
    return _db.foods.find(f => f.id === id) || null;
  }

  /* ================================================================
   *  SEARCH & FILTER
   * ================================================================ */

  /**
   * Full-text search across name, nameHindi, tags, and category.
   * @param {string} query - Search term
   * @returns {object[]} Matching foods ranked by relevance
   */
  function searchFoods(query) {
    _ensureLoaded();
    if (!query || !query.trim()) return _db.foods;

    const q = query.toLowerCase().trim();
    const scored = _db.foods.map(food => {
      let score = 0;
      if (food.name.toLowerCase().includes(q))             score += 10;
      if (food.nameHindi && food.nameHindi.includes(query)) score += 10;
      if (food.category.toLowerCase().includes(q))          score += 5;
      if (food.tags.some(t => t.includes(q)))               score += 3;
      if (food.ayurveda.rasa.some(r => r.toLowerCase().includes(q))) score += 4;
      if (food.ayurveda.bestFor.some(d => d.toLowerCase().includes(q))) score += 6;
      return { food, score };
    });

    return scored.filter(s => s.score > 0)
                 .sort((a, b) => b.score - a.score)
                 .map(s => s.food);
  }

  /**
   * Filter foods by category ID.
   * @param {string} categoryId - e.g. "grains", "vegetables", "spices"
   * @returns {object[]}
   */
  function filterByCategory(categoryId) {
    _ensureLoaded();
    return _db.foods.filter(f => f.category === categoryId);
  }

  /**
   * Filter foods by tag.
   * @param {string} tag - e.g. "sattvic", "gluten-free", "high-protein"
   * @returns {object[]}
   */
  function filterByTag(tag) {
    _ensureLoaded();
    const t = tag.toLowerCase();
    return _db.foods.filter(f => f.tags.some(ft => ft.includes(t)));
  }

  /* ================================================================
   *  AYURVEDIC / DOSHA RECOMMENDATIONS
   * ================================================================ */

  /**
   * Get foods recommended for a specific dosha.
   * @param {'Vata'|'Pitta'|'Kapha'} dosha
   * @returns {object[]} Foods that balance the given dosha
   */
  function getFoodsForDosha(dosha) {
    _ensureLoaded();
    const d = _capitalize(dosha);
    return _db.foods.filter(f => {
      const effect = f.ayurveda.doshaEffect[d.toLowerCase()];
      return effect === 'balances' || f.ayurveda.bestFor.includes(d);
    });
  }

  /**
   * Get foods to AVOID for a specific dosha (ones that increase it).
   * @param {'Vata'|'Pitta'|'Kapha'} dosha
   * @returns {object[]}
   */
  function getFoodsToAvoid(dosha) {
    _ensureLoaded();
    const d = dosha.toLowerCase();
    return _db.foods.filter(f => f.ayurveda.doshaEffect[d] === 'increases');
  }

  /**
   * Get tridoshic foods (balance all three doshas).
   * @returns {object[]}
   */
  function getTridoshicFoods() {
    _ensureLoaded();
    return _db.foods.filter(f =>
      f.ayurveda.bestFor.length === 3 ||
      (f.ayurveda.doshaEffect.vata === 'balances' &&
       f.ayurveda.doshaEffect.pitta === 'balances' &&
       f.ayurveda.doshaEffect.kapha === 'balances')
    );
  }

  /**
   * Get foods by Rasa (taste).
   * @param {'Sweet'|'Sour'|'Salty'|'Pungent'|'Bitter'|'Astringent'} rasa
   * @returns {object[]}
   */
  function filterByRasa(rasa) {
    _ensureLoaded();
    const r = _capitalize(rasa);
    return _db.foods.filter(f => f.ayurveda.rasa.includes(r));
  }

  /**
   * Get foods by Virya (thermal potency).
   * @param {'Warming'|'Cooling'} virya
   * @returns {object[]}
   */
  function filterByVirya(virya) {
    _ensureLoaded();
    const v = _capitalize(virya);
    return _db.foods.filter(f => f.ayurveda.virya === v);
  }

  /* ================================================================
   *  NUTRITION HELPERS
   * ================================================================ */

  /**
   * Calculate total nutrition for a list of food items with quantities.
   * @param {Array<{id: string, quantity: number}>} items
   *   quantity = number of servings (1 = one standard serving)
   * @returns {object} Aggregated nutrition values
   */
  function calculateMealNutrition(items) {
    _ensureLoaded();
    const totals = {
      calories: 0, protein: 0, carbs: 0, fat: 0,
      fiber: 0, sugar: 0, calcium: 0, iron: 0,
      vitaminC: 0, potassium: 0
    };

    items.forEach(({ id, quantity = 1 }) => {
      const food = getFoodById(id);
      if (!food) return;

      // Scale from per-100g to per-serving, then multiply by quantity
      const factor = (food.serving.size / 100) * quantity;
      Object.keys(totals).forEach(key => {
        totals[key] += (food.nutrition[key] || 0) * factor;
      });
    });

    // Round to 1 decimal
    Object.keys(totals).forEach(k => {
      totals[k] = Math.round(totals[k] * 10) / 10;
    });

    return totals;
  }

  /**
   * Sort foods by a nutrition field (descending).
   * @param {string} nutrient - e.g. "protein", "fiber", "calcium"
   * @param {number} [limit=10]
   * @returns {object[]}
   */
  function topFoodsByNutrient(nutrient, limit = 10) {
    _ensureLoaded();
    return [..._db.foods]
      .sort((a, b) => (b.nutrition[nutrient] || 0) - (a.nutrition[nutrient] || 0))
      .slice(0, limit);
  }

  /* ================================================================
   *  MEAL PLAN GENERATOR
   * ================================================================ */

  /**
   * Generate a simple day's meal plan for a given dosha.
   * @param {'Vata'|'Pitta'|'Kapha'} dosha
   * @returns {object} { breakfast, lunch, dinner, snacks }
   */
  function generateMealPlan(dosha) {
    _ensureLoaded();
    const suitable = getFoodsForDosha(dosha);

    const pick = (categoryId, count = 1) => {
      const pool = suitable.filter(f => f.category === categoryId);
      return _shuffle(pool).slice(0, count);
    };

    return {
      dosha: dosha,
      breakfast: {
        label: 'Breakfast',
        items: [
          ...pick('grains', 1),
          ...pick('fruits', 1),
          ...pick('dairy', 1)
        ]
      },
      lunch: {
        label: 'Lunch',
        items: [
          ...pick('grains', 1),
          ...pick('proteins', 1),
          ...pick('vegetables', 2),
          ...pick('spices', 1)
        ]
      },
      dinner: {
        label: 'Dinner',
        items: [
          ...pick('grains', 1),
          ...pick('proteins', 1),
          ...pick('vegetables', 1)
        ]
      },
      snacks: {
        label: 'Snacks',
        items: [
          ...pick('fruits', 1),
          ...pick('oils_sweeteners', 1)
        ]
      }
    };
  }

  /* ================================================================
   *  STATISTICS & SUMMARY
   * ================================================================ */

  /**
   * Get a summary of the database contents.
   * @returns {object}
   */
  function getSummary() {
    _ensureLoaded();
    const cats = {};
    _db.categories.forEach(c => { cats[c.id] = { ...c, count: 0 }; });
    _db.foods.forEach(f => { if (cats[f.category]) cats[f.category].count++; });

    const doshaStats = { Vata: 0, Pitta: 0, Kapha: 0 };
    _db.foods.forEach(f => {
      f.ayurveda.bestFor.forEach(d => { doshaStats[d]++; });
    });

    return {
      totalFoods: _db.foods.length,
      categories: Object.values(cats),
      doshaDistribution: doshaStats,
      sources: _db.meta.sources,
      lastUpdated: _db.meta.lastUpdated
    };
  }

  /* ================================================================
   *  PRIVATE HELPERS
   * ================================================================ */

  function _ensureLoaded() {
    if (!_ready) throw new Error('AyuDietDB not loaded yet. Call await AyuDietDB.load() first.');
  }

  function _capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ================================================================
   *  PUBLIC API
   * ================================================================ */
  return {
    // Lifecycle
    load,

    // Getters
    getAllFoods,
    getCategories,
    getMeta,
    getFoodById,

    // Search & Filter
    searchFoods,
    filterByCategory,
    filterByTag,

    // Ayurvedic / Dosha
    getFoodsForDosha,
    getFoodsToAvoid,
    getTridoshicFoods,
    filterByRasa,
    filterByVirya,

    // Nutrition
    calculateMealNutrition,
    topFoodsByNutrient,

    // Meal Planning
    generateMealPlan,

    // Summary
    getSummary
  };
})();
