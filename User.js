import mongoose from 'mongoose';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: { type: String, enum: ['patient', 'practitioner', 'admin'], default: 'patient' },
    prakriti: {
      type: String,
      enum: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic', null],
      default: null
    },
    age: { type: Number, min: 1, max: 120 },
    dietaryPreferences: [{ type: String, enum: ['vegetarian', 'vegan', 'eggetarian', 'non-vegetarian'] }],
    allergies: [String],
    healthGoals: [String],
    notes: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

// Hash password before saving using sha256 + salt
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString('hex');
  this.password = `${salt}:${hash}`;
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password || !this.password.includes(':')) return false;
  const [salt, storedHash] = this.password.split(':');
  const hash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 64, 'sha512').toString('hex');
  return hash === storedHash;
};

const User = mongoose.model('User', userSchema);
export default User;
