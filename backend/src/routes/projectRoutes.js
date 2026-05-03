// backend/src/routes/projectRoutes.js
const express = require("express");
const router = express.Router();

// ✅ FIX 1: Destructure protect and authorize from the middleware object
const { protect, authorize } = require("../middleware/authMiddleware");

// 🟢 Import Project model for the status update route
const Project = require("../../models/Project");

// ✅ FIX 2: Import the specific faculty controller functions
const {
    getFacultyProjectsHealth,
    getFacultySupervisedProjects
} = require("../controllers/facultyProjectController");

// ✅ FIX 3: Import standard project controllers
const {
    getMyProjects,
    getProjects,
    getProjectById,
    createProject,
    deleteProject, 
    updateProject,
    inviteTeammate
} = require("../controllers/projectController");

// --- 📈 FACULTY SPECIFIC ROUTES ---

router.post("/:id/invite", protect, inviteTeammate);

// 🚩 THIS WAS LINE 21: Now it uses valid functions!
router.get("/supervised-projects", protect, authorize("faculty"), getFacultySupervisedProjects);

router.get("/health-monitor", protect, authorize("faculty"), getFacultyProjectsHealth);

router.get("/", protect, getProjects);
router.get("/my-projects", protect, getMyProjects);
router.get("/:id", protect, getProjectById);

router.post("/", protect, createProject);
router.delete("/:id", protect, deleteProject);
router.put("/:id", protect, updateProject);

const Activity = require("../../models/Activity");


router.put("/:id/status", protect, authorize("faculty"), async (req, res) => {
    try {
        const { status } = req.body;
        
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true } 
        );

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        await Activity.create({
            user: req.user.id, 
            project: project._id,
            message: `You updated the status to "${status}" for project: ${project.title}`,
            type: 'Review'
        });

        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;