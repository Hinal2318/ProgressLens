const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  action: { type: String, required: true }, 
  type: { 
    type: String, 
    enum: ['Task', 'Project', 'Milestone', 'Reflection', 'Review', 'Submission'], 
    required: true 
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Activity", activitySchema);