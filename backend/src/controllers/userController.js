const User = require("../../models/User"); 
const Project = require("../../models/Project");
const Task = require("../../models/Task");
const Milestone = require("../../models/Milestone");
const Submission = require("../../models/Submission");

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const totalProjects = await Project.countDocuments({ students: userId });
    const completedTasks = await Task.countDocuments({ owner: userId, status: "Done" });
    const pendingMilestones = await Milestone.countDocuments({ 
      student: userId, 
      status: { $ne: "Reviewed" } 
    });

    res.json({
      user,
      stats: { totalProjects, completedTasks, pendingMilestones, semester: user.semester || "N/A" }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};


// 1. Get Faculty Profile with dynamic stats
exports.getFacultyProfile = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const user = await User.findById(facultyId).select("-password");

    // Fetch projects supervised by this faculty
    const projects = await Project.find({ faculty: facultyId });
    const projectIds = projects.map(p => p._id);

    // Aggregate real-time stats
    const [totalStudents, pendingReviews] = await Promise.all([
      Project.distinct("students", { faculty: facultyId }),
      Submission.countDocuments({ project: { $in: projectIds }, status: "Pending" })
    ]);

    res.json({
      user,
      stats: {
        projectsSupervised: projects.length,
        totalStudents: totalStudents.length,
        pendingReviews: pendingReviews,
        department: user.department || "Not Set"
      }
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// 2. Update Profile Information (Universal for Faculty/Student)
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, email, department, semester } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, department, semester }, 
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated! ✅", user: updatedUser });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: "Email exists" });
    res.status(500).json({ message: error.message });
  }
};