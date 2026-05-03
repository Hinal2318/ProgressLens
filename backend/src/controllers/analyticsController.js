const Project = require("../../models/Project");
const Submission = require("../../models/Submission");
const Task = require("../../models/Task");

exports.getDeptAnalytics = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const projects = await Project.find({ faculty: facultyId });
    const projectIds = projects.map(p => p._id);

    const submissionStats = await Submission.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$phase", count: { $sum: 1 } } }
    ]);

    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Calculate Dynamic Avg Completion
    const totalTasks = allTasks.length;
    const totalDone = allTasks.filter(t => t.status === "Done" || t.status === "Completed").length;
    const avgCompletion = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

    // Calculate Completion Trend (last 6 months dynamically)
    // To keep it simple but dynamic, we'll group completed tasks by month
    const completionTrend = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = monthNames[d.getMonth()];
      
      const countInMonth = allTasks.filter(t => {
        if ((t.status !== "Done" && t.status !== "Completed") || !t.updatedAt) return false;
        const taskDate = new Date(t.updatedAt);
        return taskDate.getMonth() === d.getMonth() && taskDate.getFullYear() === d.getFullYear();
      }).length;

      completionTrend.push({ name: monthStr, tasks: countInMonth });
    }

    const healthStats = {
      good: projects.filter(p => !p.status || p.status === 'On Track').length,
      warning: projects.filter(p => p.status === 'Needs Attention').length,
      danger: projects.filter(p => p.status === 'At Risk').length
    };

    res.json({
      submissionStats,
      completionTrend,
      healthStats,
      avgCompletion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;

    // 1. Task Statistics
    const tasks = await Task.find({ project: projectId }).populate("owner", "name");
    const taskStats = {
      total: tasks.length,
      done: tasks.filter(t => t.status === "Done").length,
      inProgress: tasks.filter(t => t.status === "In Progress").length,
      todo: tasks.filter(t => t.status === "To Do").length
    };

    // 2. Member Contributions
    const memberMap = {};
    tasks.forEach(t => {
      const ownerName = t.owner?.name || "Unassigned";
      if (!memberMap[ownerName]) memberMap[ownerName] = { name: ownerName, completed: 0, total: 0 };
      memberMap[ownerName].total++;
      if (t.status === "Done") memberMap[ownerName].completed++;
    });
    const memberStats = Object.values(memberMap);

    // 3. Focus Areas (Members with most pending tasks)
    const focusAreas = memberStats
      .map(m => ({ ...m, pending: m.total - m.completed }))
      .sort((a, b) => b.pending - a.pending)
      .slice(0, 3);

    // 4. Submission Health
    const submissions = await Submission.find({ project: projectId });
    const submissionHealth = ["Proposal", "Mid-Evaluation", "Final"].map(phase => {
      const sub = submissions.find(s => s.phase === phase);
      return {
        phase,
        status: sub ? sub.status : "Pending",
        isDone: sub && sub.status === "Approved"
      };
    });

    res.json({
      taskStats,
      memberStats,
      focusAreas,
      submissionHealth,
      completionRate: tasks.length > 0 ? Math.round((taskStats.done / tasks.length) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
