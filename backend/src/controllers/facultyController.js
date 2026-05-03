const Project = require("../../models/Project");
const Submission = require("../../models/Submission");
const Announcement = require("../../models/Announcement");
const User = require("../../models/User");
const Deadline = require("../../models/Deadline");

exports.getFacultyDashboardData = async (req, res) => {
  try {
    const facultyId = req.user.id;

    // 1. Get projects supervised by this faculty
    const projects = await Project.find({ faculty: facultyId })
      .populate("students", "name email")
      .sort({ createdAt: -1 });

    const projectIds = projects.map(p => p._id);

    // 2. Aggregate Stats
    const [totalStudents, pendingSubmissions] = await Promise.all([
      Project.distinct("students", { faculty: facultyId }),
      Submission.countDocuments({
        project: { $in: projectIds },
        status: "Pending"
      })
    ]);

    // 3. Count At-Risk (Projects with status 'At Risk' or 'Needs Attention')
    const atRiskCount = projects.filter(p => 
      p.status === "At Risk" || p.status === "Needs Attention"
    ).length;

    res.json({
      stats: {
        totalProjects: projects.length,
        pendingReviews: pendingSubmissions,
        totalStudents: totalStudents.length,
        atRiskProjects: atRiskCount
      },
      projects: projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.updateFacultyProfile = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    // 1. Update the user and return the new document
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, department }, 
      { new: true, runValidators: true } 
    ).select("-password"); 

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Profile updated!",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, score, feedback } = req.body;

    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { status, score, feedback },
      { new: true }
    ).populate("project");

    if (!submission) return res.status(404).json({ message: "Submission not found" });

    if (status === "Approved") {
      const project = await Project.findById(submission.project._id);
      if (submission.phase === "Proposal") project.currentPhase = "Mid-Evaluation";
      else if (submission.phase === "Mid-Evaluation") project.currentPhase = "Final";
      await project.save();
    }

    res.json({ message: `Submission ${status}!`, submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.postAnnouncement = async (req, res) => {
  try {
    const { title, content, project, type } = req.body;
    const announcement = new Announcement({
      title,
      content,
      project,
      type,
      faculty: req.user.id
    });

    await announcement.save();

    const io = req.app.get('io');
    if (project) {
      io.to(project.toString()).emit("new_announcement", announcement);
    } else {
      io.emit("new_announcement", announcement);
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDeadline = async (req, res) => {
  try {
    const { title, date, type } = req.body;
    if (!title || !date) return res.status(400).json({ message: "Title and date are required." });

    const deadline = await Deadline.create({
      title,
      date,
      type: type || "General",
      faculty: req.user.id
    });

    res.status(201).json(deadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeadlines = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ faculty: req.user.id }).sort({ date: 1 });
    res.json(deadlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
