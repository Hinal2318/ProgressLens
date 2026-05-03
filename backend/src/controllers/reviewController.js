// backend/src/controllers/reviewController.js

exports.getSubmissionById = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("project", "title students")
      .populate("submittedBy", "name email");
    
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitReview = async (req, res) => {
  try {
    const { submissionId, status, facultyComment } = req.body;
    
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { status, facultyComment, reviewedAt: Date.now() },
      { new: true }
    );

    // Notify students via the activity logger
    await logActivity(
      req.user.id,
      submission.project,
      `Review completed for ${submission.phase}: ${status}`,
      "Review"
    );

    res.json({ message: "Review submitted! Students have been notified.", submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};