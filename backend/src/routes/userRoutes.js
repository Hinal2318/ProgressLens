const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserProfile } = require("../controllers/userController");
const { updateUserProfile } = require("../controllers/userController");

router.get("/me", protect, getUserProfile);
router.put("/profile-update", protect, updateUserProfile);

module.exports = router;