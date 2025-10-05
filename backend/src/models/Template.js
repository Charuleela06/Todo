import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, default: 'Work' },
  subcategory: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  defaultDueOffsetMinutes: { type: Number, default: 0 },
  defaultReminders: [{ type: Number }] // minutes relative to due
}, { timestamps: true });

export const Template = mongoose.model('Template', TemplateSchema);
