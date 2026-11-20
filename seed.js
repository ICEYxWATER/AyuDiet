import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import Food from '../models/Food.js';
import Patient from '../models/Patient.js';
import DietPlan from '../models/DietPlan.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ayudiet';

// Color map for 3D meal bowl graphic
const CATEGORY_COLORS = {
  grains: '#e4d6ae',
  vegetables: '#58804c',
  fruits: '#df9755',
  dairy: '#dbc460',
  proteins: '#9da96b',
  spices: '#c97e46',
  oils_sweeteners: '#c59c56'
};

const CATEGORY_NAMES = {
  grains: 'Grains & Cereals',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy & Alternatives',
  proteins: 'Proteins & Legumes',
  spices: 'Spices & Herbs',
  oils_sweeteners: 'Oils & Natural Sweeteners'
};

const seedDatabase = async () => {
  try {
    console.log('🌿 Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log(` Connected to MongoDB: ${MONGO_URI}`);

    // Read the food database JSON file
    const jsonPath = path.join(__dirname, '../../api/food-database.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`food-database.json not found at ${jsonPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`📄 Found ${rawData.foods.length} foods across ${rawData.categories.length} categories.`);

    // 1. Clear existing data
    console.log('🧹 Clearing existing collections...');
    await Food.deleteMany({});
    await Patient.deleteMany({});
    await DietPlan.deleteMany({});

    // 2. Format foods for Mongoose insertion
    const foodsToInsert = rawData.foods.map((f) => ({
      code: f.id,
      name: f.name,
      nameHindi: f.nameHindi || '',
      category: f.category,
      categoryName: CATEGORY_NAMES[f.category] || f.category,
      nutrition: f.nutrition,
      ayurveda: {
        rasa: f.ayurveda.rasa || [],
        guna: f.ayurveda.guna || [],
        virya: f.ayurveda.virya || 'Neutral',
        vipaka: f.ayurveda.vipaka || 'Sweet',
        doshaEffect: f.ayurveda.doshaEffect || { vata: 'neutral', pitta: 'neutral', kapha: 'neutral' },
        bestFor: f.ayurveda.bestFor || []
      },
      plateColor: CATEGORY_COLORS[f.category] || '#9da96b',
      serving: f.serving || { size: 100, unit: 'g', description: '100g serving' },
      tags: f.tags || []
    }));

    const insertedFoods = await Food.insertMany(foodsToInsert);
    console.log(`✅ Seeded ${insertedFoods.length} foods into MongoDB.`);

    // Map inserted foods by code for easy reference
    const foodCodeMap = {};
    insertedFoods.forEach((f) => {
      foodCodeMap[f.code] = f;
    });

    // 3. Seed Demo Patient (from InnovaThon Prototype Slide 3: "Ananya Rao · 32 years")
    console.log('👤 Seeding demo patients...');
    const patient1 = await Patient.create({
      name: 'Ananya Rao',
      age: 32,
      gender: 'Female',
      prakriti: 'Vata-Pitta',
      agni: 'Vishama Agni (Irregular - Vata)',
      contactPhone: '+91 98765 43210',
      contactEmail: 'ananya.rao@example.com',
      allergies: ['Shellfish'],
      healthConditions: ['Mild acid reflux in autumn', 'Irregular digestion'],
      dietaryRestrictions: ['Vegetarian'],
      followUps: []
    });

    const patient2 = await Patient.create({
      name: 'Rohit Sharma',
      age: 45,
      gender: 'Male',
      prakriti: 'Kapha',
      agni: 'Manda Agni (Slow/Sluggish - Kapha)',
      contactPhone: '+91 91234 56789',
      contactEmail: 'rohit.sharma@example.com',
      healthConditions: ['Weight management', 'Water retention'],
      dietaryRestrictions: ['Low dairy'],
      followUps: []
    });

    // 4. Seed Demo Meal Plan (Exact Match with Hackathon Slide 3)
    // Breakfast: Cooked oats 180g (128 kcal | Sweet / Warming)
    // Lunch: Cooked rice 150g (195 kcal | Sweet / Cooling)
    // Lunch: Cooked mung dal 160g (168 kcal | Sweet, astringent / Cooling)
    // Dinner: Cooked carrot 120g (42 kcal | Sweet / Warming)
    // Dinner: Cooked chickpeas 120g (197 kcal | Sweet, astringent / Cooling)
    // Total: 730 kcal, 31.4g protein, 137.3g carbs, 6.1g fat
    console.log('🥣 Seeding prototype meal plan for Ananya Rao...');

    const oatsFood = foodCodeMap['GR003'] || insertedFoods[2]; // Oats
    const riceFood = foodCodeMap['GR001'] || insertedFoods[0]; // Rice
    const mungFood = foodCodeMap['PR001'] || insertedFoods[10]; // Moong dal
    const carrotFood = foodCodeMap['VG007'] || insertedFoods[5]; // Carrot
    const chickpeaFood = foodCodeMap['PR003'] || insertedFoods[12]; // Chickpeas

    const demoMeals = [
      {
        mealType: 'Breakfast',
        food: oatsFood._id,
        foodCode: oatsFood.code,
        foodName: oatsFood.name,
        grams: 180,
        scaledEnergy: 128,
        scaledProtein: 4.5,
        scaledCarbs: 21.6,
        scaledFat: 2.7,
        rasa: 'Sweet',
        virya: 'Warming',
        plateColor: oatsFood.plateColor
      },
      {
        mealType: 'Lunch',
        food: riceFood._id,
        foodCode: riceFood.code,
        foodName: riceFood.name,
        grams: 150,
        scaledEnergy: 195,
        scaledProtein: 4.1,
        scaledCarbs: 42.3,
        scaledFat: 0.5,
        rasa: 'Sweet',
        virya: 'Cooling',
        plateColor: riceFood.plateColor
      },
      {
        mealType: 'Lunch',
        food: mungFood._id,
        foodCode: mungFood.code,
        foodName: mungFood.name,
        grams: 160,
        scaledEnergy: 168,
        scaledProtein: 11.2,
        scaledCarbs: 30.7,
        scaledFat: 0.6,
        rasa: 'Sweet, astringent',
        virya: 'Cooling',
        plateColor: mungFood.plateColor
      },
      {
        mealType: 'Dinner',
        food: carrotFood._id,
        foodCode: carrotFood.code,
        foodName: carrotFood.name,
        grams: 120,
        scaledEnergy: 42,
        scaledProtein: 1.1,
        scaledCarbs: 11.5,
        scaledFat: 0.2,
        rasa: 'Sweet',
        virya: 'Warming',
        plateColor: carrotFood.plateColor
      },
      {
        mealType: 'Dinner',
        food: chickpeaFood._id,
        foodCode: chickpeaFood.code,
        foodName: chickpeaFood.name,
        grams: 120,
        scaledEnergy: 197,
        scaledProtein: 10.7,
        scaledCarbs: 32.9,
        scaledFat: 3.1,
        rasa: 'Sweet, astringent',
        virya: 'Cooling',
        plateColor: chickpeaFood.plateColor
      }
    ];

    const demoPlan = await DietPlan.create({
      patient: patient1._id,
      planTitle: 'Pitta-Vata Balancing Autumn Plan',
      season: 'Sharad (Autumn)',
      targetPrakriti: 'Vata-Pitta',
      status: 'Draft',
      meals: demoMeals,
      totals: {
        energy: 730,
        protein: 31.4,
        carbs: 137.3,
        fat: 6.1
      },
      practitionerNotes: 'Prioritize warm, moist meals with sweet and cooling attributes to pacify Pitta without aggravating Vata. Drink warm water between meals.'
    });

    patient1.activePlanId = demoPlan._id;
    await patient1.save();

    console.log(' Demo plan created with status: Draft (Totals: 730 kcal, 31.4g protein, 137.3g carbs, 6.1g fat)');
    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
