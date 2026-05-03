import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import "./FacultyReviews.css";

export default function FacultyReviews() {
  const [inbox, setInbox] = useState([]);
  const [filteredInbox, setFilteredInbox] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        const res = await API.get("/submissions/review-inbox");
        // Ensure res.data is an array to prevent .map errors
        const data = Array.isArray(res.data) ? res.data : [];
        setInbox(data);
        setFilteredInbox(data);
      } catch (err) {
        setError("Unable to connect to the server. Please check your backend.");
        console.error("Inbox Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  // Handle Filtering Logic
  useEffect(() => {
    if (filter === "All") {
      setFilteredInbox(inbox);
    } else {
      setFilteredInbox(inbox.filter((item) => item.status === filter));
    }
  }, [filter, inbox]);

  if (loading) return (
    <div className="review-loading">
      <div className="spinner"></div>
      <p>Fetching your review queue...</p>
    </div>
  );

  if (error) return <div className="review-error-box">⚠️ {error}</div>;

  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.25 } }
  };

  return (
    <div className="faculty-reviews-container">
      <header className="reviews-header">
        <div className="header-text">
          <h1>Review Management</h1>
          <p>Manage and evaluate student submissions across all your supervised projects.</p>
        </div>

        <div className="filter-group">
          <label>Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Submissions</option>
            <option value="Pending">Pending Only</option>
            <option value="Revision Requested">Revisions Only</option>
          </select>
        </div>
      </header>

      <div className="reviews-content">
        {filteredInbox.length === 0 ? (
          <div className="empty-inbox-card">
            <h3>🎉 Inbox Zero!</h3>
            <p>No {filter !== "All" ? filter.toLowerCase() : ""} submissions require your attention right now.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="table-responsive">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Phase</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInbox.map((item) => (
                    <motion.tr
                      key={item._id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <td><span className="project-title-link">{item.project?.title || "Unknown Project"}</span></td>
                      <td><span className="phase-text">{item.phase}</span></td>
                      <td>
                        <div className="student-info">
                          <strong>{item.submittedBy?.name}</strong>
                          <small>{item.submittedBy?.email}</small>
                        </div>
                      </td>
                      <td>{new Date(item.createdAt).toLocaleDateString("en-GB")}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="review-action-btn"
                          onClick={() => navigate(`/faculty/projects/${item.project?._id}`)}
                        >
                          Review
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="reviews-cards-mobile">
              {filteredInbox.map((item) => (
                <motion.div
                  key={item._id}
                  className="review-card-mobile"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                >
                  <div className="review-card-top">
                    <span className="review-card-project">{item.project?.title || "Unknown Project"}</span>
                    <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="review-card-meta">
                    <span className="phase-text">{item.phase} Phase</span>
                    <span className="review-card-date">{new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                  </div>
                  <div className="review-card-student">
                    <strong>{item.submittedBy?.name}</strong>
                    <small>{item.submittedBy?.email}</small>
                  </div>
                  <button
                    className="review-action-btn full-width"
                    onClick={() => navigate(`/faculty/projects/${item.project?._id}`)}
                  >
                    Review Work →
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}