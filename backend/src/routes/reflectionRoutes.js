
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const { 
  createReflection, 
  getReflectionsByProject, 
  getFacultyReflections,
  submitReflectionFeedback // Use this name consistently
} = require("../controllers/reflectionController");


router.post("/", protect, createReflection); 
router.get("/project/:projectId", protect, getReflectionsByProject);

/**
 * FACULTY ROUTES
 */
router.get("/faculty/all", protect, authorize("faculty"), getFacultyReflections);
router.post("/faculty/feedback", protect, authorize("faculty"), submitReflectionFeedback);

module.exports = router;