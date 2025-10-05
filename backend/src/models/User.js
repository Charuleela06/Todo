import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const NotificationSettingsSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  push: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  notifications: { type: NotificationSettingsSchema, default: () => ({}) },
  // Gamification
  points: { type: Number, default: 0 },
  badges: { type: [String], default: [] }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', UserSchema);
