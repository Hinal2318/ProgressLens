const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");


const { 
  getFacultyReflections, 
  submitReflectionFeedback 
} = require("../controllers/reflectionController");

/**
 * FACULTY-SPECIFIC ROUTES
 */


router.get("/faculty/all", protect, getFacultyReflections);
router.post("/faculty/feedback", protect, submitReflectionFeedback);

module.exports = router;