import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import API from "../services/api";
import { User, Calendar, AlertCircle, Clock, Trash2 } from "lucide-react";
import { differenceInDays, isPast, isToday } from "date-fns";
import "./KanbanBoard.css";

const COLUMNS = {
  "To Do": { id: "To Do", title: "To Do", color: "#64748B" },
  "In Progress": { id: "In Progress", title: "In Progress", color: "#F59E0B" },
  "Done": { id: "Done", title: "Done", color: "#22C55E" }
};

const getDeadlineBadge = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const diff = differenceInDays(d, new Date());
  
  if (isPast(d) && !isToday(d)) return <span className="deadline-badge overdue">Overdue</span>;
  if (isToday(d)) return <span className="deadline-badge today">Due Today</span>;
  if (diff <= 3) return <span className="deadline-badge urgent">{diff} days left</span>;
  return <span className="deadline-badge">{diff} days left</span>;
};


export default function KanbanBoard({ projectId, tasks: propTasks, setTasks: propSetTasks, isManager, onDeleteTask, onTaskUpdate }) {
  const [localTasks, setLocalTasks] = useState([]);
  const tasks = propTasks !== undefined ? propTasks : localTasks;
  const setTasks = propSetTasks !== undefined ? propSetTasks : setLocalTasks;
  const [loading, setLoading] = useState(propTasks === undefined);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (projectId && propTasks === undefined) {
      fetchTasks();
    }
  }, [projectId, propTasks]);

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks/project/${projectId}`);
      setLocalTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t._id === draggableId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    const url = `/tasks/${draggableId}/status`;
    console.log("Calling PATCH:", url, { status: newStatus });
    try {
      await API.patch(url, { status: newStatus });
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("PATCH Failed:", error.response?.status, error.message);
      console.error("Failed to update status:", error);
      fetchTasks(); // Rollback
    }
  };

  const updateStatus = async (taskId, newStatus) => {
    const url = `/tasks/${taskId}/status`;
    console.log("Calling PATCH (Button):", url, { status: newStatus });
    try {
      await API.patch(url, { status: newStatus });
      fetchTasks();
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error("PATCH (Button) Failed:", error.response?.status, error.message);
      alert("Failed to update status");
    }
  };

  if (!projectId) return <div className="kanban-empty">Please select a project to view tasks.</div>;
  if (loading) return <div className="kanban-loading">Syncing board...</div>;

  return (
    <div className="kanban-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-grid">
          {Object.values(COLUMNS).map((column) => (
            <div key={column.id} className="kanban-column">
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="count">{tasks.filter(t => t.status === column.id).length}</span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`task-list ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                  >
                    {tasks
                      .filter((t) => t.status === column.id)
                      .map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-task-card ${snapshot.isDragging ? "dragging" : ""}`}
                            >
                              <div className="task-card-header">
                                <div className={`task-priority-tag ${task.priority?.toLowerCase() || 'medium'}`}>{task.priority || "Medium"}</div>
                                {((task.owner?._id || task.owner) === currentUserId || isManager) && onDeleteTask && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteTask(task._id);
                                    }} 
                                    className="task-delete-btn" 
                                    title="Delete Task"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                              <h4>{task.title}</h4>
                              
                              <div className="task-meta">
                                <div className="meta-item">
                                  <User size={14} />
                                  <span>{task.owner?.name?.split(" ")[0] || "Unassigned"}</span>
                                </div>
                                {task.dueDate && (
                                  <div className="meta-item">
                                    {getDeadlineBadge(task.dueDate)}
                                  </div>
                                )}
                              </div>

                              {((task.owner?._id || task.owner) === currentUserId) && (
                                <div className="task-actions">
                                  {task.status !== "To Do" && (
                                    <button onClick={() => updateStatus(task._id, "To Do")} className="status-btn todo">To Do</button>
                                  )}
                                  {task.status !== "In Progress" && (
                                    <button onClick={() => updateStatus(task._id, "In Progress")} className="status-btn progress">Progress</button>
                                  )}
                                  {task.status !== "Done" && (
                                    <button onClick={() => updateStatus(task._id, "Done")} className="status-btn done">Done</button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
