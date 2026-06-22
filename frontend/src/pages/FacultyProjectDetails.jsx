import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, BarChart2, CheckCircle, Clock, AlertCircle, FileText, Link as LinkIcon, Check, X } from "lucide-react";
import "./FacultyProjectDetails.css";

export default function FacultyProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes, subRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get(`/tasks/project/${id}`),
          API.get(`/submissions/project/${id}`)
        ]);
        setProject(projRes.data);
        setTasks(taskRes.data);
        setSubmissions(subRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReview = async (submissionId, reviewStatus) => {
    const feedback = feedbackMap[submissionId];
    if (!feedback?.trim()) return alert("Guidance notes are required.");
    try {
      await API.put(`/submissions/${submissionId}/review`, { 
        feedback, 
        status: reviewStatus 
      });
      alert(`Status: ${reviewStatus}`);
      setSubmissions(submissions.map(s => 
        s._id === submissionId ? { ...s, status: reviewStatus, comments: feedback } : s
      ));
    } catch {
      alert("Submission failed.");
    }
  };
  // Inside FacultyProjectDetails component

// FacultyProjectDetails.jsx

const handleStatusUpdate = async (newStatus) => {
  try {
    const response = await API.put(`/projects/${id}/status`, { status: newStatus });
    if (response.data) {
      setProject((prev) => ({ ...prev, status: newStatus }));
      alert(`Success: Project is now "${newStatus}"`);
    }
  } catch (err) {
    console.error("Status Update Error:", err);
    alert("Failed to update status. Make sure the backend is running.");
  }
};
  // Use progress returned directly from the API (same source as student view)
  const progress = project?.progress ?? 0;
  const totalTasks = tasks.length;
  const finishedTasks = tasks.filter(t => t.status === "Done").length;

  if (loading) return <div className="fp-loading"><span>Syncing Academic Data...</span></div>;

  return (
    <div className="fp-page">
      <div className="fp-bg-blur"></div>

      {/* HEADER SECTION */}
      <header className="fp-header">
        <div className="fp-header-left">
          <button onClick={() => navigate(-1)} className="fp-back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="fp-title-area">
            <h1>{project?.title}</h1>
            <span>Semester {project?.semester} • {project?.status || "In Progress"}</span>
          </div>
        </div>
        <div className="fp-header-actions">
          <div className="fp-status-toggles">
            <button className={`status-btn on-track ${project?.status === 'On Track' ? 'active' : ''}`} onClick={() => handleStatusUpdate("On Track")}>
              <CheckCircle size={16} /> Set On Track
            </button>
            <button className={`status-btn attention ${project?.status === 'Needs Attention' ? 'active' : ''}`} onClick={() => handleStatusUpdate("Needs Attention")}>
              <AlertCircle size={16} /> Needs Attention
            </button>
            <button className={`status-btn risk ${project?.status === 'At Risk' ? 'active' : ''}`} onClick={() => handleStatusUpdate("At Risk")}>
              <AlertCircle size={16} /> Mark Risk
            </button>
          </div>
          <button 
            className="fp-btn-intelligence" 
            onClick={() => navigate(`/project/${id}/analytics`)}
          >
            <BarChart2 size={18} /> Project Intelligence
          </button>
        </div>
      </header>

      <div className="fp-layout">
        {/* LEFT COLUMN: OVERVIEW */}
        <div className="fp-column-left">
          {/* STATS GRID */}
          <div className="fp-stats-grid">
            <div className="fp-stat-card card-glass">
              <div className="stat-icon progress"><BarChart2 size={24} /></div>
              <div className="stat-data">
                <h3>{progress}%</h3>
                <span>Overall Progress</span>
              </div>
            </div>
            <div className="fp-stat-card card-glass">
              <div className="stat-icon total"><CheckCircle size={24} /></div>
              <div className="stat-data">
                <h3>{totalTasks}</h3>
                <span>Total Tasks</span>
              </div>
            </div>
            <div className="fp-stat-card card-glass">
              <div className="stat-icon pending"><Clock size={24} /></div>
              <div className="stat-data">
                <h3>{totalTasks - finishedTasks}</h3>
                <span>Tasks Pending</span>
              </div>
            </div>
          </div>

          {/* TEAM ROSTER */}
          <div className="fp-roster-section card-glass">
            <h3>Team Roster</h3>
            <div className="fp-roster-list">
              {project?.students?.map(student => (
                <div key={student._id} className="fp-roster-item">
                  <div className="roster-avatar">
                    {student.name.charAt(0)}
                  </div>
                  <div className="roster-info">
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SUBMISSIONS */}
        <div className="fp-column-right">
          <div className="fp-submissions-header">
            <h2>Phase Submissions</h2>
            <span className="badge">{submissions.length} Total</span>
          </div>

          <div className="fp-submissions-feed">
            {submissions.length === 0 ? (
              <div className="fp-empty-state card-glass">
                <FileText size={48} className="empty-icon" />
                <p>No submissions found for this project yet.</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div key={sub._id} className="fp-submission-card card-glass">
                  <div className="sub-header">
                    <div className="sub-title">
                      <h3>{sub.phase} Phase</h3>
                      <span className={`sub-status ${sub.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                        {sub.status}
                      </span>
                    </div>
                    <div className="sub-links">
                      {sub.githubLink && (
                        <a href={sub.githubLink} target="_blank" rel="noreferrer" className="asset-link github">
                          <LinkIcon size={16} /> GitHub
                        </a>
                      )}
                      {sub.filePath && (
                        <a href={`http://localhost:5000/uploads/${sub.filePath.split(/[\\\\/]/).pop()}`} target="_blank" rel="noreferrer" className="asset-link doc">
                          <FileText size={16} /> Document
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="sub-feedback">
                    <label>Feedback & Guidance</label>
                    <textarea 
                      placeholder="Enter academic feedback or guidance notes here..."
                      value={feedbackMap[sub._id] !== undefined ? feedbackMap[sub._id] : (sub.comments || "")}
                      onChange={(e) => setFeedbackMap({ ...feedbackMap, [sub._id]: e.target.value })}
                    />
                  </div>

                  {(!sub.status || sub.status === "Pending Review") && (
                    <div className="sub-actions">
                      <button className="btn-approve" onClick={() => handleReview(sub._id, "Approved")}>
                        <Check size={18} /> Approve Phase
                      </button>
                      <button className="btn-reject" onClick={() => handleReview(sub._id, "Revision Requested")}>
                        <X size={18} /> Request Revision
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}