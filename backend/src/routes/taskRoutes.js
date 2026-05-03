const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
    getTasksByProject,
    createTask,
    updateTaskStatus,
    deleteTask,
    updateTask
} = require("../controllers/taskController");


const { upload } = require("../config/cloudinary");

router.get("/project/:projectId", protect, getTasksByProject);
// Create task (Protected)
router.post("/", protect, createTask);

// Update task status (Protected)
router.patch("/:taskId/status",protect, updateTaskStatus);

// File Upload for Task
router.post("/:taskId/upload", protect, upload.single("file"), async (req, res) => {
    try {
        const Task = require("../../models/Task");
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.attachments.push({
            name: req.file.originalname,
            url: req.file.path,
            type: req.file.mimetype
        });

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:taskId", protect, deleteTask);
router.put("/:taskId", protect, updateTask);

module.exports = router;