import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  progressNote: {
    type: String,
    required: [true, 'Progress note is required'],
    trim: true
  },
  weightKg: {
    type: Number
  },
  symptomsReported: [{
    type: String
  }],
  recordedBy: {
    type: String,
    default: 'Practitioner'
  }
}, { _id: true, timestamps: true });

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age must be non-negative']
    },
    gender: {
      type: String,
      enum: ['Female', 'Male', 'Other', 'Prefer not to say'],
      default: 'Female'
    },
    prakriti: {
      type: String,
      enum: [
        'Unassessed',
        'Vata',
        'Pitta',
        'Kapha',
        'Vata-Pitta',
        'Pitta-Kapha',
        'Vata-Kapha',
        'Tridoshic'
      ],
      default: 'Unassessed'
    },
    agni: {
      type: String,
      enum: [
        'Unassessed',
        'Sama Agni (Balanced)',
        'Vishama Agni (Irregular - Vata)',
        'Tikshna Agni (Sharp/Hyperactive - Pitta)',
        'Manda Agni (Slow/Sluggish - Kapha)'
      ],
      default: 'Unassessed'
    },
    contactPhone: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    allergies: [{
      type: String,
      trim: true
    }],
    healthConditions: [{
      type: String,
      trim: true
    }],
    dietaryRestrictions: [{
      type: String,
      trim: true
    }],
    followUps: [followUpSchema],
    activePlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DietPlan'
    }
  },
  {
    timestamps: true
  }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
