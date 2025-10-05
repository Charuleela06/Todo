import mongoose from 'mongoose';
  
  const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'Other' },
    subcategory: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    reminders: [{ type: Date }],
    completedAt: { type: Date }
  }, { timestamps: true });
  
  export const Task = mongoose.model('Task', TaskSchema);
