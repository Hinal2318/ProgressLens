import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  TrendingUp, 
  CheckSquare, 
  Target, 
  ArrowLeft,
  Activity,
  Users,
  AlertTriangle,
  Award,
  Zap,
  Info
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Label
} from "recharts";
import "./ProjectAnalytics.css";

export default function ProjectAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, anaRes] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get(`/analytics/project/${id}`)
        ]);
        setProject(projRes.data);
        setAnalytics(anaRes.data);
      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="analytics-loading"><span>Calculating Project Intelligence...</span></div>;
  if (!analytics) return <div className="analytics-error">Failed to load analytics.</div>;

  const COLORS = ['#22C55E', '#F59E0B', '#64748B'];

  return (
    <div className="analytics-page">
      <div className="analytics-bg-blur"></div>
      
      <nav className="analytics-nav-premium">
        <div className="nav-left">
          <button onClick={() => navigate(-1)} className="back-pill">
            <ArrowLeft size={18} />
          </button>
          <div className="nav-title">
            <h1>Intelligence Hub</h1>
            <span>Analytics / {project?.title}</span>
          </div>
        </div>
        
        <div className="nav-right">
          <div className="health-meter">
            <div className="meter-label">Project Health</div>
            <div className={`meter-value ${analytics.completionRate > 70 ? 'good' : 'warning'}`}>
              {analytics.completionRate}% Efficiency
            </div>
          </div>
        </div>
      </nav>

      <div className="analytics-container-premium">
        {/* TOP SUMMARY */}
        <div className="summary-banner card-glass">
          <div className="summary-icon"><Zap size={32} /></div>
          <div className="summary-text">
            <h2>Current Focus: {analytics.focusAreas[0]?.name || "Team Velocity"}</h2>
            <p>Based on current task distribution, the team is {analytics.completionRate}% through the planned scope.</p>
          </div>
          <div className="summary-action">
            <button onClick={() => navigate(`/student/projects/${id}`)}>Workspace View</button>
          </div>
        </div>

        {/* KPI GRID */}
        <div className="kpi-grid-premium">
          {[
            { label: "Completion", val: `${analytics.completionRate}%`, icon: <Activity />, color: "indigo" },
            { label: "Tasks Done", val: `${analytics.taskStats.done}/${analytics.taskStats.total}`, icon: <CheckSquare />, color: "green" },
            { label: "Phase State", val: `${analytics.submissionHealth.filter(h => h.isDone).length}/3`, icon: <Target />, color: "amber" },
            { label: "Teammates", val: project?.students?.length, icon: <Users />, color: "pink" }
          ].map((item, i) => (
            <div key={i} className={`kpi-card-premium ${item.color}`}>
              <div className="kpi-icon-box">{item.icon}</div>
              <div className="kpi-content">
                <h3>{item.val}</h3>
                <span>{item.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS GRID */}
        <div className="charts-grid-premium">
          <div className="chart-card-premium card-glass span-2">
            <div className="chart-header">
              <h3>Contribution Velocity</h3>
              <p>Work completed per team member</p>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.memberStats}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#velocityGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card-premium card-glass">
            <div className="chart-header">
              <h3>Task Health</h3>
              <p>Current distribution</p>
            </div>
            <div className="chart-box">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Done", value: analytics.taskStats.done },
                      { name: "Progress", value: analytics.taskStats.inProgress },
                      { name: "To Do", value: analytics.taskStats.todo }
                    ]}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#cbd5e1" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend-custom">
                <div className="leg-item"><span className="dot green"></span> Done</div>
                <div className="leg-item"><span className="dot amber"></span> Progress</div>
                <div className="leg-item"><span className="dot slate"></span> To Do</div>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="lower-grid-premium">
          <div className="insights-panel card-glass">
            <div className="panel-header">
              <AlertTriangle className="icon-warn" />
              <h3>Critical Focus Areas</h3>
            </div>
            <div className="focus-scroller">
              {analytics.focusAreas.map(m => (
                <div key={m.name} className="focus-row">
                  <div className="focus-lead">
                    <strong>{m.name}</strong>
                    <span>Backlog: {m.pending} tasks</span>
                  </div>
                  <div className="focus-progress-track">
                    <div className="track-bg">
                      <div className="track-fill" style={{ width: `${(m.completed / (m.total || 1)) * 100}%` }}></div>
                    </div>
                    <span>{Math.round((m.completed / (m.total || 1)) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="roadmap-panel card-glass">
            <div className="panel-header">
              <Target className="icon-target" />
              <h3>Milestone Journey</h3>
            </div>
            <div className="roadmap-stepper">
              {analytics.submissionHealth.map((h, i) => (
                <div key={h.phase} className="step-node">
                  <div className={`node-marker ${h.isDone ? 'done' : h.status === 'Pending' ? 'upcoming' : 'active'}`}>
                    {h.isDone ? "✓" : i + 1}
                  </div>
                  <div className="node-content">
                    <h4>{h.phase}</h4>
                    <span>{h.status}</span>
                  </div>
                  {i < 2 && <div className="node-line"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
