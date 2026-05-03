 🎓 ProgressLens

ProgressLens is a full-stack academic project management platform designed for students and faculty. It enables real-time collaboration, structured project tracking, submission management, health monitoring, and insightful analytics — all in a single unified dashboard.

---

✨ Features

👨‍🎓 Student Features
 Dashboard — View project stats, progress charts, and broadcast announcements from faculty
Project Details— Deep-dive into tasks (Kanban board), milestones, submissions, and reflections
Team Chat— Real-time messaging with teammates using Socket.io (with full message history)
Activity Feed — Track all changes and actions on your projects
Profile Management — Update your personal information and view academic details

 👩‍🏫 Faculty Features
Faculty Dashboard— Monitor all supervised projects, student counts, pending reviews, and at-risk teams
Broadcast Announcements — Send general or deadline-based messages to all students instantly
Submission Review Center — Approve/reject student submissions with written feedback
Project Health Monitor — Track health status (On Track / Needs Attention / At Risk) across all teams
Faculty Reflections — Read and respond to student reflections per project
Analytics & PDF Export — View completion trend charts, departmental stats, and generate one-click PDF reports

---

🛠️ Tech Stack

| Layer | Technology |
|---|---|
|Frontend | React 19, Vite, Framer Motion, Recharts, Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Real-time | Socket.io (WebSocket chat & announcements) |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer (local storage via `/uploads`) |
| Styling | Vanilla CSS with CSS Variables (design tokens) |
| PDF Reports | jsPDF + jspdf-autotable |

---

📁 Project Structure


progresslens/
├── backend/
│   ├── models/          # Mongoose schemas (User, Project, Task, Milestone, Chat, etc.)
│   ├── src/
│   │   ├── controllers/ # Business logic per entity
│   │   ├── routes/      # Express route definitions
│   │   ├── middleware/  # Auth middleware (JWT protect)
│   │   └── services/    # Utility services
│   ├── uploads/         # Uploaded files (PDFs, docs)
│   └── server.js        # App entry point, Socket.io setup
│
└── frontend/
    └── src/
        ├── components/  # Navbar, Sidebar, ChatRoom, KanbanBoard, etc.
        ├── pages/       # All page components (Student & Faculty views)
        ├── services/    # Axios API instance
        └── index.css    # Global design tokens & base styles
```

