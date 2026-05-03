const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../utils/fileUpload");
const { createSubmission, getSubmissionsByProject ,reviewSubmission,getFacultyReviewInbox} = require("../controllers/submissionController");

router.post("/",protect, upload.single("file"), createSubmission);

router.get("/project/:projectId", protect, getSubmissionsByProject);
router.put("/:submissionId/review", protect, reviewSubmission);
router.get("/review-inbox", protect, getFacultyReviewInbox);
module.exports = router;