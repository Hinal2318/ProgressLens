const Project = require("../../models/Project");
const Task = require("../../models/Task");
const Milestone = require("../../models/Milestone");
const Announcement = require("../../models/Announcement");

exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.find({ students: userId })
      .populate("faculty", "name email")
      .populate("students", "name email");

    const tasks = await Task.find({ owner: userId });
    const completedTasks = tasks.filter(t => t.status === "Completed").length;

    const projectIds = projects.map(p => p._id);
    const milestones = await Milestone.find({ project: { $in: projectIds } });
    const pendingMilestones = milestones.filter(m => m.status === "Pending").length;

    const projectsWithProgress = await Promise.all(projects.map(async (project) => {
      const allTasks = await Task.find({ project: project._id });
      const completedCount = allTasks.filter(t => t.status === "Completed").length;
      const progress = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;
      
      return {
        ...project._doc,
        progress,
        // status is already in project._doc from the DB — no override needed
      };
    }));

    // 5. Get Announcements (General + Project Specific)
    // Using a more robust query to handle null/undefined project field
    const announcements = await Announcement.find({
      $or: [
        { project: { $exists: false } },
        { project: null },
        { project: { $in: projectIds } }
      ]
    }).populate("faculty", "name").sort({ createdAt: -1 });

    console.log(`Found ${announcements.length} announcements for student ${userId}`);

    res.json({
      projects: projectsWithProgress,
      totalProjects: projects.length,
      completedTasks,
      pendingMilestones,
      health: projects.length > 0 ? "On Track" : "N/A",
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.createTestProject = async (req, res) => {
  try {
    const newProject = new Project({
      title: "AI Research System (Test)",
      semester: 6,
      students: [req.user.id],
      faculty: req.user.id, 
      status: "In Progress"
    });

    await newProject.save();
    res.json({ message: "Test Project Created!", project: newProject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("students", "name email") 
      .populate("faculty", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};