import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./FacultyReflections.css";

export default function FacultyReflections() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInputs, setFeedbackInputs] = useState({});

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
const res = await API.get("/faculty-reflections/faculty/all");      setReflections(res.data);
    } catch (err) {
      console.error("Error fetching reflections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbackInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmitFeedback = async (reflectionId) => {
    const feedback = feedbackInputs[reflectionId];
    if (!feedback) return alert("Please enter feedback before submitting.");

    try {
await API.post("/faculty-reflections/faculty/feedback", { reflectionId, feedback });      alert("Feedback Shared! ✅");
      fetchReflections(); // Refresh to update status
    } catch {
      alert("Error submitting feedback");
    }
  };

  if (loading) return <div className="loading">Syncing Student Insights...</div>;

  return (
    <div className="faculty-reflections-page">
      <div className="page-header">
        <h1>Student Reflections</h1>
        <p>View and respond to student learning reflections ({reflections.length})</p>
      </div>

      <div className="reflection-list">
        {reflections.length > 0 ? reflections.map((ref) => (
          <div key={ref._id} className="reflection-card">
            <div className="reflection-header">
              <div>
                <h3>{ref.project?.title}</h3>
                <p>{ref.submittedBy?.name} • {ref.phase} Reflection</p>
              </div>
              <span className={`status ${ref.status?.toLowerCase() || 'pending'}`}>
                {ref.status || "Pending"}
              </span>
            </div>

            <div className="reflection-body">
              <h4>Student Reflection</h4>
              <p>{ref.content}</p>
            </div>

            <div className="faculty-response">
              <label>Faculty Feedback</label>
              <textarea 
                placeholder="Write your feedback here..."
                value={ref.status === "Reviewed" ? ref.facultyFeedback : (feedbackInputs[ref._id] || "")}
                onChange={(e) => handleFeedbackChange(ref._id, e.target.value)}
                disabled={ref.status === "Reviewed"}
              ></textarea>
              
              <button 
                className={`submit-btn ${ref.status === "Reviewed" ? "disabled" : ""}`}
                onClick={() => handleSubmitFeedback(ref._id)}
                disabled={ref.status === "Reviewed"}
              >
                {ref.status === "Reviewed" ? "Reviewed" : "Submit Feedback"}
              </button>
            </div>
          </div>
        )) : <p className="empty-state">No reflections available to review.</p>}
      </div>
    </div>
  );
}