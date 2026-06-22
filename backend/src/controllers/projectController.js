const Project = require("../../models/Project");
const Task = require("../../models/Task");
const User = require("../../models/User");
const logActivity = require("../utils/logger");

// GET all projects (Admin/Debug)
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("faculty students", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET projects for logged-in user
const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [{ students: userId }, { faculty: userId }] 
    }).populate("faculty students", "name email");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single project — single source of truth for progress & status
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("faculty", "name email")
      .populate("students", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Compute live progress from tasks (same formula used everywhere)
    const tasks = await Task.find({ project: project._id });
    const completedCount = tasks.filter(t => t.status === "Done").length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    res.json({ ...project._doc, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE Project (Corrected Logic Order)
const createProject = async (req, res) => {
  try {
    const { title, semester, facultyEmail, studentEmails, description } = req.body;

    // 1. Validate Team Size (Max 4 students allowed)
    const emailList = Array.isArray(studentEmails) 
      ? studentEmails 
      : (studentEmails ? studentEmails.split(',').map(e => e.trim()).filter(e => e) : []);

    if (emailList.length > 4) {
      return res.status(400).json({ message: "⚠️ Maximum 4 team members allowed." });
    }

    // 2. Find Faculty ID
    if (!facultyEmail) {
      return res.status(400).json({ message: "Faculty email is required." });
    }
    const facultyUser = await User.findOne({ email: facultyEmail });
    if (!facultyUser) return res.status(400).json({ message: `Faculty email ${facultyEmail} not found` });
    const facultyId = facultyUser._id;

    // 3. Find Student IDs
    let studentIds = [req.user.id]; // Always include the creator
    if (emailList.length > 0) {
      const foundStudents = await User.find({ email: { $in: emailList } });
      const foundIds = foundStudents.map(s => s._id);
      
      // Merge creator ID with invited IDs and remove duplicates
      studentIds = [...new Set([...studentIds, ...foundIds.map(id => id.toString())])];
    }

    // 4. Create the Project Object FIRST
    const project = new Project({
      title,
      semester,
      description,
      faculty: facultyId,
      students: studentIds,
      creator: req.user.id,
      status: "In Progress"
    });

    // 5. Save to Database
    const savedProject = await project.save();

    // 6. Log Activity AFTER successful save
    await logActivity(
      req.user.id, 
      savedProject._id, 
      `Created new project: "${savedProject.title}"`, 
      "Project"
    );

    res.status(201).json(savedProject);

  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// DELETE Project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Project
const updateProject = async (req, res) => {
  try {
    const { title, semester, description } = req.body;
    const updated = await Project.findByIdAndUpdate(
      req.params.id, 
      { title, semester, description }, 
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// INVITE Teammate to existing project
const inviteTeammate = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    // Check if user exists
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) return res.status(404).json({ message: `Student with email ${email} not found` });

    // Check if already in project
    if (project.students.includes(invitedUser._id)) {
      return res.status(400).json({ message: "User is already a team member" });
    }

    // Limit to 4 members
    if (project.students.length >= 4) {
      return res.status(400).json({ message: "Maximum 4 members allowed per project" });
    }

    project.students.push(invitedUser._id);
    await project.save();

    await logActivity(
      req.user.id, 
      project._id, 
      `Invited ${invitedUser.name} to the project`, 
      "Project"
    );

    res.json({ message: "User invited successfully", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getMyProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProject,
  inviteTeammate
};