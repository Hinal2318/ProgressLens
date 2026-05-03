const Activity = require("../../models/Activity");
const Project = require("../../models/Project");

const getMyActivity = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id }) 
      .populate("project", "title") 
      .sort({ timestamp: -1 }) 
      .limit(20); 
    res.json(activities); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFacultyActivity = async (req, res) => {
  try {
    const supervisedProjects = await Project.find({ faculty: req.user.id }).select("_id");
    const projectIds = supervisedProjects.map(p => p._id);

    const activities = await Activity.find({ project: { $in: projectIds } })
      .populate("project", "title")
      .populate("user", "name role") 
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch activity feed" });
  }
};
module.exports = { 
  getMyActivity, 
  getFacultyActivity 
};