import { NavLink, useNavigate } from "react-router-dom";
import "./FacultySidebar.css";

export default function FacultySidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="faculty-sidebar">
      <h2 className="logo">ProgressLens</h2>

      <nav className="menu">
        <NavLink to="/faculty/dashboard" className="menu-item">
          Dashboard
        </NavLink>

        <NavLink to="/faculty/projects" className="menu-item">
           Supervised Projects
        </NavLink>

        <NavLink to="/faculty/reviews" className="menu-item">
           Reviews
        </NavLink>

        <NavLink to="/faculty/reflections" className="menu-item">
           Reflections
        </NavLink>

        <NavLink to="/faculty/health" className="menu-item">
           Project Health
        </NavLink>

        <NavLink to="/faculty/profile" className="menu-item">
           Profile
        </NavLink>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
         Logout
      </button>
    </div>
  );
}
