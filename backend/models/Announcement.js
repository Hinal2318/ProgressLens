const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Optional: specific to one project
  type: { type: String, enum: ['General', 'Deadline', 'Update'], default: 'General' }
}, { timestamps: true });

module.exports = mongoose.model("Announcement", announcementSchema);
