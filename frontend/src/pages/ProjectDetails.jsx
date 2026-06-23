import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import ChatRoom from "../components/ChatRoom";
import KanbanBoard from "../components/KanbanBoard";
import { 
  Users, 
  CheckSquare, 
  Flag, 
  Send, 
  MessageCircle, 
  Plus, 
  ExternalLink,
  Github,
  BarChart as BarIcon,
  PieChart as PieIcon,
  TrendingUp,
  Target,
  Trash2
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell 
} from "recharts";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("team");

  // Form States
  const [taskForm, setTaskForm] = useState({ title: "", date: "", ownerId: "", priority: "Medium" });
  const [milestoneForm, setMilestoneForm] = useState({ title: "", date: "", description: "" });
  const [reflectionForm, setReflectionForm] = useState({ content: "" });
  const [submissionForm, setSubmissionForm] = useState({
    phase: "Proposal",
    githubLink: "",
    demoLink: "",
    liveUrl: "",
    comments: "",
    file: null 
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const currentUserId = localStorage.getItem("userId");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };
  const itemVariants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  const fetchProjectData = async () => {
    try {
      const [projRes, taskRes, subRes, mileRes, refRes, anaRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/project/${id}`).catch(() => ({ data: [] })),
        API.get(`/submissions/project/${id}`).catch(() => ({ data: [] })),
        API.get(`/milestones/project/${id}`).catch(() => ({ data: [] })),
        API.get(`/reflections/project/${id}`).catch(() => ({ data: [] })),
        API.get(`/analytics/project/${id}`).catch(() => ({ data: null }))
      ]);
      
      setProject(projRes.data);
      setTasks(taskRes.data);
      setSubmissions(subRes.data);
      setMilestones(mileRes.data);
      setReflections(refRes.data);
      if (anaRes) setAnalytics(anaRes.data);
    } catch (err) {
      console.error("Error loading project details:", err);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const isManager = 
    project?.creator === currentUserId || 
    project?.creator?._id === currentUserId || 
    (!project?.creator && project?.students?.[0]?._id === currentUserId) ||
    (!project?.creator && project?.students?.[0] === currentUserId);

  console.log("Debug isManager:", {
    projectCreator: project?.creator,
    currentUserId,
    firstStudent: project?.students?.[0],
    isManager
  });

  // --- HANDLERS ---

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await API.post("/tasks", {
        title: taskForm.title,
        project: id,
        dueDate: taskForm.date,
        ownerId: taskForm.ownerId || currentUserId,
        priority: taskForm.priority
      });
      setTaskForm({ title: "", date: "", ownerId: "", priority: "Medium" });
      fetchProjectData();
    } catch {
      alert("Failed to add task.");
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectData();
    } catch {
      alert("Failed to update task status.");
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId, newStatus) => {
    try {
      await API.put(`/milestones/${milestoneId}/status`, { status: newStatus });
      fetchProjectData();
    } catch {
      alert("Failed to update milestone status.");
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      await API.post("/milestones", {
        title: milestoneForm.title,
        project: id, 
        description: milestoneForm.description,
        deadline: milestoneForm.date 
      });
      setMilestoneForm({ title: "", date: "", description: "" });
      fetchProjectData(); 
    } catch (error) {
      alert("Failed to add milestone.");
    }
  };

  const handleCreateReflection = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reflections", {
        projectId: id, 
        content: reflectionForm.content,
        phase: "General" 
      });
      setReflectionForm({ content: "" });
      fetchProjectData();
    } catch (error) {
      alert("Failed to save reflection.");
    }
  };

  const handleSubmissionSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("projectId", id);
    formData.append("phase", submissionForm.phase);
    formData.append("githubLink", submissionForm.githubLink);
    formData.append("demoLink", submissionForm.demoLink);
    formData.append("liveUrl", submissionForm.liveUrl);
    formData.append("comments", submissionForm.comments);
    if (submissionForm.file) formData.append("file", submissionForm.file);

    try {
      await API.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Submission Uploaded! ");
      setSubmissionForm({ phase: "Proposal", githubLink: "", demoLink: "", liveUrl: "", comments: "", file: null });
      fetchProjectData();
    } catch (error) {
      alert("Submission Failed.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      setIsInviting(true);
      await API.post(`/projects/${id}/invite`, { email: inviteEmail });
      alert("Teammate invited! 🎉");
      setInviteEmail("");
      fetchProjectData();
    } catch (error) {
      alert(error.response?.data?.message || "Invitation failed.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveTeammate = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove ${userName} from this project?`)) return;
    try {
      await API.post(`/projects/${id}/remove-teammate`, { userId });
      alert("Teammate removed successfully.");
      fetchProjectData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove teammate.");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await API.delete(`/tasks/${taskId}`);
      fetchProjectData();
    } catch {
      alert("Failed to delete task.");
    }
  };

  if (loading) return <div className="loading-screen">Analyzing Project Data...</div>;
  if (!project) return <div className="error">Project not found.</div>;

  const tabs = [
    { id: "team", label: "Team", icon: <Users size={18} /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
    { id: "submissions", label: "Submissions", icon: <Send size={18} /> },
    { id: "reflections", label: "Reflections", icon: <MessageCircle size={18} /> },
  ];

  return (
    <div className="details-page">
      <div className="details-nav">
        <button onClick={() => navigate("/student/dashboard")} className="back-btn">← Back to Dashboard</button>
        <div className="project-title-area">
          <h1>{project.title}</h1>
          <span className={`status-pill ${project.status?.toLowerCase()}`}>{project.status}</span>
          <button 
            className="analytics-jump-btn" 
            onClick={() => navigate(`/project/${id}/analytics`)}
          >
            <BarIcon size={16} /> View Intelligence
          </button>
        </div>
        {!isManager && (
          <div className="manager-only-notice">
            <p>Read-only Mode: Only the Project Manager can add or manage items.</p>
          </div>
        )}
      </div>

      <div className="project-tabs-container">
        <div className="project-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {/* TEAM TAB */}
          {activeTab === "team" && (
            <div className="team-grid">
              <div className="team-info-card">
                <h3>Project Team</h3>
                <motion.div 
                  className="member-list"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {project.students?.map(student => (
                    <motion.div key={student._id} className="member-item" variants={itemVariants} whileHover={{ x: 4 }}>
                      <div className="member-avatar">
                        {student.name?.charAt(0)}
                      </div>
                      <div className="member-details">
                        <strong>{student.name} {student._id === currentUserId && "(You)"}</strong>
                        <p>{student.email}</p>
                        {project.creator === student._id && <span className="manager-badge">Project Manager</span>}
                      </div>
                      {isManager && student._id !== currentUserId && (
                        <button 
                          className="remove-member-btn" 
                          onClick={() => handleRemoveTeammate(student._id, student.name)}
                          title="Remove Teammate"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {isManager && project.students?.length < 4 && (
                  <div className="invite-section">
                    <h4>Invite Teammate</h4>
                    <form onSubmit={handleInvite}>
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        required
                      />
                      <button type="submit" disabled={isInviting}>
                        {isInviting ? "..." : <Plus size={18} />}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              <div className="chat-card">
                <h3>Discussion Room</h3>
                <ChatRoom projectId={id} projectName={project.title} />
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {activeTab === "tasks" && (
            <div className="tasks-container">
              <div className="kanban-wrapper">
                <KanbanBoard 
                  projectId={id} 
                  tasks={tasks} 
                  setTasks={setTasks} 
                  isManager={isManager} 
                  onDeleteTask={handleDeleteTask} 
                  onTaskUpdate={fetchProjectData} 
                />
              </div>
              
              {isManager && (
                <div className="add-task-card card">
                  <h3>Add New Task</h3>
                  <form onSubmit={handleCreateTask} className="horizontal-form">
                    <input 
                      placeholder="What needs to be done?"
                      value={taskForm.title}
                      onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      required
                    />
                    <select 
                      value={taskForm.ownerId}
                      onChange={e => setTaskForm({...taskForm, ownerId: e.target.value})}
                    >
                      <option value="">Assign To...</option>
                      {project.students.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                    <input 
                      type="date"
                      value={taskForm.date}
                      onChange={e => setTaskForm({...taskForm, date: e.target.value})}
                    />
                    <select 
                      value={taskForm.priority}
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                    <button type="submit" className="add-btn">Add Task</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* MILESTONES TAB */}
          {activeTab === "milestones" && (
            <div className="milestones-view">
              <div className="milestone-roadmap">
                <h3>Project Roadmap</h3>
                <div className="milestone-list">
                  {milestones.length > 0 ? milestones.map(m => (
                    <div key={m._id} className="milestone-item card">
                      <div className="mile-icon">
                        <Flag size={20} />
                      </div>
                      <div className="mile-info">
                        <h4>{m.title}</h4>
                        <p>{m.description}</p>
                        <span className="mile-date">Deadline: {new Date(m.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="mile-status-area">
                        {isManager ? (
                          <select 
                            value={m.status} 
                            onChange={(e) => handleUpdateMilestoneStatus(m._id, e.target.value)}
                            className={`mile-status-select ${m.status?.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="At-Risk">At-Risk</option>
                          </select>
                        ) : (
                          <div className={`mile-status ${m.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {m.status}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : <p className="empty-msg">No milestones created yet.</p>}
                </div>
              </div>

              {isManager && (
                <div className="add-milestone-card card">
                  <h3>Create Milestone</h3>
                  <form onSubmit={handleCreateMilestone} className="vertical-form">
                    <input 
                      placeholder="Milestone Title"
                      value={milestoneForm.title}
                      onChange={e => setMilestoneForm({...milestoneForm, title: e.target.value})}
                      required
                    />
                    <textarea 
                      placeholder="Description"
                      value={milestoneForm.description}
                      onChange={e => setMilestoneForm({...milestoneForm, description: e.target.value})}
                    />
                    <input 
                      type="date"
                      value={milestoneForm.date}
                      onChange={e => setMilestoneForm({...milestoneForm, date: e.target.value})}
                      required
                    />
                    <button type="submit" className="primary-btn">Create Milestone</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === "submissions" && (
            <div className="submissions-view">
              <div className="phases-list">
                {['Proposal', 'Mid-Evaluation', 'Final'].map(phase => {
                  const sub = submissions.find(s => s.phase === phase);
                  return (
                    <div key={phase} className={`phase-item card ${sub ? 'submitted' : 'pending'}`}>
                      <div className="phase-header">
                        <h4>{phase} Phase</h4>
                        {sub && <span className="sub-status">{sub.status}</span>}
                      </div>
                      {sub ? (
                        <div className="submission-details">
                          <div className="links">
                            {sub.githubLink && <a href={sub.githubLink} target="_blank" rel="noreferrer"><Github size={16}/> Code</a>}
                            {sub.liveUrl && <a href={sub.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Demo</a>}
                          </div>
                          {sub.feedback && (
                            <div className="feedback-box">
                              <strong>Faculty Feedback:</strong>
                              <p>{sub.feedback}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="not-submitted">No submission yet.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {isManager && (
                <div className="upload-card card">
                  <h3>Submit Project Phase</h3>
                  <form onSubmit={handleSubmissionSubmit} className="vertical-form">
                    <select 
                      value={submissionForm.phase}
                      onChange={e => setSubmissionForm({...submissionForm, phase: e.target.value})}
                    >
                      <option value="Proposal">Proposal</option>
                      <option value="Mid-Evaluation">Mid-Evaluation</option>
                      <option value="Final">Final Submission</option>
                    </select>
                    <input 
                      type="url" 
                      placeholder="GitHub Repository URL"
                      value={submissionForm.githubLink}
                      onChange={e => setSubmissionForm({...submissionForm, githubLink: e.target.value})}
                    />
                    <input 
                      type="url" 
                      placeholder="Live Demo URL"
                      value={submissionForm.liveUrl}
                      onChange={e => setSubmissionForm({...submissionForm, liveUrl: e.target.value})}
                    />
                    <textarea 
                      placeholder="Additional Comments"
                      value={submissionForm.comments}
                      onChange={e => setSubmissionForm({...submissionForm, comments: e.target.value})}
                    />
                    <label className="file-label">
                      <span>Upload Document (PDF/Zip)</span>
                      <input type="file" onChange={e => setSubmissionForm({...submissionForm, file: e.target.files[0]})} />
                    </label>
                    <button type="submit" className="primary-btn">Submit Phase</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* REFLECTIONS TAB */}
          {activeTab === "reflections" && (
            <div className="reflections-view">
              <div className="reflections-list">
                <h3>Team Reflections</h3>
                {reflections.length > 0 ? reflections.map(ref => (
                  <div key={ref._id} className="reflection-card card">
                    <div className="ref-header">
                      <strong>{ref.user?.name || "Student"}</strong>
                      <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>{ref.content}</p>
                    {ref.feedback && (
                      <div className="ref-feedback">
                        <strong>Faculty Response:</strong>
                        <p>{ref.feedback}</p>
                      </div>
                    )}
                  </div>
                )) : <p className="empty-msg">No reflections shared yet.</p>}
              </div>

              {isManager && (
                <div className="add-reflection-card card">
                  <h3>Share Your Reflection</h3>
                  <form onSubmit={handleCreateReflection} className="vertical-form">
                    <textarea 
                      placeholder="What did you learn today? What challenges did you face?"
                      value={reflectionForm.content}
                      onChange={e => setReflectionForm({...reflectionForm, content: e.target.value})}
                      required
                      rows={4}
                    />
                    <button type="submit" className="primary-btn">Share Reflection</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}