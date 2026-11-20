const mongoose = require("mongoose");

const questionResponseSchema = new mongoose.Schema(
  {
    questionId: { type: Number, required: true },
    question: String,
    answer: String,
    doshaScores: {
      vata: { type: Number, default: 0 },
      pitta: { type: Number, default: 0 },
      kapha: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const prakritiAssessmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    responses: [questionResponseSchema],
    totalScores: {
      vata: { type: Number, default: 0 },
      pitta: { type: Number, default: 0 },
      kapha: { type: Number, default: 0 },
    },
    dominantDosha: {
      type: String,
      enum: ["Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"],
    },
    secondaryDosha: {
      type: String,
      enum: ["Vata", "Pitta", "Kapha", null],
      default: null,
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrakritiAssessment", prakritiAssessmentSchema);
