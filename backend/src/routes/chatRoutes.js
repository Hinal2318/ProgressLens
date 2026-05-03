const express = require("express");
const router = express.Router();
const Chat = require("../../models/Chat");
const { protect } = require("../middleware/authMiddleware");

// Get messages for a specific project
router.get("/:projectId", protect, async (req, res) => {
  try {
    const messages = await Chat.find({ project: req.params.projectId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
});

module.exports = router;
