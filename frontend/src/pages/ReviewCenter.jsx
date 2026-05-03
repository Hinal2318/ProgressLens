import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";
import { CheckCircle2, XCircle, Clock, ExternalLink, FileText, Send, User, Github, Search as FileSearch } from "lucide-react";
import "./ReviewCenter.css";

export default function ReviewCenter() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [reviewForm, setReviewForm] = useState({ score: "", feedback: "" });

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/submissions/review-inbox");
      setSubmissions(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status) => {
    if (!selectedSub) return;
    try {
      await API.patch(`/faculty/review/${selectedSub._id}`, {
        status,
        score: reviewForm.score,
        feedback: reviewForm.feedback
      });
      alert(`Submission ${status}!`);
      setSelectedSub(null);
      fetchSubmissions();
    } catch (error) {
      alert("Failed to update submission.");
    }
  };

  if (loading) return <div className="loading-screen">Loading Review Inbox...</div>;

  return (
    <div className="review-center">
      <header className="page-header">
        <h1>Review Center</h1>
        <p>Assess student submissions and provide feedback</p>
      </header>

      <div className="review-layout">
        {/* SUBMISSION LIST */}
        <div className="submission-list card">
          <h3>Pending Inbox ({submissions.length})</h3>
          <div className="list-items">
            {submissions.length === 0 ? (
              <p className="empty-text">Inbox Zero! No pending reviews. 🎉</p>
            ) : (
              submissions.map(sub => (
                <div 
                  key={sub._id} 
                  className={`sub-item ${selectedSub?._id === sub._id ? "active" : ""}`}
                  onClick={() => setSelectedSub(sub)}
                >
                  <div className="sub-info">
                    <strong>{sub.project?.title}</strong>
                    <span>{sub.phase} Phase</span>
                  </div>
                  <Clock size={16} color="var(--text-muted)" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* REVIEW PANEL */}
        <div className="review-panel card">
          {selectedSub ? (
            <div className="panel-content">
              <div className="panel-header">
                <h2>{selectedSub.project?.title}</h2>
                <span className="phase-badge">{selectedSub.phase} Submission</span>
              </div>

              <div className="submission-details">
                <div className="detail-row">
                  <User size={16} />
                  <span>Submitted by: <strong>{selectedSub.submittedBy?.name}</strong></span>
                </div>
                <div className="links-grid">
                  {selectedSub.githubLink && (
                    <a href={selectedSub.githubLink} target="_blank" rel="noreferrer" className="link-btn">
                      <Github size={16} /> GitHub
                    </a>
                  )}
                  {selectedSub.demoLink && (
                    <a href={selectedSub.demoLink} target="_blank" rel="noreferrer" className="link-btn">
                      <ExternalLink size={16} /> Demo
                    </a>
                  )}
                </div>
              </div>

              <div className="grading-section">
                <label>Score (0-100)</label>
                <input 
                  type="number" 
                  value={reviewForm.score} 
                  onChange={e => setReviewForm({...reviewForm, score: e.target.value})}
                  placeholder="Enter score..."
                />
                
                <label>Written Feedback</label>
                <textarea 
                  rows="4" 
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm({...reviewForm, feedback: e.target.value})}
                  placeholder="Provide detailed feedback..."
                />

                <div className="action-buttons">
                  <button className="btn btn-success" onClick={() => handleReview("Approved")}>
                    <CheckCircle2 size={18} /> Approve & Unlock Next Phase
                  </button>
                  <button className="btn btn-error" onClick={() => handleReview("Rejected")}>
                    <XCircle size={18} /> Request Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-panel">
              <FileSearch size={48} />
              <p>Select a submission from the inbox to start reviewing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
