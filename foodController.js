import Food from '../models/Food.js';

/**
 * @desc   Get all foods with optional filters (category, dosha, search, virya, rasa)
 * @route  GET /api/foods
 * @access Public
 */
export const getFoods = async (req, res) => {
  try {
    const { category, dosha, virya, rasa, search, limit } = req.query;
    let query = {};

    if (category) {
      query.category = category.toLowerCase();
    }

    if (virya) {
      query['ayurveda.virya'] = new RegExp(`^${virya}$`, 'i');
    }

    if (rasa) {
      query['ayurveda.rasa'] = { $in: [new RegExp(rasa, 'i')] };
    }

    if (dosha) {
      const d = dosha.toLowerCase();
      query.$or = [
        { [`ayurveda.doshaEffect.${d}`]: 'balances' },
        { 'ayurveda.bestFor': { $in: [new RegExp(dosha, 'i')] } }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { nameHindi: searchRegex },
        { tags: { $in: [searchRegex] } },
        { category: searchRegex }
      ];
    }

    let foodsQuery = Food.find(query).sort({ category: 1, name: 1 });
    if (limit && !isNaN(limit)) {
      foodsQuery = foodsQuery.limit(parseInt(limit, 10));
    }

    const foods = await foodsQuery;

    res.json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch foods',
      error: error.message
    });
  }
};

/**
 * @desc   Get single food by MongoDB ID or food code (e.g., 'GR001')
 * @route  GET /api/foods/:identifier
 * @access Public
 */
export const getFoodById = async (req, res) => {
  try {
    const { identifier } = req.params;
    let food;

    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      food = await Food.findById(identifier);
    } else {
      food = await Food.findOne({ code: identifier.toUpperCase() });
    }

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `Food not found with identifier: ${identifier}`
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching food item',
      error: error.message
    });
  }
};

/**
 * @desc   Get list of all 7 food categories with metadata and item counts
 * @route  GET /api/foods/categories/summary
 * @access Public
 */
export const getCategories = async (req, res) => {
  try {
    const categoryMetadata = [
      { id: 'grains', name: 'Grains & Cereals', icon: '🌾', description: 'Staple carbohydrates including rice, wheat, millets' },
      { id: 'vegetables', name: 'Vegetables', icon: '🥬', description: 'Fresh & cooked vegetables, greens, roots, gourds' },
      { id: 'fruits', name: 'Fruits', icon: '🍎', description: 'Seasonal and therapeutic Ayurvedic fruits' },
      { id: 'dairy', name: 'Dairy & Alternatives', icon: '🥛', description: 'Milk, curd, paneer, chaas, ghee, coconut milk' },
      { id: 'proteins', name: 'Proteins & Legumes', icon: '🫘', description: 'Lentils, beans, moong dal, chickpeas, tofu' },
      { id: 'spices', name: 'Spices & Herbs', icon: '🌿', description: 'Digestive spices, Agni boosters, Rasayana herbs' },
      { id: 'oils_sweeteners', name: 'Oils & Natural Sweeteners', icon: '🍯', description: 'Cold-pressed oils, ghee, raw honey, jaggery' }
    ];

    const counts = await Food.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id] = c.count;
    });

    const result = categoryMetadata.map((cat) => ({
      ...cat,
      foodCount: countMap[cat.id] || 0
    }));

    res.json({
      success: true,
      totalCategories: result.length,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories summary',
      error: error.message
    });
  }
};

/**
 * @desc   Get dosha-specific recommendations (balances, increases/avoid, tridoshic)
 * @route  GET /api/foods/dosha/:dosha
 * @access Public
 */
export const getDoshaRecommendations = async (req, res) => {
  try {
    const { dosha } = req.params;
    const d = dosha.toLowerCase();

    if (!['vata', 'pitta', 'kapha'].includes(d)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dosha. Must be Vata, Pitta, or Kapha'
      });
    }

    const balancing = await Food.find({
      $or: [
        { [`ayurveda.doshaEffect.${d}`]: 'balances' },
        { 'ayurveda.bestFor': { $in: [new RegExp(dosha, 'i')] } }
      ]
    }).sort({ category: 1, name: 1 });

    const avoid = await Food.find({
      [`ayurveda.doshaEffect.${d}`]: 'increases'
    }).sort({ category: 1, name: 1 });

    const tridoshic = await Food.find({
      'ayurveda.doshaEffect.vata': 'balances',
      'ayurveda.doshaEffect.pitta': 'balances',
      'ayurveda.doshaEffect.kapha': 'balances'
    }).sort({ name: 1 });

    res.json({
      success: true,
      dosha: dosha.toUpperCase(),
      recommendedCount: balancing.length,
      avoidCount: avoid.length,
      tridoshicCount: tridoshic.length,
      data: {
        recommended: balancing,
        avoid: avoid,
        tridoshic: tridoshic
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dosha recommendations',
      error: error.message
    });
  }
};

/**
 * @desc   Create new food item (Practitioner / Admin tool)
 * @route  POST /api/foods
 * @access Public
 */
export const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Food created successfully',
      data: food
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create food item',
      error: error.message
    });
  }
};
