const Submission = require("../../models/Submission");
const Project = require("../../models/Project");
const logActivity = require("../utils/logger");
const mongoose = require("mongoose");

/**
 * ✅ CREATE Submission
 */
const createSubmission = async (req, res) => {
  try {
    const { 
      projectId, 
      phase, 
      githubLink, 
      demoLink, 
      liveUrl, 
      comments 
    } = req.body;

    // 1. Validate ID format
    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid Project ID format." });
    }

    // 2. Validate Phase Enum - Must match: Proposal, Mid-Evaluation, Final
    const validPhases = ['Proposal', 'Mid-Evaluation', 'Final'];
    if (!validPhases.includes(phase)) {
      return res.status(400).json({ 
        message: `Validation Error: '${phase}' is not a valid phase. Must be: Proposal, Mid-Evaluation, or Final.` 
      });
    }

    const filePath = req.file ? req.file.path : null;

    // 3. Create the New Submission Object
    const newSubmission = new Submission({
      project: projectId,
      submittedBy: req.user.id, 
      phase,
      githubLink: githubLink || "",
      demoLink: demoLink || "",
      liveUrl: liveUrl || "",
      filePath: filePath,
      comments: comments || ""
    });

    const savedSubmission = await newSubmission.save();

    // 4. Safe Activity Logging
    try {
      await logActivity(
        req.user.id, 
        projectId, 
        `Submitted ${phase} phase for review`, 
        "Milestone"
      );
    } catch (logError) {
      console.error("Non-fatal Activity Log Error:", logError.message);
    }

    res.status(201).json({ 
      message: "Work Submitted Successfully! 📤", 
      submission: savedSubmission 
    });

  } catch (error) {
    console.error("ACTUAL SERVER CRASH REASON:", error); 
    res.status(500).json({ 
      message: error.name === "ValidationError" ? `Database Error: ${error.message}` : "Internal Server Error" 
    });
  }
};

/**
 * ✅ GET Submissions by Project
 */
const getSubmissionsByProject = async (req, res) => {
  try {
    
    const { projectId } = req.params;
    const submissions = await Submission.find({ project: projectId });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Add this new function to your existing submissionController.js
const reviewSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { feedback, status } = req.body;

    // 1. Update the submission with faculty comments and new status
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { 
        comments: feedback, 
        status: status // e.g., 'Approved' or 'Revision Requested'
      },
      { new: true }
    );

    // 2. Log activity so the student knows their work was reviewed
    try {
      await logActivity(
        req.user.id, 
        updatedSubmission.project, 
        `Faculty reviewed ${updatedSubmission.phase}: ${status}`, 
        "Review"
      );
    } catch (logErr) {
      console.error("Non-fatal log error:", logErr.message);
    }

    res.json({ message: "Review submitted successfully!", updatedSubmission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFacultyReviewInbox = async (req, res) => {
  try {
    // 1. Ensure models are imported (at the top of the file usually)
    const Project = require("../../models/Project");
    const Submission = require("../../models/Submission");

    // 2. Find all projects assigned to this faculty member
    const myProjects = await Project.find({ faculty: req.user.id });
    
    // If no projects are found, return empty array
    if (!myProjects || myProjects.length === 0) {
      return res.json([]);
    }

    const projectIds = myProjects.map(p => p._id);

    const inbox = await Submission.find({ 
      project: { $in: projectIds },
      status: { $in: ["Pending", "Pending Review", "Revision Requested"] } 
    })
    .populate("project", "title")
    .populate("submittedBy", "name email")
    .sort({ createdAt: 1 }); 

    res.json(inbox);
  } catch (error) {
    console.error("Inbox Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createSubmission,
  getSubmissionsByProject,
   reviewSubmission ,
    getFacultyReviewInbox 
};