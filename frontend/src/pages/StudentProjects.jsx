import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import { FolderKanban, ArrowRight, Users, GraduationCap, CheckCircle2 } from "lucide-react";
import "./StudentProjects.css";

export default function StudentProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects/my-projects");
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div className="loading-screen">Loading projects...</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="student-projects"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="page-header">
        <div>
          <h1 className="page-title">My Projects</h1>
          <p className="text-secondary">Manage and track your active academic projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/project-manager")}>
          <FolderKanban size={18} /> New Project
        </button>
      </header>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <motion.div className="card empty-state-card" variants={itemVariants}>
            <FolderKanban size={48} className="text-muted" />
            <h3>No projects found</h3>
            <p>You haven't been assigned to any projects yet. Start by creating a new one!</p>
            <button className="btn btn-outline" onClick={() => navigate("/project-manager")}>
              Create Project
            </button>
          </motion.div>
        ) : (
          projects.map((project) => (
            <motion.div 
              key={project._id} 
              className="card project-card"
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <div className="card-header">
                <div className="project-type-icon">
                  <GraduationCap size={20} />
                </div>
                <span className={`status-pill ${project.status === "Completed" ? "status-success" : "status-warning"}`}>
                  {project.status}
                </span>
              </div>
              
              <div className="project-info">
                <h3>{project.title}</h3>
                <div className="meta-info">
                  <div className="meta-item">
                    <Users size={16} />
                    <span>{project.students?.length || 0} Members</span>
                  </div>
                  <div className="meta-item">
                    <CheckCircle2 size={16} />
                    <span>Semester {project.semester}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <button 
                  className="btn btn-outline w-full"
                  onClick={() => navigate(`/student/projects/${project._id}`)}
                >
                  View Details <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}