require("dotenv").config();
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file");
}
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Import Route Files
const activityRoutes = require("./src/routes/activityRoutes");
const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const milestoneRoutes = require("./src/routes/milestoneRoutes");
const reflectionRoutes = require("./src/routes/reflectionRoutes");
const studentRoutes = require("./src/routes/studentRoutes");
const userRoutes = require("./src/routes/userRoutes");
const facultyReflectionRoutes = require("./src/routes/facultyReflectionRoutes");
const submissionRoutes = require("./src/routes/submissionRoutes");
const facultyRoutes = require("./src/routes/facultyRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: "/socket.io/",
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["websocket", "polling"]
});

app.set('io', io);


// Socket.io Connection
io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("join_project", (projectId) => {
    socket.join(projectId);
    console.log(`User ${socket.id} joined project ${projectId}`);
  });

  socket.on("send_message", async (data) => {
    // data: { project, sender, message, senderName }
    try {
      const Chat = require("./models/Chat");
      const newMessage = new Chat({
        project: data.project,
        sender: data.sender,
        message: data.message,
      });
      await newMessage.save();

      io.to(data.project).emit("receive_message", {
        ...data,
        _id: newMessage._id,
        timestamp: newMessage.createdAt,
      });
    } catch (err) {
      console.error("Error saving chat:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/progresslens")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error: ", err));

/**
 * API Routes
 */
app.use("/api/student", studentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/milestones", milestoneRoutes); 
app.use("/api/activity", activityRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/reflections", reflectionRoutes);
app.use("/api/faculty-reflections", facultyReflectionRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});