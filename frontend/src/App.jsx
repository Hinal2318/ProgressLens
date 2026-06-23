import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Page Imports
import Auth from "./pages/auth"; 
import Profile from "./pages/Profile";
import ProjectDetails from "./pages/ProjectDetails";
import Unauthorized from "./pages/Unauthorized";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import ProjectManager from "./pages/ProjectManager";
import StudentProjects from "./pages/StudentProjects";
import Activity from "./pages/Activity";
import FacultyHealth from "./pages/FacultyHealth";
import FacultyProfile from "./pages/FacultyProfile";
import FacultyReflections from "./pages/FacultyReflections";
import FacultyReviews from "./pages/FacultyReviews";
import FacultyProjects from "./pages/FacultyProjects";
import ProjectAnalytics from "./pages/ProjectAnalytics";

// Component & Layout Imports
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar"; // Student Sidebar
import FacultySidebar from "./components/FacultySidebar"; // Faculty Sidebar
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Style Imports
import "./App.css";
import "./index.css";
import FacultyProjectDetails from "./pages/FacultyProjectDetails";

function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  // Unified Auth paths
  const isAuthPage = ["/auth", "/login", "/register"].includes(location.pathname);

  if (!token && !isAuthPage) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      
      {token && !isAuthPage && <Navbar />}

      <div className={token && !isAuthPage ? "main-layout" : "auth-wrapper"}>
        <main className={token && !isAuthPage ? "content-area" : "auth-content"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ width: "100%", height: "100%" }}
            >
              <Routes location={location} key={location.pathname}>
                {/* 🏠 ROOT REDIRECT */}
                <Route 
                  path="/" 
                  element={
                    token 
                      ? <Navigate to={`/${role}/dashboard`} replace /> 
                      : <Navigate to="/auth" replace />
                  } 
                />

                {/* ===== CONSOLIDATED AUTH ===== */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/register" element={<Navigate to="/auth" replace />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* ===== STUDENT ROUTES ===== */}
                <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/projects" element={<ProtectedRoute role="student"><StudentProjects /></ProtectedRoute>} />
                <Route path="/student/projects/:id" element={<ProtectedRoute role="student"><ProjectDetails /></ProtectedRoute>} />
                <Route path="/project-manager" element={<ProtectedRoute role="student"><ProjectManager /></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute role="student"><Activity /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute role="student"><Profile /></ProtectedRoute>} />

                {/* ===== FACULTY ROUTES ===== */}
                <Route path="/faculty/dashboard" element={<ProtectedRoute role="faculty"><FacultyDashboard /></ProtectedRoute>} />
                <Route path="/faculty/projects" element={<ProtectedRoute role="faculty"><FacultyProjects /></ProtectedRoute>} />
                
                {/* PROJECT INTERACTION: Allows Faculty to access the Project Details page */}
                <Route path="/faculty/projects/:id" element={<ProtectedRoute role="faculty"><FacultyProjectDetails /></ProtectedRoute>} />
                
                <Route path="/faculty/review/:id" element={<ProtectedRoute role="faculty"><FacultyReviews /></ProtectedRoute>} />
                <Route path="/faculty/reviews" element={<ProtectedRoute role="faculty"><FacultyReviews /></ProtectedRoute>} />
                <Route path="/faculty/reflections" element={<ProtectedRoute role="faculty"><FacultyReflections /></ProtectedRoute>} />
                <Route path="/faculty/health" element={<ProtectedRoute role="faculty"><FacultyHealth /></ProtectedRoute>} />
                <Route path="/faculty/profile" element={<ProtectedRoute role="faculty"><FacultyProfile /></ProtectedRoute>} />
                
                {/* SHARED ANALYTICS */}
                <Route path="/project/:id/analytics" element={<ProjectAnalytics />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        {token && !isAuthPage && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;