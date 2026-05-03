const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  title: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Completed", "At-Risk"], 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Milestone", milestoneSchema);