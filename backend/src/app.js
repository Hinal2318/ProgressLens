const express = require("express");
const cors = require("cors"); 
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const reflectionRoutes = require("./routes/reflectionRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./src/routes/facultyRoutes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/student", studentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/faculty", facultyRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running");
});

module.exports = app;