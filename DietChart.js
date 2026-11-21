import mongoose from 'mongoose';

const dietChartItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
    portionGrams: { type: Number, required: true },
    rasa: String,
    virya: String
  },
  { _id: false }
);

const dietChartSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    practitioner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: String,
    patientAge: Number,
    patientPrakriti: String,
    mealType: { type: String, enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], default: 'Lunch' },
    items: [dietChartItemSchema],
    totalNutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number
    },
    approved: { type: Boolean, default: false },
    approvedAt: Date,
    notes: String
  },
  { timestamps: true }
);

const DietChart = mongoose.model('DietChart', dietChartSchema);
export default DietChart;
