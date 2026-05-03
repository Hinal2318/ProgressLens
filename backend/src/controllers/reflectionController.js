// D:\MERN\progresslens\backend\src\controllers\reflectionController.js

const Reflection = require("../../models/Reflection");
const Project = require("../../models/Project");
const logActivity = require("../utils/logger"); 

/**
 * STUDENT: Create a reflection
 */
const createReflection = async (req, res) => {
  try {
    const { projectId, phase, content } = req.body;
    
    if (!projectId) return res.status(400).json({ message: "Project ID is required" });

    const reflection = new Reflection({
      project: projectId,
      submittedBy: req.user.id,
      phase: phase || "General",
      content,
      status: "Pending"
    });

    await reflection.save();

    if (typeof logActivity === 'function') {
        await logActivity(req.user.id, projectId, `submitted a reflection for ${phase || 'General'}`, "Reflection");
    }

    res.status(201).json({ message: "Reflection submitted successfully", reflection });
  } catch (error) {
    console.error("POST Reflection Error:", error); 
    res.status(500).json({ message: error.message });
  }
};

/**
 * STUDENT: Get reflections for a project
 */
const getReflectionsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const reflections = await Reflection.find({ project: projectId })
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(reflections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * FACULTY: Get all reflections for supervised projects
 */
const getFacultyReflections = async (req, res) => {
  try {
    const facultyId = req.user.id;
    // Find projects where THIS faculty is assigned
    const projects = await Project.find({ faculty: facultyId }).select("_id");
    const projectIds = projects.map(p => p._id);

    const reflections = await Reflection.find({ project: { $in: projectIds } })
      .populate("project", "title")
      .populate("submittedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(reflections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * FACULTY: Submit feedback
 */
const submitReflectionFeedback = async (req, res) => {
  try {
    const { reflectionId, feedback } = req.body;
    const reflection = await Reflection.findByIdAndUpdate(
      reflectionId,
      { facultyFeedback: feedback, status: "Reviewed", reviewedAt: Date.now() },
      { new: true }
    ).populate("project", "title");

    if (!reflection) return res.status(404).json({ message: "Reflection not found" });

    if (typeof logActivity === 'function') {
        await logActivity(req.user.id, reflection.project._id, `reviewed the reflection for project: ${reflection.project.title}`, "Reflection");
    }

    res.json({ message: "Feedback submitted successfully", reflection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions so the Route file can find them
module.exports = {
  createReflection,
  getReflectionsByProject,
  getFacultyReflections,
  submitReflectionFeedback
};