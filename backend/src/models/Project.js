import mongoose from 'mongoose';
  
  const ProjectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    color: { type: String, default: '#3b82f6' },
    ownerTitle: { type: String, default: '' },
    // Collaborative members: owner (user) plus additional members
    members: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
      title: { type: String, default: '' }
    }]
  }, { timestamps: true });
  
  export const Project = mongoose.model('Project', ProjectSchema);
