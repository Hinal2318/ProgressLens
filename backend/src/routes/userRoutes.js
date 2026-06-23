const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getUserProfile, updateUserProfile, deleteUserAccount } = require("../controllers/userController");

router.get("/me", protect, getUserProfile);
router.put("/profile-update", protect, updateUserProfile);
router.delete("/delete-account", protect, deleteUserAccount);

module.exports = router;