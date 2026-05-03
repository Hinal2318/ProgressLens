import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import API from "../services/api";
import "./FacultyCalendar.css";

const localizer = momentLocalizer(moment);

export default function FacultyCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get("/faculty/supervised-projects");
      const projects = res.data;
      
      const formattedEvents = [];
      
      projects.forEach(project => {
        // Add project milestones to calendar
        if (project.milestones) {
          project.milestones.forEach(m => {
            formattedEvents.push({
              title: `[${project.title}] ${m.title}`,
              start: new Date(m.deadline),
              end: new Date(m.deadline),
              allDay: true,
              resource: project
            });
          });
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Calendar Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-page">
      <header className="page-header">
        <h1>Academic Calendar</h1>
        <p>Monitor all team deadlines and milestones</p>
      </header>

      <div className="calendar-container card">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: 'var(--accent-primary)',
              borderRadius: '6px',
              border: 'none'
            }
          })}
        />
      </div>
    </div>
  );
}
