const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { 
  getSubmissionById, 
  getPendingSubmissions, 
  reviewSubmission 
} = require("../controllers/submissionController");



router.get("/pending", protect, getPendingSubmissions);

router.get("/:id", protect, getSubmissionById);

router.put("/:id/review", protect, reviewSubmission);

module.exports = router;