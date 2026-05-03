const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phase: { 
    type: String, 
    enum: ['Proposal', 'Mid-Evaluation', 'Final'], 
    required: true 
  },
  githubLink: { type: String },
  demoLink: { type: String },
  liveUrl: { type: String },
  filePath: { type: String }, 
  comments: { type: String },
  score: { type: Number, min: 0, max: 100 },
  feedback: { type: String },
  status: { 
    type: String, 
    enum: ['Pending Review', 'Approved', 'Rejected', 'Revision Requested'], 
    default: 'Pending Review' 
  }
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);