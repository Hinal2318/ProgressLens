import React, { useEffect, useState } from "react";
import API from "../services/api";
import "./Activity.css";

export default function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await API.get("/activity/my-activity");
        setActivities(res.data);
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) return <div className="activity-container">Loading Activity Feed...</div>;

  return (
    <div className="activity-container">
      <div className="activity-header">
        <h1>Recent Activity</h1>
        <p>A chronological log of all your project updates and task completions.</p>
      </div>

      <div className="timeline">
        {activities.length === 0 ? (
          <div className="empty-state">
            <p>No activity recorded yet. Start working on your projects to see logs here!</p>
          </div>
        ) : (
          activities.map((act) => (
            <div key={act._id} className="timeline-item">
              <div className={`timeline-dot ${act.type.toLowerCase()}`}></div>
              <div className="timeline-content">
                <div className="timeline-info">
                  <span className="action-text">{act.action}</span>
                  <span className="timestamp">
                    {new Date(act.timestamp).toLocaleDateString()} at {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {act.project && (
                  <div className="project-badge">
                    Project: <strong>{act.project.title}</strong>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}