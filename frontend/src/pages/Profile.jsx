import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { User, Mail, Building, BookOpen, GraduationCap, Edit2, Shield, X, Save, LogOut, Trash2 } from "lucide-react";
import "./Profile.css";

export default function StudentProfile() {
  const [user, setUser] = useState(null);  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    department: "", 
    semester: "" 
  });

  const loadProfileData = async () => {
    try {
      const [profileRes] = await Promise.all([
        API.get("/users/me")
      ]);

      const userData = profileRes.data.user;
      setUser(userData);
      
      setFormData({ 
        name: userData.name || "", 
        email: userData.email || "", 
        department: userData.department || "", 
        semester: userData.semester || "" 
      });
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/users/profile-update", formData);
      setUser(res.data.user); 
      setIsModalOpen(false);
      alert("Profile updated! ✅");
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || "Server Error"));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "⚠️ WARNING: Are you sure you want to permanently delete your account?\n\nThis will remove your academic profile, delete all your assigned tasks and reflections, and pull you out of all projects. This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await API.delete("/users/delete-account");
      alert("Your account has been deleted successfully.");
      localStorage.clear();
      navigate("/auth");
    } catch (err) {
      alert("Failed to delete account: " + (err.response?.data?.message || "Server Error"));
    }
  };

  if (loading) return <div className="fp-loading"><span>Syncing Identity...</span></div>;
  if (!user) return <div className="error">Session expired. Please log in again.</div>;

  return (
    <div className="prof-page">
      <div className="prof-bg-blur"></div>

      <div className="prof-container">
        <header className="prof-header">
          <h1>Account Settings</h1>
          <p>Manage your academic identity and personal information.</p>
        </header>

        <div className="prof-layout">
          {/* LEFT COLUMN: IDENTITY */}
          <div className="prof-card identity-card glass-panel">
            <div className="prof-avatar-wrap">
              <div className="prof-avatar" style={{background: 'linear-gradient(135deg, #dcfce7 0%, #86efac 100%)', color: '#166534'}}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="prof-role-badge" style={{background: '#3b82f6'}}>
                <GraduationCap size={14} /> Student
              </div>
            </div>
            
            <h2 className="prof-name">{user.name}</h2>
            <p className="prof-email"><Mail size={16} /> {user.email}</p>
            <p className="prof-dept"><Building size={16} /> {user.department || "No Department Assigned"}</p>

            <button className="prof-btn-edit" onClick={() => setIsModalOpen(true)}>
              <Edit2 size={16} /> Edit Profile
            </button>

            <div className="prof-divider"></div>

            <button className="prof-btn-logout" onClick={() => { localStorage.clear(); navigate('/auth'); }}>
              <LogOut size={16} /> Secure Log Out
            </button>

            <button className="prof-btn-delete" onClick={handleDeleteAccount}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>

          {/* RIGHT COLUMN: ACADEMIC DETAILS */}
          <div className="prof-content">
            <h3 className="prof-section-title">Academic Details</h3>
            <div className="prof-stats-grid">
              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap blue"><User size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">{user.name}</span>
                  <span className="stat-label">Full Legal Name</span>
                </div>
              </div>

              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap green"><BookOpen size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value">Semester {user.semester || "N/A"}</span>
                  <span className="stat-label">Current Enrollment</span>
                </div>
              </div>

              <div className="prof-stat-box glass-panel">
                <div className="stat-icon-wrap orange"><Building size={24} /></div>
                <div className="stat-info">
                  <span className="stat-value" style={{fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{user.department || "General"}</span>
                  <span className="stat-label">Academic Department</span>
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
              <div className="prof-input-group">
                <label><GraduationCap size={16} /> Semester</label>
                <select 
                  value={formData.semester} 
                  onChange={e => setFormData({...formData, semester: e.target.value})}
                  className="prof-select"
                >
                  <option value="">Select Semester</option>
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>Semester {num}</option>
                  ))}
                </select>
              </div>
              
              <div className="prof-modal-actions">
                <button type="button" className="prof-btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="prof-btn-save">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}