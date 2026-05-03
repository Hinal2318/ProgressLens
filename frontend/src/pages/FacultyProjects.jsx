import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Folder, Users, Search, Activity, ChevronRight } from "lucide-react";
import "./FacultyProjects.css";

export default function FacultyProjects() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/faculty/supervised-projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Error loading supervised projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getStatusClass = (status) => {
    if (!status) return "on-track";
    return status.toLowerCase().replace(/\s+/g, "-");
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading Supervised Projects...</div>;

  return (
    <div className="faculty-projects-page">
      <div className="page-header-premium">
        <div className="header-text">
          <h1>Supervised Projects</h1>
          <p>Manage and track all {projects.length} projects under your guidance</p>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="projects-grid-premium">
        {filteredProjects.length > 0 ? filteredProjects.map((project) => {
          const dynamicProgress = project.progress || 0;

          return (
            <div key={project._id} className="project-card-premium card-glass">
              <div className="project-header">
                <div className="title-area">
                  <div className="icon-wrap"><Folder size={20} /></div>
                  <h3>{project.title}</h3>
                </div>
                <span className={`status-badge ${getStatusClass(project.status)}`}>
                  {project.status || "In Progress"}
                </span>
              </div>

              <div className="project-details">
                <div className="detail-item">
                  <Users size={16} />
                  <span>{project.students?.length || 0} Members</span>
                </div>
                <div className="detail-item">
                  <Activity size={16} />
                  <span>Phase: {project.currentPhase || "Planning"}</span>
                </div>
              </div>

              {/* DYNAMIC PROGRESS BAR */}
              <div className="progress-section">
                <div className="progress-labels">
                  <span className="label-text">Completion</span>
                  <span className="label-value">{dynamicProgress}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${dynamicProgress}%` }} 
                  ></div>
                </div>
              </div>

              <div className="card-actions">
                <button 
                  className="view-btn-premium"
                  onClick={() => navigate(`/faculty/projects/${project._id}`)}
                >
                  Project Workspace <ChevronRight size={16} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="empty-state-premium">
            <Folder size={48} className="empty-icon" />
            <h3>No projects found</h3>
            <p>You have no supervised projects matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}