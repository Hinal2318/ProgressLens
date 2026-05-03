import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Plus, Layout, Users, ArrowRight } from "lucide-react";
import "./ProjectManager.css";

export default function ProjectManager() {
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form States
  const [projectForm, setProjectForm] = useState({ title: "", semester: "", facultyEmail: "", teamEmails: "" });

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const res = await API.get("/projects/my-projects");
      setMyProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const teamEmails = projectForm.teamEmails.split(",").map(e => e.trim()).filter(e => e);
    
    if (teamEmails.length > 4) {
      alert("You can only add a maximum of 4 team members.");
      return;
    }

    try {
      await API.post("/projects", { 
        ...projectForm, 
        studentEmails: teamEmails 
      });
      alert("Project Created! 🎉");
      setProjectForm({ title: "", semester: "", facultyEmail: "", teamEmails: "" });
      fetchMyProjects();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Failed"));
    }
  };

  if (loading) return <div className="pm-container">Loading Workspace...</div>;

  return (
    <div className="pm-container">
      <div className="pm-header">
        <h1>Workspace Manager</h1>
        <p>Create and manage your academic projects from one central hub.</p>
      </div>

      <div className="pm-content-grid">
        {/* CREATE PROJECT */}
        <div className="pm-card">
          <div className="card-title">
            <Plus size={20} />
            <h2>Create New Project</h2>
          </div>
          <form className="pm-form" onSubmit={handleCreateProject}>
            <label>Project Title</label>
            <input 
              value={projectForm.title} 
              onChange={e => setProjectForm({...projectForm, title: e.target.value})} 
              placeholder="e.g. AI-Powered Health Assistant"
              required 
            />
            
            <div className="form-row">
              <div className="form-group">
                <label>Semester</label>
                <input 
                  type="number" 
                  value={projectForm.semester} 
                  onChange={e => setProjectForm({...projectForm, semester: e.target.value})} 
                  placeholder="6"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Faculty Email</label>
                <input 
                  type="email" 
                  value={projectForm.facultyEmail} 
                  onChange={e => setProjectForm({...projectForm, facultyEmail: e.target.value})} 
                  placeholder="professor@uni.edu"
                  required 
                />
              </div>
            </div>

            <label>Team Member Emails (max 4, comma separated)</label>
            <input 
              value={projectForm.teamEmails} 
              onChange={e => setProjectForm({...projectForm, teamEmails: e.target.value})} 
              placeholder="student1@test.com, student2@test.com" 
            />
            
            <button type="submit" className="create-btn">Initialize Project</button>
          </form>
        </div>

        {/* PROJECTS LIST */}
        <div className="pm-card">
          <div className="card-title">
            <Layout size={20} />
            <h2>Active Projects</h2>
          </div>
          {myProjects.length === 0 ? (
            <div className="empty-state">
              <p>No active projects found. Create one to get started!</p>
            </div>
          ) : (
            <div className="pm-list">
              {myProjects.map(p => (
                <div key={p._id} className="pm-project-item">
                  <div className="project-info">
                    <strong>{p.title}</strong>
                    <div className="project-meta">
                      <span>Semester {p.semester}</span>
                      <span className="dot">•</span>
                      <div className="team-count">
                        <Users size={14} />
                        <span>{p.students?.length} Members</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="manage-btn"
                    onClick={() => navigate(`/student/projects/${p._id}`)}
                  >
                    Open Workspace <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}