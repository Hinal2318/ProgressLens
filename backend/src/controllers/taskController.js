const Task = require("../../models/Task");
const logActivity = require("../utils/logger");

// ✅ GET Tasks by Project
const getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate("owner", "name email")
            .sort({ createdAt: -1 }); 
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ CREATE Task (Consolidated & Standardized)
const createTask = async (req, res) => {
    try {
        const { title, project, date, dueDate, ownerId, priority } = req.body;

        // Ensure we handle the date correctly as dueDate
        const task = new Task({
            title,
            project,
            dueDate: dueDate || date, 
            owner: ownerId || req.user.id,
            status: "To Do",
            priority: priority || "Medium"
        });

        const savedTask = await task.save();

        // ✅ Use the centralized logger helper
        await logActivity(
            req.user.id, 
            project, 
            `Added new task: "${title}"`, 
            "Task"
        );

        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Task Creation Error:", error);
        res.status(400).json({ message: error.message });
    }
};

// ✅ UPDATE Task Status (Specific for toggle/checkbox)
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.taskId, 
            { status }, 
            { new: true }
        );
        
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Optional: Log when a task is completed
        if (status === "Done") {
            await logActivity(req.user.id, task.project, `Completed task: "${task.title}"`, "Task");
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ UPDATE Task (General editing)
const updateTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.taskId, 
            req.body, 
            { new: true }
        );
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ DELETE Task
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ message: "Task not found" });
        
        await Task.findByIdAndDelete(req.params.taskId);
        
        // Log task deletion
        await logActivity(
            req.user.id, 
            task.project, 
            `Deleted task: "${task.title}"`, 
            "Task"
        );
        
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getTasksByProject, 
    createTask, 
    updateTaskStatus, 
    deleteTask, 
    updateTask 
};