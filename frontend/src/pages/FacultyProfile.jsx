import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { User, Mail, Building, BookOpen, Users, ClipboardCheck, LogOut, Edit2, Shield, X, Save } from "lucide-react";
import "./FacultyProfile.css";

export default function FacultyProfile() {
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", department: "" });
  const [isUpdating, setIsUpdating] = useState(false); // Added loading state for button
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/faculty/profile-data");
      setData(res.data);
      // Initialize form data
      setFormData({ 
        name: res.data.user.name, 
        email: res.data.user.email, 
        department: res.data.user.department || "" 
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  // Inside FacultyProfile.jsx
const handleUpdate = async (e) => {
  e.preventDefault();
  setIsUpdating(true);
  try {
    const res = await API.put("/faculty/profile-update", formData);
    
    // ✅ This updates the UI immediately
    setData({ ...data, user: res.data.user }); 
    setIsModalOpen(false);
    alert("Profile updated successfully!");
  } catch {
    alert("Failed to update profile.");
  } finally {
    setIsUpdating(false);
  }
};

  const openEditModal = () => {
    // ✅ Sync formData with current data before opening modal
    setFormData({
      name: data.user.name,
      email: data.user.email,
      department: data.user.department || ""
    });
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth"); // Redirect to unified Auth page
  };
// Inside FacultyProfile.jsx

  if (!data) return <div className="fp-loading"><span>Syncing Academic Data...</span></div>;

  return (
    <div className="prof-page">
      <div className="prof-bg-blur"></div>

      <div className="prof-container">
        <header className="prof-header">
          <h1>Account Settings</h1>
          <p>Manage your academic identity and supervised project statistics.</p>
        </header>

        <div className="prof-layout">
          {/* LEFT COLUMN: IDENTITY */}
          <div className="prof-card identity-card glass-panel">
            <div className="prof-avatar-wrap">
              <div className="prof-avatar">
                {data.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="prof-role-badge">
                <Shield size={14} /> Faculty
              </div>
            </div>
            
            <h2 className="prof-name">{data.user.name}</h2>
            <p className="prof-email"><Mail size={16} /> {data.user.email}</p>
            <p className="prof-dept"><Building size={16} /> {data.user.department || "No Department Assigned"}</p>

            <button className="prof-btn-edit" onClick={openEditModal}>
              <Edit2 size={16} /> Edit Profile
            </button>

            <div className="prof-divider"></div>

            <button className="prof-btn-logout" onClick={handleLogout}>
              <LogOut size={16} /> Secure Log Out
            </button>
          </div>

          {/* RIGHT COLUMN: STATS */}
          <div className="prof-content">
            <h3 className="prof-section-title">Academic Overview</h3>
            <div className="prof-stats-grid">
              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap blue"><BookOpen size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{data.stats.projectsSupervised}</span>
                  <span className="stat-label">Projects Supervised</span>
                </div>
              </div>

              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap green"><Users size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{data.stats.totalStudents}</span>
                  <span className="stat-label">Active Students</span>
                </div>
              </div>

              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap orange"><ClipboardCheck size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{data.stats.pendingReviews}</span>
                  <span className="stat-label">Pending Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="prof-modal-overlay">
          <div className="prof-modal-content glass-panel">
            <div className="prof-modal-header">
              <h3>Update Academic Profile</h3>
              <button className="prof-btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdate} className="prof-form">
              <div className="prof-input-group">
                <label><User size={16} /> Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required
                />
              </div>
              <div className="prof-input-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required
                />
              </div>
              <div className="prof-input-group">
                <label><Building size={16} /> Department</label>
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => setFormData({...formData, department: e.target.value})} 
                  placeholder="e.g., Computer Science"
                />
              </div>
              
              <div className="prof-modal-actions">
                <button type="button" className="prof-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="prof-btn-save" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}