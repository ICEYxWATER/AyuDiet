const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    foodId: { type: String, required: true, unique: true }, // e.g. "GR001"
    name: { type: String, required: true, index: true },
    nameHindi: String,
    category: {
      type: String,
      required: true,
      enum: ["grains", "vegetables", "fruits", "dairy", "proteins", "spices", "oils_sweeteners"],
      index: true,
    },
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      fiber: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
    },
    ayurveda: {
      rasa: [String],       // Taste (Sweet, Sour, Salty, Pungent, Bitter, Astringent)
      guna: [String],       // Qualities (Light, Heavy, Oily, Dry, etc.)
      virya: String,        // Thermal potency (Warming / Cooling)
      vipaka: String,       // Post-digestive effect
      doshaEffect: {
        vata: { type: String, enum: ["balances", "increases", "neutral"] },
        pitta: { type: String, enum: ["balances", "increases", "neutral"] },
        kapha: { type: String, enum: ["balances", "increases", "neutral"] },
      },
      bestFor: [{ type: String, enum: ["Vata", "Pitta", "Kapha"] }],
    },
    serving: {
      size: Number,
      unit: String,
      description: String,
    },
    tags: [String],
  },
  { timestamps: true }
);

// Text index for search
foodSchema.index({ name: "text", nameHindi: "text", tags: "text" });

module.exports = mongoose.model("Food", foodSchema);
