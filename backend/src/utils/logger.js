const Activity = require("../../models/Activity"); 

const logActivity = async (userId, projectId, action, type) => {
  try {
    const activity = new Activity({
      user: userId,
      project: projectId,
      action,
      message: action, // Use action as message since message is required in schema
      type,
      timestamp: new Date()
    });
    await activity.save();
  } catch (error) {
    console.error("Activity Logger Error:", error);
  }
};

module.exports = logActivity;