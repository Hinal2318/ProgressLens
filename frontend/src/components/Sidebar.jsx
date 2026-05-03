import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, FolderKanban, ClipboardCheck, 
  MessageSquare, Activity, User, LogOut, BarChart3 
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isFaculty = user.role === "Faculty";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">ProgressLens</div>

      <nav className="sidebar-menu">
        {isFaculty ? (
          <>
            <NavLink to="/faculty/dashboard" className="sidebar-link">
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/faculty/projects" className="sidebar-link">
              <FolderKanban size={20} /> Projects
            </NavLink>
            <NavLink to="/faculty/reviews" className="sidebar-link">
              <ClipboardCheck size={20} /> Reviews
            </NavLink>
            <NavLink to="/faculty/reflections" className="sidebar-link">
              <MessageSquare size={20} /> Reflections
            </NavLink>
            <NavLink to="/faculty/health" className="sidebar-link">
              <BarChart3 size={20} /> Health Monitor
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/student/dashboard" className="sidebar-link">
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/student/projects" className="sidebar-link">
              <FolderKanban size={20} /> My Projects
            </NavLink>
            <NavLink to="/project-manager" className="sidebar-link">
              <ClipboardCheck size={20} /> Manager
            </NavLink>
            <NavLink to="/activity" className="sidebar-link">
              <Activity size={20} /> Activity
            </NavLink>
          </>
        )}
        <NavLink to={isFaculty ? "/faculty/profile" : "/profile"} className="sidebar-link">
          <User size={20} /> Profile
        </NavLink>
      </nav>

      <button className="sidebar-logout-btn" onClick={handleLogout}>
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
}