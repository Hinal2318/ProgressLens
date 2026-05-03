const nodemailer = require("nodemailer");
const Task = require("../models/Task");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your_email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_app_password'
  }
});

const sendDeadlineReminders = async () => {
  try {
    const fortyEightHoursFromNow = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const tasks = await Task.find({
      dueDate: { $lte: fortyEightHoursFromNow, $gt: new Date() },
      status: { $ne: "Done" }
    }).populate("owner");

    for (const task of tasks) {
      const mailOptions = {
        from: '"ProgressLens Reminders" <reminders@progresslens.com>',
        to: task.owner.email,
        subject: `⚠️ Deadline Approaching: ${task.title}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Task Deadline Reminder</h2>
            <p>Hello <strong>${task.owner.name}</strong>,</p>
            <p>This is a reminder that your task <strong>"${task.title}"</strong> is due in less than 48 hours.</p>
            <p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleString()}</p>
            <hr />
            <p>Log in to <a href="http://localhost:5174">ProgressLens</a> to update your progress.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reminder sent to ${task.owner.email} for task ${task.title}`);
    }
  } catch (error) {
    console.error("Reminder Service Error:", error);
  }
};

module.exports = { sendDeadlineReminders };
