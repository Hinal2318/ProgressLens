const Milestone = require("../../models/Milestone");
const logActivity = require("../utils/logger");

const createMilestone = async (req, res) => {
  try {
    const { title, project, description, deadline } = req.body;

    const milestone = new Milestone({
      project,
      title,
      description,
      deadline,
      status: "Pending"
    });

    await milestone.save();

    await logActivity(
      req.user.id, 
      project, 
      `Added a new milestone: ${title}`, 
      "Milestone"
    );

    res.status(201).json({ message: "Milestone created! 🚀", milestone });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getProjectMilestones = async (req, res) => {
  try {
    const { projectId } = req.params; 
    const milestones = await Milestone.find({ project: projectId }).sort({ deadline: 1 });
    res.json(milestones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMilestoneStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const milestone = await Milestone.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!milestone) return res.status(404).json({ message: "Milestone not found" });

    await logActivity(
      req.user.id,
      milestone.project,
      `Updated milestone "${milestone.title}" status to ${status}`,
      "Milestone"
    );

    res.json(milestone);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createMilestone, getProjectMilestones, updateMilestoneStatus };