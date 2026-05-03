const mongoose = require("mongoose");

const DeadlineSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    default: "General", // e.g., "General", "Phase Submission", "Mid-term"
  }
}, { timestamps: true });

module.exports = mongoose.model("Deadline", DeadlineSchema);
