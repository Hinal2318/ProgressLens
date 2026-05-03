const mongoose = require("mongoose");

const reflectionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    submittedBy: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    phase: { 
      type: String,
      required: true,
    },
    content: { 
      type: String,
      required: true,
    },
    facultyFeedback: { 
      type: String,
      default: "",
    },
    status: { 
      type: String, 
      enum: ["Pending", "Reviewed"], 
      default: "Pending" 
    },
    reviewedAt: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reflection", reflectionSchema);