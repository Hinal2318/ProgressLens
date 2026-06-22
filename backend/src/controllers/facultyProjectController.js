const Project = require("../../models/Project");
const Task = require("../../models/Task");

const getFacultyProjectsHealth = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const projects = await Project.find({ faculty: facultyId });

    const healthData = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "Done").length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const status = project.status || "On Track";

        return {
          _id: project._id,
          name: project.title,
          status,
          progress
        };
      })
    );
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD THIS MISSING FUNCTION
const getFacultySupervisedProjects = async (req, res) => {
  try {
    const projects = await Project.find({ faculty: req.user.id })
      .populate("students", "name email");
      
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const completedCount = tasks.filter(t => t.status === "Done").length;
        const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
        
        return {
          ...project._doc,
          progress
        };
      })
    );
      
    res.json(projectsWithProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFacultyProjectsHealth,
  getFacultySupervisedProjects 
};