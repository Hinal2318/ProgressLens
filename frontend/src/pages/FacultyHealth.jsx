import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertCircle, CheckCircle, Activity } from "lucide-react";

import API from "../services/api";
import "./FacultyHealth.css";

export default function FacultyHealth() {
  const [filter, setFilter] = useState("All");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const navigate = useNavigate();
  

  useEffect(() => {
    const fetchProjectHealth = async () => {
      try {
        setLoading(true);
        // Ensure this URL matches your backend route
        const response = await API.get("/faculty/health");
        setProjects(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching health data:", err);
        setError("Failed to load project health data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectHealth();
  }, []);

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.status === filter);

  // Analysis Data
  const stats = {
    total: projects.length,
    onTrack: projects.filter(p => p.status === "On Track").length,
    needsAttention: projects.filter(p => p.status === "Needs Attention").length,
    atRisk: projects.filter(p => p.status === "At Risk").length,
  };

  const pieData = [
    { name: "On Track", value: stats.onTrack, color: "#10b981" },
    { name: "Needs Attention", value: stats.needsAttention, color: "#f59e0b" },
    { name: "At Risk", value: stats.atRisk, color: "#ef4444" }
  ].filter(d => d.value > 0);

  if (loading) return <div className="loading-state">Analyzing project data...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="faculty-health-page">
      {/* HEADER */}
      <div className="page-header">
        <h1>Project Health Monitor</h1>
        <p>Real-time health tracking based on task completion</p>
      </div>

      {/* ANALYSIS DASHBOARD */}
      <div className="health-analysis-dashboard">
        <div className="health-summary-cards">
          <div className="h-card total">
            <Activity size={24} />
            <div>
              <h3>{stats.total}</h3>
              <span>Total Monitored</span>
            </div>
          </div>
          <div className="h-card on-track">
            <CheckCircle size={24} />
            <div>
              <h3>{stats.onTrack}</h3>
              <span>On Track</span>
            </div>
          </div>
          <div className="h-card needs-attention">
            <AlertCircle size={24} />
            <div>
              <h3>{stats.needsAttention}</h3>
              <span>Needs Attention</span>
            </div>
          </div>
          <div className="h-card at-risk">
            <AlertCircle size={24} />
            <div>
              <h3>{stats.atRisk}</h3>
              <span>At Risk</span>
            </div>
          </div>
        </div>

        <div className="health-chart-section card-glass">
          <div className="chart-info">
            <h3>Health Distribution</h3>
            <p>Visual breakdown of all {stats.total} projects under your supervision.</p>
            {stats.atRisk > 0 && (
              <div className="action-alert">
                <strong>Action Required:</strong> {stats.atRisk} projects are severely behind schedule.
              </div>
            )}
          </div>
          <div className="chart-graphic">
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No projects to analyze</p>
            )}
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters">
        {["All", "On Track", "Needs Attention", "At Risk"].map((item) => (
          <button
            key={item}
            className={`filter-btn ${filter === item ? "active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* PROJECT GRID */}
      <div className="health-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project._id} className="health-card">
              <div className="card-top">
                <h3>{project.name}</h3>
                <span
                  className={`status-pill ${
                    project.status === "On Track"
                      ? "on-track"
                      : project.status === "Needs Attention"
                      ? "needs-attention"
                      : "at-risk"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <div className="progress-container">
                <div className="progress-label">
                  <span>Completion</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={`progress-fill ${
                      project.progress > 70 ? "green" : project.progress > 30 ? "yellow" : "red"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <button 
                className="view-details-btn"
                 onClick={() => navigate(`/faculty/projects/${project._id}`)} // 👈 Corrected path

              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="no-data">No projects found for the selected filter.</div>
        )}
      </div>
    </div>
  );
}