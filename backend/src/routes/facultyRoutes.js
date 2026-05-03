const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Project = require("../../models/Project"); 

const { getFacultyDashboardData, reviewSubmission, postAnnouncement, createDeadline, getDeadlines } = require("../controllers/facultyController");
const { getDeptAnalytics } = require("../controllers/analyticsController");
const { 
  getFacultySupervisedProjects, 
  getFacultyProjectsHealth 
} = require("../controllers/facultyProjectController");
const { getFacultyProfile, updateUserProfile } = require("../controllers/userController");
const { updateFacultyProfile } = require("../controllers/facultyController");

router.get("/dashboard", protect, getFacultyDashboardData);
router.get("/analytics", protect, authorize("faculty"), getDeptAnalytics);
router.patch("/review/:submissionId", protect, authorize("faculty"), reviewSubmission);
router.post("/announcements", protect, authorize("faculty"), postAnnouncement);
router.get("/supervised-projects", protect, getFacultySupervisedProjects);
router.get("/health", protect, getFacultyProjectsHealth);
router.get("/profile-data", protect, getFacultyProfile);
router.put("/profile-update", protect, updateUserProfile);
router.put("/profile-update", protect, authorize("faculty"), updateFacultyProfile);

// Deadline Routes
router.post("/deadlines", protect, authorize("faculty"), createDeadline);
router.get("/deadlines", protect, authorize("faculty"), getDeadlines);
router.put("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status is provided
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Route Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;