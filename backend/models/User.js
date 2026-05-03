const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["student", "faculty"],
      default: "student"
    },
    department: { 
      type: String, 
      default: ""
     },
    semester: { type: Number, min: 1, max: 8 }  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
