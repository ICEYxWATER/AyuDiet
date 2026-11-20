import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      required: true,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    foodCode: {
      type: String
    },
    foodName: {
      type: String,
      required: true
    },
    grams: {
      type: Number,
      required: true,
      min: [1, 'Portion must be at least 1 gram']
    },
    // Auto-calculated nutrition scaled from per-100g
    scaledEnergy: { type: Number, default: 0 }, // kcal
    scaledProtein: { type: Number, default: 0 }, // g
    scaledCarbs: { type: Number, default: 0 }, // g
    scaledFat: { type: Number, default: 0 }, // g
    rasa: { type: String, default: '' },
    virya: { type: String, default: '' },
    plateColor: { type: String, default: '#9da96b' }
  },
  { _id: true }
);

const dietPlanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient reference is required']
    },
    planTitle: {
      type: String,
      default: 'Ayurvedic Diet Chart'
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved'],
      default: 'Draft',
      index: true
    },
    season: {
      type: String,
      enum: [
        'All Season',
        'Vasanta (Spring)',
        'Grishma (Summer)',
        'Varsha (Monsoon)',
        'Sharad (Autumn)',
        'Hemanta (Early Winter)',
        'Shishira (Late Winter)'
      ],
      default: 'All Season'
    },
    targetPrakriti: {
      type: String,
      default: 'Unassessed'
    },
    meals: [mealItemSchema],
    totals: {
      energy: { type: Number, default: 0 }, // kcal
      protein: { type: Number, default: 0 }, // g
      carbs: { type: Number, default: 0 }, // g
      fat: { type: Number, default: 0 } // g
    },
    practitionerNotes: {
      type: String,
      default: ''
    },
    approvedAt: {
      type: Date
    },
    approvedBy: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save hook:
 * Automatically recalculates plan totals from meal items.
 * If meals are modified, status resets to 'Draft' unless explicitly approved.
 */
dietPlanSchema.pre('save', function (next) {
  if (this.isModified('meals')) {
    let energy = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    this.meals.forEach((item) => {
      energy += item.scaledEnergy || 0;
      protein += item.scaledProtein || 0;
      carbs += item.scaledCarbs || 0;
      fat += item.scaledFat || 0;
    });

    this.totals = {
      energy: Math.round(energy * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    };

    // If meals changed and not explicitly keeping approval, reset to Draft
    if (!this.isModified('status') && this.status === 'Approved') {
      this.status = 'Draft';
      this.approvedAt = null;
      this.approvedBy = null;
    }
  }
  next();
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
