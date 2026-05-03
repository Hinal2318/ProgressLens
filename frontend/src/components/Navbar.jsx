import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, ClipboardList, History, HeartPulse, UserCircle, LogOut, CheckCircle2, Menu, X } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();
  const userName = localStorage.getItem("userName") || "User";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const studentLinks = [
    { name: "Dashboard", path: "/student/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "My Projects", path: "/student/projects", icon: <FolderKanban size={18} /> },
    { name: "Project Manager", path: "/project-manager", icon: <CheckCircle2 size={18} /> },
    { name: "Activity", path: "/activity", icon: <History size={18} /> },
  ];

  const facultyLinks = [
    { name: "Dashboard", path: "/faculty/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Projects", path: "/faculty/projects", icon: <FolderKanban size={18} /> },
    { name: "Reviews", path: "/faculty/reviews", icon: <ClipboardList size={18} /> },
    { name: "Reflections", path: "/faculty/reflections", icon: <History size={18} /> },
    { name: "Health", path: "/faculty/health", icon: <HeartPulse size={18} /> },
  ];

  const links = role === "faculty" ? facultyLinks : studentLinks;

  if (!token) return null;

  return (
    <nav className="main-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Progress<span>Lens</span>
        </Link>

        <div className="nav-menu">
          {links.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path} 
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {link.icon}
              {link.name}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions">
          <Link to={role === "faculty" ? "/faculty/profile" : "/profile"} className="nav-user-btn">
            <UserCircle size={20} />
            <span className="user-name">{userName}</span>
          </Link>

          <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
            <LogOut size={20} />
          </button>
          
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {links.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}