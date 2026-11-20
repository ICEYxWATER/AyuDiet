import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      index: true
    },
    nameHindi: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'grains',
        'vegetables',
        'fruits',
        'dairy',
        'proteins',
        'spices',
        'oils_sweeteners'
      ],
      index: true
    },
    categoryName: {
      type: String,
      default: ''
    },
    nutrition: {
      calories: { type: Number, required: true }, // kcal per 100g
      protein: { type: Number, required: true, default: 0 }, // grams
      carbs: { type: Number, required: true, default: 0 }, // grams
      fat: { type: Number, required: true, default: 0 }, // grams
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 }, // mg
      iron: { type: Number, default: 0 }, // mg
      vitaminC: { type: Number, default: 0 }, // mg
      potassium: { type: Number, default: 0 } // mg
    },
    ayurveda: {
      rasa: [{ type: String, trim: true }], // e.g. ["Sweet", "Astringent"]
      guna: [{ type: String, trim: true }], // e.g. ["Light", "Soft"]
      virya: {
        type: String,
        enum: ['Cooling', 'Warming', 'Neutral', ''],
        default: 'Neutral'
      },
      vipaka: {
        type: String,
        enum: ['Sweet', 'Sour', 'Pungent', ''],
        default: 'Sweet'
      },
      doshaEffect: {
        vata: {
          type: String,
          enum: ['balances', 'increases', 'neutral'],
          default: 'neutral'
        },
        pitta: {
          type: String,
          enum: ['balances', 'increases', 'neutral'],
          default: 'neutral'
        },
        kapha: {
          type: String,
          enum: ['balances', 'increases', 'neutral'],
          default: 'neutral'
        }
      },
      bestFor: [{ type: String }] // e.g. ["Vata", "Pitta"]
    },
    plateColor: {
      type: String,
      default: '#9da96b' // Hex color for 3D meal bowl visualization
    },
    serving: {
      size: { type: Number, default: 100 },
      unit: { type: String, default: 'g' },
      description: { type: String, default: '100g portion' }
    },
    tags: [{ type: String, trim: true }]
  },
  {
    timestamps: true
  }
);

// Full-text search index on name, Hindi name, and tags
foodSchema.index({
  name: 'text',
  nameHindi: 'text',
  tags: 'text'
});

const Food = mongoose.model('Food', foodSchema);
export default Food;
