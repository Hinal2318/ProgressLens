const express = require("express");
const router = express.Router();

// 1. Import Middleware (Destructure properly)
const { protect, authorize } = require("../middleware/authMiddleware");
// 2. Import Controllers
const { getMyActivity, getFacultyActivity } = require("../controllers/activityController");

// 3. Define Routes
router.get("/my-activity", protect, getMyActivity); 

router.get("/faculty-activity", protect, authorize("faculty"), getFacultyActivity); 

module.exports = router;