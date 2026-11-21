import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    portionGrams: { type: Number, required: true, min: 0.1 },
    servings: { type: Number, default: 1 },
    notes: String
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Bedtime']
    },
    items: [mealItemSchema],
    totalNutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    }
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // practitioner
    title: { type: String, default: 'Daily Meal Plan' },
    targetDosha: {
      type: String,
      enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic']
    },
    meals: [mealSchema],
    dailyTotals: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number
    },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    validFrom: Date,
    validUntil: Date,
    practitionerNotes: String
  },
  { timestamps: true }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
