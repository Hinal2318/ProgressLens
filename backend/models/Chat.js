const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [{
      name: String,
      url: String
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Chat", chatSchema);
