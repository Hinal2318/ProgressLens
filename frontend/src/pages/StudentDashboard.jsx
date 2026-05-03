import "./StudentDashboard.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import API from "../services/api";
import { io } from "socket.io-client";
import { FolderKanban, CheckCircle2, Clock, Activity as ActivityIcon, TrendingUp, Megaphone, Bell } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockChartData = [
  { week: 'Week 1', progress: 10 },
  { week: 'Week 2', progress: 15 },
  { week: 'Week 3', progress: 35 },
  { week: 'Week 4', progress: 50 },
  { week: 'Week 5', progress: 75 },
  { week: 'Week 6', progress: 82 },
];

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/student/dashboard");
        setData(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Dashboard error:", error);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000", {
      path: "/socket.io/",
      transports: ["websocket"]
    });

    socket.on("new_announcement", (announcement) => {
      console.log("New announcement received via socket:", announcement);
      setData(prev => {
        if (!prev) return prev;
        // Only add if it's general or belongs to one of student's projects
        const projectIds = prev.projects?.map(p => p._id) || [];
        if (!announcement.project || projectIds.includes(announcement.project)) {
          return {
            ...prev,
            announcements: [announcement, ...(prev.announcements || [])]
          };
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, []);
 
  if (loading) return <div className="loading-screen">Loading your workspace...</div>;
  if (!data) return <div className="error-screen">No Dashboard Data Found</div>;

  const projects = data.projects || [];

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
      className="dashboard"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Student Dashboard</h1>
          <p>Overview of your academic progress</p>
        </div>
        <span className="role-badge">Student Access</span>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <motion.div className="stat-card blue" variants={itemVariants}>
          <div className="stat-icon"><FolderKanban size={20} /></div>
          <p>Total Projects</p>
          <h2>{data.totalProjects}</h2>
        </motion.div>
        <motion.div className="stat-card green" variants={itemVariants}>
          <div className="stat-icon"><CheckCircle2 size={20} /></div>
          <p>Completed Tasks</p>
          <h2>{data.completedTasks}</h2> 
        </motion.div>
        <motion.div className="stat-card orange" variants={itemVariants}>
          <div className="stat-icon"><Clock size={20} /></div>
          <p>Pending Milestones</p>
          <h2>{data.pendingMilestones}</h2>
        </motion.div>
        <motion.div className="stat-card purple" variants={itemVariants}>
          <div className="stat-icon"><ActivityIcon size={20} /></div>
          <p>Project Health</p>
          <h2>{data.health}</h2>
        </motion.div>
      </div>

      {/* VISUAL STORY SECTION */}
      <motion.div className="chart-section card" variants={itemVariants} style={{ marginBottom: 32 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="section-title">Visual Progress Story</h3>
            <p className="text-secondary small">Completion trend across milestones</p>
          </div>
          <div className="stat-badge success" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600 }}>
            <TrendingUp size={16} />
            <span>+12% this week</span>
          </div>
        </div>
        
        <div className="chart-container" style={{ height: 300, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="week" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748B', fontSize: 12}} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="progress" 
                stroke="#2563EB" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProgress)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* BROADCAST MESSAGES */}
      <motion.div className="section-container" variants={itemVariants}>
        <div className="section-header" style={{ marginBottom: 20 }}>
          <h3 className="section-title">Broadcast Messages</h3>
          <p className="text-secondary small">Important updates from faculty members</p>
        </div>
        <div className="announcements-container">
          {data.announcements && data.announcements.length > 0 ? (
            data.announcements.map((ann) => (
              <motion.div 
                key={ann._id} 
                className={`announcement-card ${ann.type.toLowerCase()}`}
                whileHover={{ x: 4 }}
              >
                <div className="announcement-header">
                  <div className="announcement-type">
                    {ann.type === 'Deadline' ? <Bell size={16} /> : <Megaphone size={16} />}
                    <span>{ann.type}</span>
                  </div>
                  <span className="announcement-date">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4>{ann.title}</h4>
                <p>{ann.content}</p>
                <div className="announcement-footer">
                  <span>By Prof. {ann.faculty?.name}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>No broadcast messages at this time.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* MY PROJECTS LIST */}
      <div className="section-header">
        <h3>My Projects</h3>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found. Ask your faculty to assign one!</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div 
              key={project._id} 
              className="card project-card"
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/student/projects/${project._id}`)}
            >
              <div className="card-header">
                <h4>{project.title}</h4>
                <span className={`status-pill ${
                  project.status === "Completed" ? "status-success" :
                  project.status === "On Track" ? "status-success" :
                  project.status === "At Risk" ? "status-error" :
                  project.status === "Needs Attention" ? "status-warning" :
                  "status-warning"
                }`}>
                  {project.status || "In Progress"}
                </span>
              </div>
              
              <p className="semester-info">
                Semester {project.semester || "N/A"} • {project.students?.length || 0} Members
              </p>

              <div className="progress-container">
                <div className="progress-label">
                  <span>Completion Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}