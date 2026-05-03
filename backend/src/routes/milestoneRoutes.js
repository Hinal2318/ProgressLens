const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createMilestone, getProjectMilestones, updateMilestoneStatus } = require("../controllers/milestoneController");

router.post("/", protect, createMilestone);
router.get("/project/:projectId", protect, getProjectMilestones);
router.put("/:id/status", protect, updateMilestoneStatus);

module.exports = router;